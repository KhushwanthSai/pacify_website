import { createFileRoute } from "@tanstack/react-router";
import { COMPANY_FIT } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/dashboard/company-fit")({
  component: CompanyFitPage,
});

function CompanyFitPage() {
  const grouped = {
    "Tier 1": COMPANY_FIT.filter((c) => c.tier === "Tier 1"),
    "Tier 2": COMPANY_FIT.filter((c) => c.tier === "Tier 2"),
    Service: COMPANY_FIT.filter((c) => c.tier === "Service"),
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

      {Object.entries(grouped).map(([tier, items]) => (
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
                    <span className={`text-lg font-black font-display ${text}`}>
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
