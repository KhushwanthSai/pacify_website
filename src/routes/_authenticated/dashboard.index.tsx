import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from "recharts";
import { CONTRIB_DATA, type CompanyFit, type SkillGap } from "@/lib/mock-data";
import { useServerFn } from "@tanstack/react-start";
import { getLatestAnalysis } from "@/lib/analyze.functions";
import { Loader2, UploadCloud, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: ReadinessPage,
});

/** Zeroed radar so the chart keeps its shape before the first analysis. */
const EMPTY_RADAR = [
  { axis: "DSA", value: 0 },
  { axis: "Web Dev", value: 0 },
  { axis: "Systems", value: 0 },
  { axis: "DevOps", value: 0 },
  { axis: "AI / ML", value: 0 },
  { axis: "Comm.", value: 0 },
];

/**
 * Readiness band shown under the headline score. `analysed` is passed
 * separately from the score: a real analysis can legitimately come back at 0,
 * and that is not the same as never having run one.
 */
function readinessLabel(score: number, analysed: boolean): string {
  if (!analysed) return "No analysis yet";
  if (score >= 80) return "Job Ready · Highly Competitive";
  if (score >= 60) return "Nearly Ready · Some Gaps";
  if (score >= 40) return "Developing · Notable Gaps";
  if (score > 0) return "Early Stage · Significant Gaps";
  return "Analysis could not be scored";
}

/**
 * The subset of an `analyses` row this page reads. The row's JSON columns come
 * back untyped from Supabase, so they're narrowed once at the fetch boundary
 * rather than being threaded through as `any`.
 */
type Analysis = {
  readiness_score: number;
  resume_score: number;
  ats_score: number;
  github_score: number;
  linkedin_score: number;
  summary?: string | null;
  radar?: { axis: string; value: number }[];
  skill_gaps?: SkillGap[];
  company_fit?: CompanyFit[];
};

