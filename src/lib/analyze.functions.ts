import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

type AIResult = {
  readiness_score: number;
  resume_score: number;
  ats_score: number;
  technical_score: number;
  communication_score: number;
  github_score: number;
  linkedin_score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  skill_gaps: { skill: string; severity: "critical" | "high" | "medium" }[];
  company_fit: {
    name: string;
    score: number;
    tier: "Tier 1" | "Tier 2" | "Service";
  }[];
  radar: { axis: string; value: number }[];
};

// Alias that tracks the current Flash model. Pinned versions get retired —
// `gemini-2.5-flash` is already rejected for newly created API keys, and
// `gemini-2.0-flash` has a free-tier quota of zero.
const AI_MODEL = "gemini-flash-latest";

/**
 * Enforced by the API, not just requested in the prompt.
 *
 * Without this the model picks its own key names — an earlier version asked
 * for "score fields" without naming them and got `ats_score` right while
 * silently dropping `readiness_score`, `resume_score`, `github_score` and
 * `linkedin_score`, which then read as 0 on the dashboard.
 */
const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    readiness_score: { type: "integer" },
    resume_score: { type: "integer" },
    ats_score: { type: "integer" },
    technical_score: { type: "integer" },
    communication_score: { type: "integer" },
    github_score: { type: "integer" },
    linkedin_score: { type: "integer" },
    summary: { type: "string" },
    strengths: { type: "array", items: { type: "string" } },
    weaknesses: { type: "array", items: { type: "string" } },
    skill_gaps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          skill: { type: "string" },
          severity: { type: "string", enum: ["critical", "high", "medium"] },
        },
        required: ["skill", "severity"],
      },
    },
    company_fit: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          score: { type: "integer" },
          tier: { type: "string", enum: ["Tier 1", "Tier 2", "Service"] },
        },
        required: ["name", "score", "tier"],
      },
    },
    radar: {
      type: "array",
      items: {
        type: "object",
        properties: {
          axis: {
            type: "string",
            enum: ["DSA", "Web Dev", "Systems", "DevOps", "AI / ML", "Comm."],
          },
          value: { type: "integer" },
        },
        required: ["axis", "value"],
      },
    },
  },
  required: [
    "readiness_score",
    "resume_score",
    "ats_score",
    "technical_score",
    "communication_score",
    "github_score",
    "linkedin_score",
    "summary",
    "strengths",
    "weaknesses",
    "skill_gaps",
    "company_fit",
    "radar",
  ],
} as const;

const SYSTEM = `You are Placify AI, a placement readiness analyst for university students.
Given a student profile, return a strict JSON object scoring them and estimating Company Fit Scores for hiring at top tech companies.

Every score is an integer 0-100:
- readiness_score: overall placement readiness, the headline number
- resume_score: quality, structure and impact of the resume itself
- ats_score: how well it parses through applicant tracking systems
- technical_score: depth of technical skill shown
- communication_score: clarity of writing and evidence of communication
- github_score: strength of GitHub/open-source evidence (0 if none is given)
- linkedin_score: strength of the LinkedIn profile (0 if none is given)

Skill gap severity is one of: critical, high, medium.
Company tiers: "Tier 1" (Google, Meta, Amazon, Microsoft, Apple, Netflix), "Tier 2" (Goldman Sachs, JP Morgan, Deloitte, Adobe, Walmart), "Service" (TCS, Infosys, Wipro, Cognizant, Capgemini, Accenture).
Radar axes must be exactly: DSA, Web Dev, Systems, DevOps, AI / ML, Comm.

Ground every score in evidence you can actually see in the resume and profile.
Do NOT inflate. A sparse resume with no projects, internships or measurable
impact should score low. Reserve scores above 80 for genuinely strong evidence.
Quote concrete details from the resume in the summary, strengths and weaknesses
so the student can tell the analysis actually read their document.

Output ONLY valid JSON, no markdown.`;

/**
 * Used when the model cannot be reached — no API key, AI disabled by an admin,
 * or the request failed.
 *
 * Every score is zero on purpose. Inventing plausible-looking numbers here
 * would be indistinguishable from a real analysis to the student, so the
 * absence of a result is reported as an absence.
 */
