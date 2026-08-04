import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Loader2,
  ArrowLeft,
  Save,
  Trash2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import {
  getUserDetail,
  updateUser,
  deleteUser,
  type AdminUserDetail,
  type UpdateUserInput,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_admin/admin/users/$userId")({
  head: () => ({ meta: [{ title: "User detail · Admin" }] }),
  component: UserDetailPage,
});

/** Editable profile fields, in display order. */
const FIELDS = [
  { key: "full_name", label: "Full name" },
  { key: "username", label: "Username" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone number" },
  { key: "college", label: "College" },
  { key: "degree", label: "Degree" },
  { key: "branch", label: "Branch" },
  { key: "gpa", label: "GPA" },
  { key: "graduation_year", label: "Graduation year" },
  { key: "linkedin_url", label: "LinkedIn URL" },
  { key: "github_url", label: "GitHub URL" },
  { key: "portfolio_url", label: "Portfolio URL" },
  { key: "leetcode_url", label: "LeetCode URL" },
  { key: "hackerrank_url", label: "HackerRank URL" },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];
type FormState = Record<FieldKey, string>;

function toForm(user: AdminUserDetail): FormState {
  const p = user.profile ?? {};
  const get = (k: string) => (p[k] as string | null | undefined) ?? "";
  return {
    full_name: user.full_name || get("full_name"),
    username: user.username || get("username"),
    email: user.email,
    phone: user.phone || get("phone"),
    college: get("college"),
    degree: get("degree"),
    branch: get("branch"),
    gpa: get("gpa"),
    graduation_year: get("graduation_year"),
    linkedin_url: get("linkedin_url"),
    github_url: get("github_url"),
    portfolio_url: get("portfolio_url"),
    leetcode_url: get("leetcode_url"),
    hackerrank_url: get("hackerrank_url"),
  };
}

function UserDetailPage() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();
  const fetchDetail = useServerFn(getUserDetail);
  const saveUser = useServerFn(updateUser);
  const removeUser = useServerFn(deleteUser);

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const detail = await fetchDetail({ data: { userId } });
      setUser(detail);
      setForm(toForm(detail));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load user");
    } finally {
      setLoading(false);
    }
  }, [fetchDetail, userId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      await saveUser({ data: { userId, ...form } as UpdateUserInput });
      toast.success("Changes saved");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await removeUser({ data: { userId } });
      toast.success("User deleted");
      navigate({ to: "/admin", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  if (loading) {
    return (
      <div className="py-20 grid place-items-center text-zinc-500">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (error || !user || !form) {
    return (
      <div>
        <BackLink />
        <div className="mt-6 p-4 rounded-xl border border-red-900/60 bg-red-950/30 flex items-start gap-3">
          <AlertCircle className="size-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-200/80">{error ?? "User not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <BackLink />

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-extrabold tracking-tight truncate">
            {user.full_name || user.email || "Unnamed user"}
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5 font-mono truncate">
            {user.id}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {user.is_admin && <Pill tone="brand">Admin</Pill>}
          <Pill tone={user.email_confirmed ? "green" : "amber"}>
            {user.email_confirmed ? "Email confirmed" : "Email unconfirmed"}
          </Pill>
          <Pill tone="zinc">via {user.provider}</Pill>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat
          label="Joined"
          value={new Date(user.created_at).toLocaleDateString()}
        />
        <Stat
          label="Last sign in"
          value={
            user.last_sign_in_at
              ? new Date(user.last_sign_in_at).toLocaleDateString()
              : "Never"
          }
        />
        <Stat label="Analyses" value={String(user.analyses_count)} />
        <Stat label="Resumes" value={String(user.resumes.length)} />
      </div>

      <form onSubmit={handleSave} className="mt-8">
        <div className="p-6 rounded-2xl bg-surface border border-border-subtle">
          <h2 className="font-display font-bold text-lg">
            Profile information
          </h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Everything this user submitted. Edits save straight to the database.
          </p>

          <div className="mt-5 grid sm:grid-cols-2 gap-4">
            {FIELDS.map((f) => (
              <label key={f.key} className="block">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  {f.label}
                </span>
                <input
                  type={"type" in f ? f.type : "text"}
                  value={form[f.key]}
                  onChange={(e) =>
                    setForm({ ...form, [f.key]: e.target.value })
                  }
                  className="mt-1.5 w-full bg-zinc-900/50 border border-border-subtle rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-primary/60 placeholder:text-zinc-600"
                  placeholder="—"
                />
              </label>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
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
              Save changes
            </button>
            <button
              type="button"
              onClick={load}
              disabled={saving}
              className="px-4 py-2.5 rounded-lg border border-border-subtle text-sm font-semibold text-zinc-300 hover:bg-zinc-900 transition-colors disabled:opacity-60"
            >
              Reset
            </button>
          </div>
        </div>
      </form>

      {user.resumes.length > 0 && (
        <Section title="Resumes">
          <ul className="divide-y divide-border-subtle/60">
            {user.resumes.map((r) => (
              <li
                key={r.id}
                className="py-3 flex items-center justify-between gap-4 text-sm"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <FileText className="size-4 text-zinc-500 shrink-0" />
                  <span className="truncate">{r.file_name}</span>
                </span>
                <span className="text-zinc-500 text-xs shrink-0">
                  {(r.file_size / 1024).toFixed(0)} KB ·{" "}
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {user.analyses.length > 0 && (
        <Section title="Analysis history">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[38rem]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-zinc-500">
                  <th className="py-2 pr-4 font-bold">Date</th>
                  <th className="py-2 pr-4 font-bold">Readiness</th>
                  <th className="py-2 pr-4 font-bold">Resume</th>
                  <th className="py-2 pr-4 font-bold">ATS</th>
                  <th className="py-2 pr-4 font-bold">Technical</th>
                  <th className="py-2 font-bold">Summary</th>
                </tr>
              </thead>
              <tbody>
                {user.analyses.map((a) => (
                  <tr
                    key={a.id}
                    className="border-t border-border-subtle/60 text-zinc-300"
                  >
                    <td className="py-2.5 pr-4 whitespace-nowrap">
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 pr-4">{a.readiness_score}</td>
                    <td className="py-2.5 pr-4">{a.resume_score}</td>
                    <td className="py-2.5 pr-4">{a.ats_score}</td>
                    <td className="py-2.5 pr-4">{a.technical_score}</td>
                    <td className="py-2.5 text-zinc-500 max-w-md truncate">
                      {a.summary || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      <div className="mt-8 p-6 rounded-2xl border border-red-900/60 bg-red-950/20">
        <h2 className="font-display font-bold text-lg text-red-300">
          Danger zone
        </h2>
        <p className="text-sm text-red-200/60 mt-1">
          Deleting removes the account and every profile, resume, and analysis
          belonging to it. This cannot be undone.
        </p>

        {confirmingDelete ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-sm text-red-200">
              Permanently delete {user.email || "this user"}?
            </span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-bold disabled:opacity-60 flex items-center gap-2 transition-colors"
            >
              {deleting && <Loader2 className="size-4 animate-spin" />}
              Yes, delete
            </button>
            <button
              onClick={() => setConfirmingDelete(false)}
              disabled={deleting}
              className="px-4 py-2 rounded-lg border border-border-subtle text-sm font-semibold text-zinc-300 hover:bg-zinc-900 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="mt-4 px-4 py-2 rounded-lg border border-red-800 text-red-300 hover:bg-red-950/50 text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            <Trash2 className="size-4" />
            Delete user
          </button>
        )}
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/admin"
      className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
    >
      <ArrowLeft className="size-4" />
      All users
    </Link>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 p-6 rounded-2xl bg-surface border border-border-subtle">
      <h2 className="font-display font-bold text-lg mb-2">{title}</h2>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-xl bg-surface border border-border-subtle">
      <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">
        {label}
      </div>
      <div className="mt-1 font-display font-bold">{value}</div>
    </div>
  );
}

function Pill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "brand" | "green" | "amber" | "zinc";
}) {
  const tones = {
    brand: "bg-brand-primary/20 text-brand-accent",
    green: "bg-emerald-500/15 text-emerald-400",
    amber: "bg-amber-500/15 text-amber-400",
    zinc: "bg-zinc-800 text-zinc-400",
  };
  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
