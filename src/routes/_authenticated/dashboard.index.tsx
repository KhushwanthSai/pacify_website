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
import {
  COMPANY_FIT,
  RADAR_DATA,
  SCORES,
  CONTRIB_DATA,
  SKILL_GAPS,
  type CompanyFit,
  type SkillGap,
} from "@/lib/mock-data";
import { useServerFn } from "@tanstack/react-start";
import { getLatestAnalysis } from "@/lib/analyze.functions";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: ReadinessPage,
});

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

  const scores = a ?? {
    readiness_score: SCORES.readiness,
    resume_score: SCORES.resume,
    ats_score: SCORES.ats,
    github_score: SCORES.github,
    linkedin_score: SCORES.linkedin,
  };
  const radar = a?.radar?.length ? a.radar : RADAR_DATA;
  const gaps = a?.skill_gaps?.length ? a.skill_gaps : SKILL_GAPS;
  const companyFit = a?.company_fit?.length ? a.company_fit : COMPANY_FIT;
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
        <div className="p-4 rounded-xl border border-amber-400/30 bg-amber-400/5 text-sm flex flex-wrap items-center justify-between gap-3">
          <span className="text-amber-200">
            No analysis yet — showing sample data.
          </span>
          <Link
            to="/dashboard/profile"
            className="px-3 py-1.5 rounded-lg bg-amber-400 text-black text-xs font-bold"
          >
            Run analysis
          </Link>
        </div>
      )}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-brand-accent uppercase tracking-widest mb-2">
            Placement Readiness
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
            {a?.summary
              ? "Your latest AI snapshot"
              : "Hello — you're tracking well."}
          </h1>
          <p className="text-zinc-500 mt-2">
            {a?.summary ??
              "Snapshot of your AI-generated readiness across resume, GitHub, LinkedIn, and target companies."}
          </p>
        </div>
        <div className="text-right">
          <div className="text-5xl font-black font-display">
            {scores.readiness_score}
            <span className="text-zinc-600 text-2xl">/100</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mt-1">
            Job Ready · Highly Competitive
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
          <h3 className="font-display font-bold mb-4">GitHub Activity</h3>
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
