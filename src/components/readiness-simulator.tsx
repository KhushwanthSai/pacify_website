import { useState } from "react";
import { Check } from "lucide-react";
import { useCountUp } from "@/lib/motion";

/**
 * The hero's interactive piece: toggle the evidence a recruiter actually looks
 * for and watch readiness move.
 *
 * The arithmetic is local, visible, and deliberately simple — this demonstrates
 * *what* the product weighs, without pretending to be the real analysis. The
 * real score comes from a model reading your actual resume.
 */

type Credential = {
  id: string;
  label: string;
  detail: string;
  points: number;
};

const CREDENTIALS: Credential[] = [
  {
    id: "cgpa",
    label: "CGPA above 8.0",
    detail: "Clears most eligibility filters",
    points: 10,
  },
  {
    id: "dsa",
    label: "500+ DSA problems",
    detail: "Enough volume to survive a coding round",
    points: 16,
  },
  {
    id: "project",
    label: "A project with real users",
    detail: "Shipped, not just submitted",
    points: 14,
  },
  {
    id: "oss",
    label: "Open-source contributions",
    detail: "Merged work in someone else's codebase",
    points: 12,
  },
  {
    id: "intern",
    label: "Internship with measured impact",
    detail: "A number attached to what you changed",
    points: 18,
  },
];

const BASE = 28;

function band(score: number) {
  if (score >= 80)
    return {
      label: "Job ready",
      tone: "text-emerald-400",
      bar: "bg-emerald-400",
    };
  if (score >= 60)
    return {
      label: "Nearly ready",
      tone: "text-brand-accent",
      bar: "bg-brand-accent",
    };
  if (score >= 40)
    return { label: "Developing", tone: "text-amber-400", bar: "bg-amber-400" };
  return { label: "Early stage", tone: "text-red-400", bar: "bg-red-400" };
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function ReadinessSimulator() {
  const [on, setOn] = useState<Set<string>>(new Set(["cgpa"]));

  const raw =
    BASE +
    CREDENTIALS.reduce((sum, c) => (on.has(c.id) ? sum + c.points : sum), 0);
  const target = clamp(raw);
  const score = useCountUp(target, 700);
  const b = band(score);

  const fit = [
    {
      name: "Google · Amazon",
      tier: "Tier 1",
      value: clamp(target * 1.15 - 30),
    },
    {
      name: "Adobe · JP Morgan",
      tier: "Tier 2",
      value: clamp(target * 1.05 - 10),
    },
    { name: "TCS · Infosys", tier: "Service", value: clamp(target * 0.6 + 38) },
  ];

  function toggle(id: string) {
    setOn((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="mt-14 max-w-3xl mx-auto text-left">
      <div className="rounded-2xl border border-border-subtle bg-surface/80 backdrop-blur p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Try it — what moves a score
            </p>
            <p className="text-sm text-zinc-400 mt-1 max-w-sm">
              Tick what you have. This is a simplified model of what the
              analysis looks for.
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="font-display text-5xl font-black tabular-nums leading-none">
              {score}
              <span className="text-zinc-600 text-2xl">/100</span>
            </div>
            <p
              className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${b.tone}`}
            >
              {b.label}
            </p>
          </div>
        </div>

        <div className="mt-6 h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none ${b.bar}`}
            style={{ width: `${score}%` }}
          />
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-2">
          {CREDENTIALS.map((c) => {
            const active = on.has(c.id);
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(c.id)}
                className={`group text-left p-3 rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent ${
                  active
                    ? "border-brand-primary/50 bg-brand-primary/10"
                    : "border-border-subtle bg-zinc-900/40 hover:border-zinc-600"
                }`}
              >
                <span className="flex items-start gap-2.5">
                  <span
                    className={`mt-0.5 size-4 rounded shrink-0 grid place-items-center border transition-colors ${
                      active
                        ? "bg-brand-primary border-brand-primary"
                        : "border-zinc-600 group-hover:border-zinc-500"
                    }`}
                  >
                    {active && <Check className="size-3 text-white" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold leading-tight">
                      {c.label}
                    </span>
                    <span className="block text-xs text-zinc-500 mt-0.5">
                      {c.detail}
                    </span>
                  </span>
                  <span className="ml-auto text-xs font-bold text-zinc-600 tabular-nums shrink-0">
                    +{c.points}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-border-subtle space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Where that lands you
          </p>
          {fit.map((f) => (
            <div key={f.name}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-zinc-300">
                  {f.name} <span className="text-zinc-600">· {f.tier}</span>
                </span>
                <span className="text-zinc-400 tabular-nums">{f.value}%</span>
              </div>
              <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-linear-to-r from-brand-primary to-brand-accent transition-[width] duration-700 ease-out motion-reduce:transition-none"
                  style={{ width: `${f.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs text-zinc-600 text-center">
        A simplified illustration. Your real score comes from a model reading
        your actual resume.
      </p>
    </div>
  );
}