function fallback(reason = "AI analysis is currently unavailable"): AIResult {
  return {
    readiness_score: 0,
    resume_score: 0,
    ats_score: 0,
    technical_score: 0,
    communication_score: 0,
    github_score: 0,
    linkedin_score: 0,
    summary: `${reason}. No scores were generated — these are not real results. Try again later.`,
    strengths: [],
    weaknesses: [],
    skill_gaps: [],
    company_fit: [],
    radar: [
      { axis: "DSA", value: 0 },
      { axis: "Web Dev", value: 0 },
      { axis: "Systems", value: 0 },
      { axis: "DevOps", value: 0 },
      { axis: "AI / ML", value: 0 },
      { axis: "Comm.", value: 0 },
    ],
  };
}

/** What we managed to extract from the stored resume file. */
type ResumeContent =
  | { kind: "pdf"; base64: string }
  | { kind: "text"; text: string }
  | { kind: "unreadable"; reason: string };

const MIME_BY_EXT: Record<string, string> = {
  pdf: "application/pdf",
  txt: "text/plain",
};

/**
 * Downloads the resume from private storage and turns it into something the
 * model can read. Gemini accepts PDFs directly as inline data, so those go
 * through byte-for-byte; plain text is decoded. DOC/DOCX are binary formats
 * Gemini cannot parse, so they degrade to a note rather than garbage input.
 */
async function readResume(
  supabase: SupabaseClient<Database>,
  filePath: string,
): Promise<ResumeContent> {
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";

  try {
    const { data, error } = await supabase.storage
      .from("resumes")
      .download(filePath);
    if (error || !data) {
      return { kind: "unreadable", reason: "the file could not be downloaded" };
    }

    const buffer = Buffer.from(await data.arrayBuffer());

    if (MIME_BY_EXT[ext] === "application/pdf") {
      return { kind: "pdf", base64: buffer.toString("base64") };
    }
    if (MIME_BY_EXT[ext] === "text/plain") {
      return { kind: "text", text: buffer.toString("utf8").slice(0, 100_000) };
    }
    return {
      kind: "unreadable",
      reason: `.${ext} files cannot be read automatically — upload a PDF or TXT for a resume-based score`,
    };
  } catch {
    return { kind: "unreadable", reason: "the file could not be read" };
  }
}

/* ── Response sanitisers ──────────────────────────────────────────────────
 * The model returns free-form JSON. These drop anything malformed so only
 * well-shaped data reaches the database and the charts.
 * ─────────────────────────────────────────────────────────────────────── */

const SEVERITIES = ["critical", "high", "medium"] as const;
const TIERS = ["Tier 1", "Tier 2", "Service"] as const;
const RADAR_AXES = [
  "DSA",
  "Web Dev",
  "Systems",
  "DevOps",
  "AI / ML",
  "Comm.",
] as const;

function score(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function stringList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string" && x.length > 0);
}

function sanitizeSkillGaps(v: unknown): AIResult["skill_gaps"] {
  if (!Array.isArray(v)) return [];
  return v.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const { skill, severity } = item as Record<string, unknown>;
    if (typeof skill !== "string" || !skill) return [];
    const sev = SEVERITIES.includes(severity as (typeof SEVERITIES)[number])
      ? (severity as (typeof SEVERITIES)[number])
      : "medium";
    return [{ skill, severity: sev }];
  });
}

function sanitizeCompanyFit(v: unknown): AIResult["company_fit"] {
  if (!Array.isArray(v)) return [];
  return v.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const { name, score: s, tier } = item as Record<string, unknown>;
    if (typeof name !== "string" || !name) return [];
    const t = TIERS.includes(tier as (typeof TIERS)[number])
      ? (tier as (typeof TIERS)[number])
      : "Service";
    return [{ name, score: score(s), tier: t }];
  });
}

function sanitizeRadar(v: unknown): AIResult["radar"] {
  const byAxis = new Map<string, number>();
  if (Array.isArray(v)) {
    for (const item of v) {
      if (!item || typeof item !== "object") continue;
      const { axis, value } = item as Record<string, unknown>;
      if (typeof axis === "string") byAxis.set(axis, score(value));
    }
  }
  // Always return all six axes so the radar chart keeps its shape.
  return RADAR_AXES.map((axis) => ({ axis, value: byAxis.get(axis) ?? 0 }));
}

