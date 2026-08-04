import {
  createFileRoute,
  Outlet,
  redirect,
  Link,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { ShieldCheck, Users, Settings, LogOut } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_admin")({
  // Rendered client-side: the guard needs the session from browser storage.
  ssr: false,
  beforeLoad: async () => {
    if (!isSupabaseConfigured()) {
      throw redirect({ to: "/admin/login" });
    }
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({ to: "/admin/login" });
    }
    // Authoritative check — runs on the server against a table users cannot read.
    const isAdmin = await checkIsAdmin({}).catch(() => false);
    if (!isAdmin) {
      throw redirect({ to: "/admin/login" });
    }
    return { adminUser: data.user };
  },
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const { adminUser } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  const navItems = [
    { to: "/admin", label: "Users", icon: Users, exact: true },
    { to: "/admin/settings", label: "Settings", icon: Settings, exact: false },
  ] as const;

  return (
    <div className="min-h-screen bg-bg-main text-zinc-100 font-sans">
      <header className="border-b border-border-subtle sticky top-0 z-20 bg-bg-main/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <div className="size-8 rounded-lg bg-linear-to-br from-brand-primary to-brand-secondary grid place-items-center shrink-0">
              <ShieldCheck className="size-4 text-white" />
            </div>
            <span className="font-display font-extrabold tracking-tight truncate">
              Admin
            </span>
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = item.exact
                ? pathname === item.to
                : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    active
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  <item.icon className="size-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 min-w-0">
            <span className="hidden md:block text-xs text-zinc-500 truncate max-w-[16rem]">
              {adminUser.email}
            </span>
            <button
              onClick={signOut}
              className="px-3 py-1.5 rounded-lg border border-border-subtle text-sm font-medium text-zinc-300 hover:bg-zinc-900 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
