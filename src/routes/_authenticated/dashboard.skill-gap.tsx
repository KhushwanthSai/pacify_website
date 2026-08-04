import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, UploadCloud } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import { getLatestAnalysis } from "@/lib/analyze.functions";
import type { SkillGap } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/dashboard/skill-gap")({
  component: SkillGapPage,
});

/** Benchmark each radar axis is compared against, by product-company hiring bar. */
const TARGETS: Record<string, number> = {
  DSA: 88,
  "Web Dev": 70,
  Systems: 75,
  DevOps: 65,
  "AI / ML": 60,
  "Comm.": 75,
};

const PATH = [
  {
    phase: "Weeks 1-2",
    focus: "DSA polish — sliding window, trees, graphs",
    tag: "DSA",
  },
  {
    phase: "Weeks 3-4",
    focus: "System design primer — caching, queues, scaling",
    tag: "Systems",
  },
  {
    phase: "Weeks 5-6",
    focus: "AWS + Docker basics — deploy a real project",
    tag: "Cloud",
  },
  {
    phase: "Weeks 7-8",
    focus: "Mock interviews + behavioral STAR stories",
    tag: "Interview",
  },
];

type AnalysisSlice = {
  radar?: { axis: string; value: number }[];
  skill_gaps?: SkillGap[];
};

function SkillGapPage() {
  const fetchLatest = useServerFn(getLatestAnalysis);
  const [analysis, setAnalysis] = useState<AnalysisSlice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatest({})
      .then((r) => {
        const row = r as AnalysisSlice | null;
        setAnalysis(row?.radar?.length || row?.skill_gaps?.length ? row : null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-10 flex items-center gap-3 text-zinc-500">
        <Loader2 className="size-4 animate-spin" /> Loading your skill gaps…
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-6 md:p-10 max-w-3xl">
        <div className="p-8 rounded-2xl border border-brand-primary/30 bg-linear-to-br from-brand-primary/10 to-transparent">
          <div className="size-11 rounded-xl bg-brand-primary/15 border border-brand-primary/25 grid place-items-center mb-4">
            <UploadCloud className="size-5 text-brand-accent" />
          </div>
          <h1 className="font-display text-xl font-extrabold tracking-tight">
            No skill gap data yet
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            Your gaps are worked out from your resume and profile. Upload your
            resume and run an analysis to see them.
          </p>
          <Link
            to="/dashboard/profile"
            className="mt-5 inline-block px-5 py-2.5 rounded-xl bg-linear-to-r from-brand-primary to-brand-secondary text-white text-sm font-bold"
          >
            Upload resume &amp; analyse
          </Link>
        </div>
      </div>
    );
  }

  // Chart the student's own radar scores against the hiring benchmark.
  const skillLevels = (analysis.radar ?? []).map((r) => ({
    skill: r.axis,
    you: r.value,
    target: TARGETS[r.axis] ?? 70,
  }));
  const gaps = analysis.skill_gaps ?? [];

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl">
      <header>
        <p className="text-xs font-bold text-brand-accent uppercase tracking-widest mb-2">
          Skill Gap Map
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
          Where you are vs. where Tier-1 is.
        </h1>
        <p className="text-zinc-500 mt-2">
          Compared against the median profile that clears product-based loops.
        </p>
      </header>

      <section className="p-6 rounded-2xl bg-surface border border-border-subtle">
        <h3 className="font-display font-bold mb-4">
          You vs. Tier-1 benchmark
        </h3>
        <div className="h-80">
          <ResponsiveContainer>
            <BarChart
              data={skillLevels}
              margin={{ left: -20, right: 12, top: 8, bottom: 0 }}
            >
              <XAxis
                dataKey="skill"
                tick={{ fill: "oklch(0.65 0.02 280)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
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
                cursor={{ fill: "oklch(0.27 0.015 280 / 0.3)" }}
              />
              <Bar
                dataKey="target"
                fill="oklch(0.27 0.015 280)"
                radius={[6, 6, 0, 0]}
              />
              <Bar dataKey="you" radius={[6, 6, 0, 0]}>
                {skillLevels.map((d, i) => (
                  <Cell
                    key={i}
                    fill={
                      d.you >= d.target
                        ? "oklch(0.72 0.18 160)"
                        : "oklch(0.62 0.21 280)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 mt-4 text-xs text-zinc-500">
          <span className="flex items-center gap-2">
            <span className="size-2 rounded bg-brand-primary" /> You
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2 rounded bg-zinc-700" /> Tier-1 median
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2 rounded bg-emerald-400" /> At or above
          </span>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="p-6 rounded-2xl bg-surface border border-border-subtle">
          <h3 className="font-display font-bold mb-4">Missing skills</h3>
          <ul className="space-y-3">
            {gaps.map((g) => (
              <li
                key={g.skill}
                className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-lg border border-border-subtle"
              >
                <span className="text-sm font-medium">{g.skill}</span>
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
        </section>
        <section className="p-6 rounded-2xl bg-surface border border-border-subtle">
          <h3 className="font-display font-bold mb-4">
            Recommended learning path
          </h3>
          <ol className="relative border-l border-border-subtle ml-2 space-y-5">
            {PATH.map((p, i) => (
              <li key={i} className="ml-6">
                <span className="absolute -left-[7px] mt-1.5 size-3 rounded-full bg-brand-accent ring-4 ring-bg-main" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  {p.phase}
                </p>
                <p className="text-sm font-medium mt-1">{p.focus}</p>
                <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-accent border border-brand-primary/20">
                  {p.tag}
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
