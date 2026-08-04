import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin sign in · Placify AI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const configured = isSupabaseConfigured();

  // Already signed in as an admin? Skip the form.
  useEffect(() => {
    if (!configured) {
      setChecking(false);
      return;
    }
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      if (!data.session) {
        setChecking(false);
        return;
      }
      const isAdmin = await checkIsAdmin({}).catch(() => false);
      if (!active) return;
      if (isAdmin) navigate({ to: "/admin", replace: true });
      else setChecking(false);
    });
    return () => {
      active = false;
    };
  }, [navigate, configured]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // Signing in is not enough — the account must also be an admin.
      const isAdmin = await checkIsAdmin({});
      if (!isAdmin) {
        await supabase.auth.signOut();
        toast.error("That account does not have admin access.");
        return;
      }
      navigate({ to: "/admin", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setLoading(false);
    }
  }

  if (!configured) {
    return (
      <Shell>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">
          Supabase not connected
        </h1>
        <p className="text-sm text-zinc-400 mt-2">
          Set the Supabase environment variables before using the admin panel.
          See the README for the full list.
        </p>
      </Shell>
    );
  }

  if (checking) {
    return (
      <Shell>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Loader2 className="size-4 animate-spin" /> Checking your session…
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex items-center gap-2">
        <div className="size-9 rounded-lg bg-linear-to-br from-brand-primary to-brand-secondary grid place-items-center">
          <ShieldCheck className="size-4 text-white" />
        </div>
        <div>
          <h1 className="font-display text-xl font-extrabold tracking-tight">
            Admin sign in
          </h1>
          <p className="text-xs text-zinc-500">Restricted area</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="admin@example.com"
          required
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2.5 rounded-lg bg-linear-to-r from-brand-primary to-brand-secondary text-white text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          Sign in
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-zinc-600">
        Not an admin?{" "}
        <Link to="/auth" className="text-brand-accent hover:underline">
          Go to the normal sign in
        </Link>
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-main text-zinc-100 font-sans flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-surface border border-border-subtle">
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-1.5 w-full bg-zinc-900/50 border border-border-subtle rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-primary/60 placeholder:text-zinc-600"
      />
    </label>
  );
}
