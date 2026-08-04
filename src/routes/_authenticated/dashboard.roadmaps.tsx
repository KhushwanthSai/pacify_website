import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ROADMAPS } from "@/lib/mock-data";
import { Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/roadmaps")({
  component: RoadmapsPage,
});

function RoadmapsPage() {
  const companies = Object.keys(ROADMAPS);
  const [active, setActive] = useState(companies[0]);
  const roadmap = ROADMAPS[active];
  return (
    <div className="p-6 md:p-10 space-y-8 max-w-6xl">
      <header>
        <p className="text-xs font-bold text-brand-accent uppercase tracking-widest mb-2">
          Roadmaps
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
          Prep sprints by company
        </h1>
        <p className="text-zinc-500 mt-2">
          Standard 4-week plans for common target companies. Pair them with your
          skill gap map to decide where to start.
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        {companies.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
              active === c
                ? "bg-brand-primary text-white border-brand-primary"
                : "bg-zinc-900/50 text-zinc-400 border-border-subtle hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <section className="p-6 md:p-8 rounded-2xl bg-surface border border-border-subtle">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-extrabold">
            {roadmap.title}
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">
            ~10 hrs / week
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roadmap.weeks.map((w, i) => (
            <div
              key={w.week}
              className="p-5 rounded-xl bg-zinc-900/40 border border-border-subtle"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold">{w.week}</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Sprint {i + 1}
                </span>
              </div>
              <ul className="space-y-2">
                {w.items.map((it) => (
                  <li
                    key={it}
                    className="flex items-start gap-2 text-sm text-zinc-300"
                  >
                    <span className="size-4 mt-0.5 rounded bg-brand-primary/15 border border-brand-primary/30 grid place-items-center shrink-0">
                      <Check className="size-3 text-brand-accent" />
                    </span>
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
