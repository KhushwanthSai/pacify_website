import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import {
  Sparkles,
  Gauge,
  GitBranch,
  Building2,
  MessageSquare,
  Map as MapIcon,
  User,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getLatestAnalysis } from "@/lib/analyze.functions";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Placify AI" },
      {
        name: "description",
        content:
          "Your placement readiness dashboard, company fit, skill gaps, and roadmap.",
      },
    ],
  }),
  component: DashboardLayout,
});

type NavItem = {
  to:
    | "/dashboard"
    | "/dashboard/profile"
    | "/dashboard/skill-gap"
    | "/dashboard/company-fit"
    | "/dashboard/roadmaps"
    | "/dashboard/coach";
  label: string;
  icon: typeof Gauge;
  exact?: boolean;
};

const NAV: NavItem[] = [
  // Profile first: a student has to upload a resume before Readiness has
  // anything to show.
  { to: "/dashboard/profile", label: "Profile & Resume", icon: User },
  { to: "/dashboard", label: "Readiness", icon: Gauge, exact: true },
  { to: "/dashboard/skill-gap", label: "Skill Gap Map", icon: GitBranch },
  { to: "/dashboard/company-fit", label: "Company Fit", icon: Building2 },
  { to: "/dashboard/roadmaps", label: "Roadmaps", icon: MapIcon },
  { to: "/dashboard/coach", label: "AI Coach", icon: MessageSquare },
];

/** Sidebar status, derived from the real readiness score. */
function statusFor(score: number | null) {
  if (score === null)
    return { label: "Not analysed yet", tone: "text-zinc-400" };
  if (score >= 80) return { label: "Job Ready", tone: "text-emerald-400" };
  if (score >= 60) return { label: "Nearly Ready", tone: "text-brand-accent" };
  if (score >= 40) return { label: "Developing", tone: "text-amber-400" };
  if (score > 0) return { label: "Early Stage", tone: "text-red-400" };
  return { label: "Not scored", tone: "text-zinc-400" };
}

function DashboardLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchLatest = useServerFn(getLatestAnalysis);
  const [readiness, setReadiness] = useState<number | null>(null);

  useEffect(() => {
    fetchLatest({})
      .then((r) => {
        const row = r as { readiness_score?: number } | null;
        setReadiness(row?.readiness_score ?? null);
      })
      .catch(() => setReadiness(null));
    // Refetches on navigation so the status updates right after an analysis.
  }, [fetchLatest, pathname]);

  const status = statusFor(readiness);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <div className="min-h-screen bg-bg-main text-zinc-100 font-sans flex">
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-border-subtle bg-black/30 flex-col">
        <div className="h-16 px-6 flex items-center gap-2 border-b border-border-subtle">
          <div className="size-8 bg-linear-to-br from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center">
            <Sparkles className="size-4 text-white" />
          </div>
          <span className="font-display font-extrabold tracking-tight">
            Placify AI
          </span>
        </div>
        <nav className="p-4 flex-1">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2 mb-3">
            Analysis Engine
          </p>
          <div className="space-y-1">
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.to
                : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand-primary/10 text-brand-accent"
                      : "text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900/50"
                  }`}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="p-4 border-t border-border-subtle">
          <div className="p-3 rounded-lg bg-zinc-900/50 border border-border-subtle">
            <p className="text-xs text-zinc-400 mb-1">Current Status</p>
            <p className={`text-sm font-bold ${status.tone}`}>{status.label}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-4 w-full flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-200"
          >
            <LogOut className="size-3" /> Sign out
          </button>
          <Link
            to="/"
            className="mt-2 flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-200"
          >
            <ArrowLeft className="size-3" /> Back to site
          </Link>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        {/* Mobile nav */}
        <div className="lg:hidden flex gap-1 overflow-x-auto p-3 border-b border-border-subtle bg-black/30">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.to
              : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold ${active ? "bg-brand-primary text-white" : "bg-zinc-900 text-zinc-400"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <Outlet />
      </main>
    </div>
  );
}
