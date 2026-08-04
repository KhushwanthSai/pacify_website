import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, UploadCloud } from "lucide-react";
import { getLatestAnalysis } from "@/lib/analyze.functions";
import type { CompanyFit } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/dashboard/company-fit")({
  component: CompanyFitPage,
});

function CompanyFitPage() {
  const fetchLatest = useServerFn(getLatestAnalysis);
  const [fit, setFit] = useState<CompanyFit[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatest({})
      .then((r) => {
        const row = r as { company_fit?: CompanyFit[] } | null;
        setFit(row?.company_fit?.length ? row.company_fit : null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-10 flex items-center gap-3 text-zinc-500">
        <Loader2 className="size-4 animate-spin" /> Loading your company fit…
      </div>
    );
  }

  if (!fit) {
    return (
      <div className="p-6 md:p-10 max-w-3xl">
        <div className="p-8 rounded-2xl border border-brand-primary/30 bg-linear-to-br from-brand-primary/10 to-transparent">
          <div className="size-11 rounded-xl bg-brand-primary/15 border border-brand-primary/25 grid place-items-center mb-4">
            <UploadCloud className="size-5 text-brand-accent" />
          </div>
          <h1 className="font-display text-xl font-extrabold tracking-tight">
            No company fit scores yet
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            These are generated from your resume and profile. Upload your resume
            and run an analysis to see where you land.
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

  const grouped = {
    "Tier 1": fit.filter((c) => c.tier === "Tier 1"),
    "Tier 2": fit.filter((c) => c.tier === "Tier 2"),
    Service: fit.filter((c) => c.tier === "Service"),
  };
  return (
    <div className="p-6 md:p-10 space-y-8 max-w-6xl">
      <header>
        <p className="text-xs font-bold text-brand-accent uppercase tracking-widest mb-2">
          Company Fit
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
          Where your profile lands today.
        </h1>
        <p className="text-zinc-500 mt-2">
          AI-generated fit estimates based on GPA, resume quality, skills,
          projects, certifications, and GitHub activity.
        </p>
      </header>

      {Object.entries(grouped)
        .filter(([, items]) => items.length > 0)
        .map(([tier, items]) => (
          <section
            key={tier}
            className="p-6 md:p-8 rounded-2xl bg-surface border border-border-subtle"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold">{tier}</h2>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                {items.length} companies
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {items.map((c) => {
                const color =
                  c.score >= 80
                    ? "bg-emerald-400"
                    : c.score >= 60
                      ? "bg-brand-accent"
                      : c.score >= 45
                        ? "bg-brand-primary"
                        : "bg-brand-secondary";
                const text =
                  c.score >= 80
                    ? "text-emerald-400"
                    : c.score >= 60
                      ? "text-brand-accent"
                      : c.score >= 45
                        ? "text-brand-primary"
                        : "text-brand-secondary";
                return (
                  <div
                    key={c.name}
                    className="p-4 rounded-xl bg-zinc-900/40 border border-border-subtle"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-lg bg-linear-to-br from-brand-primary/40 to-brand-secondary/40 grid place-items-center font-display font-extrabold text-sm">
                          {c.name[0]}
                        </div>
                        <span className="font-medium text-sm">{c.name}</span>
                      </div>
                      <span
                        className={`text-lg font-black font-display ${text}`}
                      >
                        {c.score}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color}`}
                        style={{ width: `${c.score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      <p className="text-xs text-zinc-600 italic">
        Company Fit Scores reflect alignment between your profile signal and a
        company's typical hiring bar — they are not actual hiring guarantees.
      </p>
    </div>
  );
}
