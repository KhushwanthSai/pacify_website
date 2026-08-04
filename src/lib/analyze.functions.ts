import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

const AI_MODEL = "gemini-2.5-flash";

const SYSTEM = `You are Placify AI, a placement readiness analyst for university students.
Given a student profile, return a strict JSON object scoring them and estimating Company Fit Scores for hiring at top tech companies.
All score fields are integers 0-100. Skill gap severity is one of: critical, high, medium.
Company tiers: "Tier 1" (Google, Meta, Amazon, Microsoft, Apple, Netflix), "Tier 2" (Goldman Sachs, JP Morgan, Deloitte, Adobe, Walmart), "Service" (TCS, Infosys, Wipro, Cognizant, Capgemini, Accenture).
Radar axes must be exactly: DSA, Web Dev, Systems, DevOps, AI / ML, Comm.
Be realistic — do NOT inflate scores. A blank profile should score low. Output ONLY valid JSON, no markdown.`;

function fallback(): AIResult {
  return {
    readiness_score: 40,
    resume_score: 40,
    ats_score: 50,
    technical_score: 40,
    communication_score: 50,
    github_score: 30,
    linkedin_score: 30,
    summary:
      "Add more details to your profile to unlock a meaningful analysis.",
    strengths: [],
    weaknesses: ["Profile is sparse"],
    skill_gaps: [
      { skill: "Add projects", severity: "critical" },
      { skill: "Add GitHub link", severity: "high" },
    ],
    company_fit: [
      { name: "TCS", score: 60, tier: "Service" },
      { name: "Infosys", score: 58, tier: "Service" },
      { name: "Amazon", score: 25, tier: "Tier 1" },
      { name: "Google", score: 20, tier: "Tier 1" },
    ],
    radar: [
      { axis: "DSA", value: 40 },
      { axis: "Web Dev", value: 40 },
      { axis: "Systems", value: 30 },
      { axis: "DevOps", value: 25 },
      { axis: "AI / ML", value: 30 },
      { axis: "Comm.", value: 50 },
    ],
  };
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
    const { data: resumes } = await supabase
      .from("resumes")
      .select("file_name")
      .eq("user_id", userId);

    const userPayload = {
      profile: profile ?? {},
      resumes: (resumes ?? []).map((r) => r.file_name),
    };

    // Without a key — or with AI switched off in the admin settings — the app
    // still works, returning the neutral baseline from fallback() instead of a
    // model-generated analysis.
    const { getServerSettings } = await import("./settings.server");
    const settings = await getServerSettings();

    const apiKey = process.env.GEMINI_API_KEY;
    let result: AIResult;

    if (!apiKey || !settings.ai_enabled) {
      result = fallback();
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
                  parts: [
                    {
                      text: `Analyze this student profile and return JSON only:\n${JSON.stringify(userPayload)}`,
                    },
                  ],
                },
              ],
              generationConfig: { responseMimeType: "application/json" },
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

    const clamp = (n: unknown) => {
      const v = typeof n === "number" ? n : Number(n);
      if (!Number.isFinite(v)) return 0;
      return Math.max(0, Math.min(100, Math.round(v)));
    };
    result.readiness_score = clamp(result.readiness_score);
    result.resume_score = clamp(result.resume_score);
    result.ats_score = clamp(result.ats_score);
    result.technical_score = clamp(result.technical_score);
    result.communication_score = clamp(result.communication_score);
    result.github_score = clamp(result.github_score);
    result.linkedin_score = clamp(result.linkedin_score);
    result.strengths = result.strengths ?? [];
    result.weaknesses = result.weaknesses ?? [];
    result.skill_gaps = result.skill_gaps ?? [];
    result.company_fit = result.company_fit ?? [];
    result.radar = result.radar ?? [];
    result.summary = result.summary ?? "";

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