function ReadinessPage() {
  const fetchLatest = useServerFn(getLatestAnalysis);
  const [a, setA] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatest({})
      .then((r) => {
        setA(r as Analysis | null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Everything reads zero until a real analysis exists. Showing sample numbers
  // here is indistinguishable from a genuine result to the student.
  const scores = a ?? {
    readiness_score: 0,
    resume_score: 0,
    ats_score: 0,
    github_score: 0,
    linkedin_score: 0,
  };
  const radar = a?.radar?.length ? a.radar : EMPTY_RADAR;
  const gaps = a?.skill_gaps?.length ? a.skill_gaps : [];
  const companyFit = a?.company_fit?.length ? a.company_fit : [];
  const top = companyFit.slice(0, 6);

  if (loading) {
    return (
      <div className="p-10 flex items-center gap-3 text-zinc-500">
        <Loader2 className="size-4 animate-spin" /> Loading your latest
        analysis…
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl">
      {!a && (
        <div className="p-6 md:p-8 rounded-2xl border border-brand-primary/30 bg-linear-to-br from-brand-primary/10 to-transparent">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-xl">
              <div className="size-11 rounded-xl bg-brand-primary/15 border border-brand-primary/25 grid place-items-center mb-4">
                <UploadCloud className="size-5 text-brand-accent" />
              </div>
              <h2 className="font-display text-xl font-extrabold tracking-tight">
                Upload your resume to get started
              </h2>
              <p className="text-sm text-zinc-400 mt-2">
                Every score below is zero because you haven&apos;t been analysed
                yet. Upload your resume and we&apos;ll read it to work out your
                readiness, company fit, and skill gaps.
              </p>
              <Link
                to="/dashboard/profile"
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-brand-primary to-brand-secondary text-white text-sm font-bold"
              >
                <Sparkles className="size-4" />
                Upload resume &amp; analyse
              </Link>
            </div>
          </div>
        </div>
      )}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-brand-accent uppercase tracking-widest mb-2">
            Placement Readiness
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
            {a ? "Your latest AI snapshot" : "No analysis yet"}
          </h1>
          <p className="text-zinc-500 mt-2">
            {a?.summary ??
              "Your readiness across resume, GitHub, LinkedIn, and target companies will appear here once you run an analysis."}
          </p>
        </div>
        <div className="text-right">
          <div className="text-5xl font-black font-display">
            {scores.readiness_score}
            <span className="text-zinc-600 text-2xl">/100</span>
          </div>
          <p
            className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${
              a ? "text-emerald-400" : "text-zinc-600"
            }`}
          >
            {readinessLabel(scores.readiness_score, Boolean(a))}
          </p>
        </div>
      </header>

      {/* Score cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: "Resume", v: scores.resume_score },
          { l: "ATS", v: scores.ats_score },
          { l: "GitHub", v: scores.github_score },
          { l: "LinkedIn", v: scores.linkedin_score },
        ].map((c) => (
          <div
            key={c.l}
            className="p-5 rounded-2xl bg-surface border border-border-subtle"
          >
            <p className="text-xs font-medium text-zinc-500 mb-2">
              {c.l} Score
            </p>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-black font-display">{c.v}</span>
              <span className="text-xs text-zinc-600 mb-1">/100</span>
            </div>
            <div className="mt-3 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-brand-primary to-brand-accent"
                style={{ width: `${c.v}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-surface border border-border-subtle">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold">Capability Radar</h3>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              vs. Job-Ready band
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <RadarChart data={radar}>
                <PolarGrid stroke="oklch(0.27 0.015 280)" />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fill: "oklch(0.65 0.02 280)", fontSize: 11 }}
                />
                <PolarRadiusAxis
                  tick={false}
                  axisLine={false}
                  domain={[0, 100]}
                />
                <Radar
                  dataKey="value"
                  stroke="oklch(0.62 0.21 280)"
                  fill="oklch(0.62 0.21 280)"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gaps */}
        <div className="p-6 rounded-2xl bg-surface border border-border-subtle">
          <h3 className="font-display font-bold mb-4 flex items-center gap-2">
            <span className="size-1.5 bg-amber-400 rounded-full animate-pulse" />
            Critical Skill Gaps
          </h3>
          {gaps.length === 0 && (
            <p className="text-sm text-zinc-600">
              Your skill gaps appear here after your first analysis.
            </p>
          )}
          <ul className="space-y-3">
            {gaps.map((g: SkillGap) => (
              <li
                key={g.skill}
                className="flex items-center justify-between text-sm"
              >
                <span>{g.skill}</span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    g.severity === "critical"
                      ? "bg-red-400/10 text-red-400 border border-red-400/20"
                      : g.severity === "high"
                        ? "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                  }`}
                >
                  {g.severity}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Company fit + contribution chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-surface border border-border-subtle">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold">Top Company Fit</h3>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              AI estimate
            </span>
          </div>
          {top.length === 0 && (
            <p className="text-sm text-zinc-600">
              Company fit scores appear here after your first analysis.
            </p>
          )}
          <div className="space-y-4">
            {top.map((c: CompanyFit, i: number) => (
              <div key={c.name}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-zinc-400">{c.score}%</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${i % 3 === 0 ? "bg-brand-accent" : i % 3 === 1 ? "bg-brand-primary" : "bg-brand-secondary"}`}
                    style={{ width: `${c.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-surface border border-border-subtle">
          {/* No GitHub integration exists yet, so this chart is illustrative.
              It is labelled as such rather than passing for real activity. */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold">GitHub Activity</h3>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500">
              Sample
            </span>
          </div>
          <div className="h-48">
            <ResponsiveContainer>
              <AreaChart
                data={CONTRIB_DATA}
                margin={{ left: -20, right: 0, top: 8, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="oklch(0.82 0.16 200)"
                      stopOpacity={0.6}
                    />
                    <stop
                      offset="100%"
                      stopColor="oklch(0.82 0.16 200)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  tick={{ fill: "oklch(0.55 0.02 280)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.185 0.014 280)",
                    border: "1px solid oklch(0.27 0.015 280)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "oklch(0.7 0.02 280)" }}
                />
                <Area
                  type="monotone"
                  dataKey="commits"
                  stroke="oklch(0.82 0.16 200)"
                  fill="url(#g1)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <p className="text-xs text-zinc-600 italic">
        Company Fit Scores are AI-generated estimates from your profile signal.
        They are guidance, not hiring guarantees.
      </p>
    </div>
  );
}
