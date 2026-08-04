import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  getSettings,
  updateSettings,
  type SettingsInput,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_admin/admin/settings")({
  head: () => ({ meta: [{ title: "Settings · Admin" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const fetchSettings = useServerFn(getSettings);
  const saveSettings = useServerFn(updateSettings);

  const [form, setForm] = useState<SettingsInput | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await fetchSettings({});
      setForm({
        site_name: s.site_name,
        support_email: s.support_email,
        allow_signups: s.allow_signups,
        maintenance_mode: s.maintenance_mode,
        ai_enabled: s.ai_enabled,
        ai_model: s.ai_model,
      });
      setSavedAt(s.updated_at);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load settings");
    } finally {
      setLoading(false);
    }
  }, [fetchSettings]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      const saved = await saveSettings({ data: form });
      setSavedAt(saved.updated_at);
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-20 grid place-items-center text-zinc-500">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="p-4 rounded-xl border border-red-900/60 bg-red-950/30 flex items-start gap-3">
        <AlertCircle className="size-4 text-red-400 mt-0.5 shrink-0" />
        <p className="text-sm text-red-200/80">
          {error ?? "No settings found"}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-extrabold tracking-tight">
        Settings
      </h1>
      <p className="text-sm text-zinc-500 mt-0.5">
        Stored in the database and applied across the app.
        {savedAt && ` Last updated ${new Date(savedAt).toLocaleString()}.`}
      </p>

      <form onSubmit={handleSave} className="mt-6 space-y-6">
        <Card
          title="General"
          description="Branding and contact details shown to users."
        >
          <TextField
            label="Site name"
            value={form.site_name}
            onChange={(v) => setForm({ ...form, site_name: v })}
            hint="Shown in the browser tab and page headings."
          />
          <TextField
            label="Support email"
            type="email"
            value={form.support_email}
            onChange={(v) => setForm({ ...form, support_email: v })}
            hint="Optional. Leave blank to hide the contact link."
          />
        </Card>

        <Card title="Access" description="Control who can get into the app.">
          <Toggle
            label="Allow new sign-ups"
            description="When off, the sign-up form is disabled and only existing users can log in."
            checked={form.allow_signups}
            onChange={(v) => setForm({ ...form, allow_signups: v })}
          />
          <Toggle
            label="Maintenance mode"
            description="Shows a maintenance banner across the site. Admins keep full access."
            checked={form.maintenance_mode}
            onChange={(v) => setForm({ ...form, maintenance_mode: v })}
          />
        </Card>

        <Card
          title="AI analysis"
          description="Controls the readiness scoring engine."
        >
          <Toggle
            label="Enable AI analysis"
            description="When off, analyses return the neutral baseline instead of calling the model."
            checked={form.ai_enabled}
            onChange={(v) => setForm({ ...form, ai_enabled: v })}
          />
          <TextField
            label="Model"
            value={form.ai_model}
            onChange={(v) => setForm({ ...form, ai_model: v })}
            hint="Gemini model id. Use gemini-flash-latest unless you have a reason not to — pinned versions get retired."
          />
        </Card>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2.5 rounded-lg bg-linear-to-r from-brand-primary to-brand-secondary text-white text-sm font-bold disabled:opacity-60 flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save settings
          </button>
          <button
            type="button"
            onClick={load}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg border border-border-subtle text-sm font-semibold text-zinc-300 hover:bg-zinc-900 transition-colors disabled:opacity-60"
          >
            Discard changes
          </button>
        </div>
      </form>
    </div>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-6 rounded-2xl bg-surface border border-border-subtle">
      <h2 className="font-display font-bold text-lg">{title}</h2>
      <p className="text-sm text-zinc-500 mt-0.5">{description}</p>
      <div className="mt-5 space-y-5">{children}</div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  hint,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  type?: string;
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
        className="mt-1.5 w-full bg-zinc-900/50 border border-border-subtle rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-primary/60"
      />
      {hint && <span className="block text-xs text-zinc-600 mt-1">{hint}</span>}
    </label>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm font-semibold">{label}</div>
        <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${
          checked ? "bg-brand-primary" : "bg-zinc-700"
        }`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5.5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
