import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  UploadCloud,
  FileText,
  Linkedin,
  Github,
  Globe,
  Code2,
  CheckCircle2,
  X,
  Loader2,
  Download,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { analyzeProfile } from "@/lib/analyze.functions";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard/profile")({
  component: ProfilePage,
});

type UploadedFile = {
  name: string;
  size: number;
  progress: number;
  path?: string;
  id?: string;
};

const FIELDS = [
  { k: "full_name", l: "Full name", ph: "Aarav Sharma" },
  { k: "email", l: "Email", ph: "aarav@example.com" },
  { k: "phone", l: "Phone", ph: "+91 98xxxxxxxx" },
  { k: "college", l: "College", ph: "IIIT Hyderabad" },
  { k: "degree", l: "Degree", ph: "B.Tech" },
  { k: "branch", l: "Branch", ph: "Computer Science" },
  { k: "gpa", l: "GPA / CGPA", ph: "8.7" },
  { k: "graduation_year", l: "Graduation year", ph: "2026" },
] as const;

type ProfileForm = Record<string, string>;

function ProfilePage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProfileForm>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const navigate = useNavigate();
  const runAnalyze = useServerFn(analyzeProfile);

  async function analyzeNow() {
    if (!userId) return;
    setAnalyzing(true);
    try {
      // Save latest form first so AI sees current data
      await supabase
        .from("profiles")
        .upsert({ id: userId, ...form }, { onConflict: "id" });
      await runAnalyze({});
      toast.success("Analysis complete!");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (profile) {
        const next: ProfileForm = {};
        Object.entries(profile).forEach(([k, v]) => {
          if (typeof v === "string") next[k] = v;
        });
        setForm(next);
      }
      const { data: resumes } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (resumes) {
        setFiles(
          resumes.map((r) => ({
            id: r.id,
            name: r.file_name,
            size: Number(r.file_size),
            progress: 100,
            path: r.file_path,
          })),
        );
      }
      setLoading(false);
    })();
  }, []);

  function set(k: string, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function save() {
    if (!userId) return;
    setSaving(true);
    const payload = { id: userId, ...form };
    const { error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "id" });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile saved");
  }

  async function handleFiles(list: FileList | null) {
    if (!list || !userId) return;
    const allowed = ["pdf", "doc", "docx", "txt"];
    for (const f of Array.from(list)) {
      const ext = f.name.split(".").pop()?.toLowerCase();
      if (!ext || !allowed.includes(ext)) continue;
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`${f.name} exceeds 10MB`);
        continue;
      }
      const tmpName = f.name;
      setFiles((prev) => [
        ...prev,
        { name: tmpName, size: f.size, progress: 30 },
      ]);
      const path = `${userId}/${Date.now()}-${f.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: upErr } = await supabase.storage
        .from("resumes")
        .upload(path, f, {
          cacheControl: "3600",
          upsert: false,
        });
      if (upErr) {
        toast.error(upErr.message);
        setFiles((prev) =>
          prev.filter((x) => x.name !== tmpName || x.progress !== 30),
        );
        continue;
      }
      const { data: row, error: dbErr } = await supabase
        .from("resumes")
        .insert({
          user_id: userId,
          file_name: f.name,
          file_path: path,
          file_size: f.size,
        })
        .select()
        .single();
      if (dbErr) {
        toast.error(dbErr.message);
        continue;
      }
      setFiles((prev) =>
        prev.map((x) =>
          x.name === tmpName && x.progress === 30
            ? { id: row.id, name: f.name, size: f.size, progress: 100, path }
            : x,
        ),
      );
      toast.success(`Uploaded ${f.name}`);
    }
  }

  async function removeFile(file: UploadedFile) {
    if (!file.id || !file.path) {
      setFiles((curr) => curr.filter((x) => x !== file));
      return;
    }
    await supabase.storage.from("resumes").remove([file.path]);
    await supabase.from("resumes").delete().eq("id", file.id);
    setFiles((curr) => curr.filter((x) => x.id !== file.id));
  }

  async function downloadFile(file: UploadedFile) {
    if (!file.path) return;
    const { data, error } = await supabase.storage
      .from("resumes")
      .createSignedUrl(file.path, 60);
    if (error || !data) {
      toast.error("Could not get download link");
      return;
    }
    window.open(data.signedUrl, "_blank");
  }

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-5xl">
      <header>
        <p className="text-xs font-bold text-brand-accent uppercase tracking-widest mb-2">
          Profile & Resume
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
          Tell us about you
        </h1>
        <p className="text-zinc-500 mt-2">
          We use your profile and resume to compute readiness and company fit.
        </p>
      </header>

      {/* Personal */}
      <section className="p-6 md:p-8 rounded-2xl bg-surface border border-border-subtle">
        <h2 className="font-display font-bold mb-6">Personal information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FIELDS.map((f) => (
            <Field
              key={f.k}
              label={f.l}
              placeholder={f.ph}
              value={form[f.k] ?? ""}
              onChange={(v) => set(f.k, v)}
            />
          ))}
        </div>
      </section>

      {/* Profile links */}
      <section className="p-6 md:p-8 rounded-2xl bg-surface border border-border-subtle">
        <h2 className="font-display font-bold mb-6">Profile links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            icon={Linkedin}
            label="LinkedIn"
            placeholder="https://linkedin.com/in/…"
            value={form.linkedin_url ?? ""}
            onChange={(v) => set("linkedin_url", v)}
          />
          <Field
            icon={Github}
            label="GitHub"
            placeholder="https://github.com/…"
            value={form.github_url ?? ""}
            onChange={(v) => set("github_url", v)}
          />
          <Field
            icon={Globe}
            label="Portfolio"
            placeholder="https://yoursite.dev"
            value={form.portfolio_url ?? ""}
            onChange={(v) => set("portfolio_url", v)}
          />
          <Field
            icon={Code2}
            label="LeetCode"
            placeholder="https://leetcode.com/u/…"
            value={form.leetcode_url ?? ""}
            onChange={(v) => set("leetcode_url", v)}
          />
          <Field
            icon={Code2}
            label="HackerRank"
            placeholder="https://hackerrank.com/…"
            value={form.hackerrank_url ?? ""}
            onChange={(v) => set("hackerrank_url", v)}
          />
        </div>
        <button
          onClick={save}
          disabled={saving || loading}
          className="mt-6 px-6 py-2.5 rounded-lg bg-linear-to-r from-brand-primary to-brand-secondary text-white font-bold disabled:opacity-60 inline-flex items-center gap-2"
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          Save profile
        </button>
      </section>

      {/* Resume upload */}
      <section className="p-6 md:p-8 rounded-2xl bg-surface border border-border-subtle">
        <h2 className="font-display font-bold mb-6">Resume upload</h2>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
            dragOver
              ? "border-brand-accent bg-brand-accent/5"
              : "border-border-subtle bg-black/20 hover:border-brand-primary/50"
          }`}
        >
          <div className="size-12 mx-auto rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mb-4">
            <UploadCloud className="size-6 text-brand-accent" />
          </div>
          <p className="font-bold">Drop your resume here</p>
          <p className="text-sm text-zinc-500 mt-1">
            PDF, DOC, DOCX, or TXT · up to 10MB
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <button className="mt-5 px-4 py-2 bg-white text-black text-sm font-semibold rounded-full">
            Browse files
          </button>
        </div>

        {files.length > 0 && (
          <ul className="mt-6 space-y-3">
            {files.map((f) => (
              <li
                key={f.id ?? f.name}
                className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-border-subtle rounded-xl"
              >
                <FileText className="size-5 text-brand-accent shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-medium">{f.name}</span>
                    <span className="text-xs text-zinc-500 ml-3">
                      {(f.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                  <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${f.progress === 100 ? "bg-emerald-400" : "bg-brand-accent"}`}
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                </div>
                {f.progress === 100 ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-emerald-400" />
                    {f.path && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadFile(f);
                        }}
                        className="text-zinc-500 hover:text-zinc-200"
                      >
                        <Download className="size-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(f);
                      }}
                      className="text-zinc-500 hover:text-zinc-200"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <Loader2 className="size-4 animate-spin text-zinc-400" />
                )}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-6 flex flex-wrap gap-3 items-center">
          <button
            onClick={analyzeNow}
            disabled={analyzing || loading || !userId}
            className="px-6 py-3 rounded-xl bg-linear-to-r from-brand-primary to-brand-secondary text-white font-bold disabled:opacity-60 inline-flex items-center gap-2"
          >
            {analyzing && <Loader2 className="size-4 animate-spin" />}
            {analyzing ? "Analyzing with AI…" : "Analyze my profile"}
          </button>
          <p className="text-xs text-zinc-500">
            Runs AI scoring on your profile and resumes, then opens your
            readiness dashboard.
          </p>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  placeholder,
  icon: Icon,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  icon?: typeof Linkedin;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
        {label}
      </span>
      <div className="mt-2 flex items-center gap-2 bg-zinc-900/50 border border-border-subtle rounded-lg px-3 py-2 focus-within:border-brand-primary/60 transition-colors">
        {Icon && <Icon className="size-4 text-zinc-500" />}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent outline-none w-full text-sm placeholder:text-zinc-600"
          placeholder={placeholder}
        />
      </div>
    </label>
  );
}