/**
 * Builds the Gemini request parts. A PDF resume is attached as inline data so
 * the model reads the real document; text is inlined directly.
 */
function buildPromptParts(
  payload: Record<string, unknown>,
  resume: ResumeContent,
): Record<string, unknown>[] {
  const parts: Record<string, unknown>[] = [
    {
      text: `Analyse this student and return JSON only.\n\nProfile data:\n${JSON.stringify(payload)}`,
    },
  ];

  if (resume.kind === "pdf") {
    parts.push({
      text: "\nTheir resume is attached. Base the resume, ATS, and technical scores on its actual contents.",
    });
    parts.push({
      inlineData: { mimeType: "application/pdf", data: resume.base64 },
    });
  } else if (resume.kind === "text") {
    parts.push({
      text: `\nTheir resume text follows. Base the resume, ATS, and technical scores on its actual contents.\n\n--- RESUME ---\n${resume.text}\n--- END RESUME ---`,
    });
  } else {
    parts.push({
      text: `\nNote: their resume could not be read (${resume.reason}). Score the resume and ATS dimensions conservatively and say so in the summary.`,
    });
  }

  return parts;
}

export const analyzeProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    // The newest resume is the one analysed.
    const { data: resumes } = await supabase
      .from("resumes")
      .select("file_name, file_path")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    const resume = resumes?.[0];
    if (!resume) {
      throw new Error(
        "Upload a resume before running an analysis — the score is based on it.",
      );
    }

    const resumeContent = await readResume(supabase, resume.file_path);

    const userPayload = {
      profile: profile ?? {},
      resume_file: resume.file_name,
    };

    const { getServerSettings } = await import("./settings.server");
    const settings = await getServerSettings();

    const apiKey = process.env.GEMINI_API_KEY;
    let result: AIResult;

    if (!apiKey) {
      result = fallback("AI analysis is not configured (no GEMINI_API_KEY)");
    } else if (!settings.ai_enabled) {
      result = fallback("AI analysis has been turned off by an administrator");
    } else {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${settings.ai_model || AI_MODEL}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey,
            },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: SYSTEM }] },
              contents: [
                {
                  role: "user",
                  parts: buildPromptParts(userPayload, resumeContent),
                },
              ],
              generationConfig: {
                responseMimeType: "application/json",
                responseSchema: RESPONSE_SCHEMA,
              },
            }),
          },
        );
        if (!res.ok)
          throw new Error(`Gemini API ${res.status}: ${await res.text()}`);
        const json = await res.json();
        const content = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!content) throw new Error("Empty AI response");
        const parsed = JSON.parse(content) as Partial<AIResult>;
        result = { ...fallback(), ...parsed } as AIResult;
      } catch (err) {
        console.error("AI analyze failed:", err);
        result = fallback();
      }
    }

    result.readiness_score = score(result.readiness_score);
    result.resume_score = score(result.resume_score);
    result.ats_score = score(result.ats_score);
    result.technical_score = score(result.technical_score);
    result.communication_score = score(result.communication_score);
    result.github_score = score(result.github_score);
    result.linkedin_score = score(result.linkedin_score);

    // The model is free-form JSON, not a guaranteed schema. Anything that does
    // not match the expected shape is dropped here — otherwise a malformed
    // array is written to the database and the dashboard crashes reading it.
    result.strengths = stringList(result.strengths);
    result.weaknesses = stringList(result.weaknesses);
    result.skill_gaps = sanitizeSkillGaps(result.skill_gaps);
    result.company_fit = sanitizeCompanyFit(result.company_fit);
    result.radar = sanitizeRadar(result.radar);
    result.summary = typeof result.summary === "string" ? result.summary : "";

    const { data: saved, error } = await supabase
      .from("analyses")
      .insert({
        user_id: userId,
        readiness_score: result.readiness_score,
        resume_score: result.resume_score,
        ats_score: result.ats_score,
        technical_score: result.technical_score,
        communication_score: result.communication_score,
        github_score: result.github_score,
        linkedin_score: result.linkedin_score,
        summary: result.summary,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        skill_gaps: result.skill_gaps,
        company_fit: result.company_fit,
        radar: result.radar,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return saved;
  });

export const getLatestAnalysis = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("analyses")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data;
  });
