import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  FileText,
  Github,
  Linkedin,
  Sparkles,
  Target,
  Brain,
  MessageSquare,
  GitBranch,
  ShieldCheck,
} from "lucide-react";
import { COMPANY_FIT } from "@/lib/mock-data";
import { ReadinessSimulator } from "@/components/readiness-simulator";
import { useReveal, revealClass, useCountUp } from "@/lib/motion";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Placify AI — Discover Your Placement Potential" },
      {
        name: "description",
        content:
          "Upload your resume, connect your GitHub and LinkedIn, and get an AI-powered placement readiness score with company fit analysis and personalized roadmaps.",
      },
      {
        property: "og:title",
        content: "Placify AI — Discover Your Placement Potential",
      },
      {
        property: "og:description",
        content:
          "AI-powered placement readiness, company fit scores, and skill-gap roadmaps for students.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-bg-main text-zinc-100 font-sans">
      <Nav />
      <Hero />
      <DashboardPreview />
      <Stats />
      <Features />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border-subtle bg-bg-main/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-8 bg-linear-to-br from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center">
            <Sparkles className="size-4 text-white" />
          </div>
          <span className="font-display text-lg font-extrabold tracking-tight">
            Placify AI
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#preview" className="hover:text-white transition-colors">
            Platform
          </a>
          <a
            href="#testimonials"
            className="hover:text-white transition-colors"
          >
            Stories
          </a>
        </div>
        <Link
          to="/dashboard"
          className="px-4 py-2 bg-white text-black rounded-full text-sm font-semibold hover:bg-zinc-200 transition-colors"
        >
          Analyze My Profile
        </Link>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative pt-24 pb-20 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-primary/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="max-w-5xl mx-auto px-6 text-center relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-accent text-xs font-bold mb-6 tracking-wide uppercase">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent" />
          </span>
          Placement-readiness engine v2 · Live
        </div>
        <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
          Discover Your{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-primary via-brand-secondary to-brand-accent">
            Placement Potential
          </span>
        </h1>
        <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Upload your resume, connect your GitHub and LinkedIn, and get an
          AI-powered readiness score with company fit analysis and a
          personalized roadmap.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-linear-to-r from-brand-primary to-brand-secondary rounded-xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Analyze My Profile <ArrowRight className="size-4" />
          </Link>
          <a
            href="#preview"
            className="w-full sm:w-auto px-8 py-4 bg-zinc-900 border border-border-subtle rounded-xl font-bold hover:bg-zinc-800 transition-all"
          >
            View Demo
          </a>
        </div>
        <p className="mt-8 text-xs text-zinc-600">
          Predictions are AI-generated estimates based on your profile signal —
          not actual hiring guarantees.
        </p>

        <ReadinessSimulator />
      </div>
    </section>
  );
}

const PREVIEW_TABS = [
  "Readiness Score",
  "Skill Gap Map",
  "Company Fit",
  "AI Coach",
] as const;

type PreviewTab = (typeof PREVIEW_TABS)[number];

function DashboardPreview() {
  const topCompanies = COMPANY_FIT.slice(0, 6);
  const [tab, setTab] = useState<PreviewTab>("Readiness Score");
  const { ref, shown } = useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      id="preview"
      className={`max-w-7xl mx-auto px-6 pb-32 ${revealClass(shown)}`}
    >
      <div className="bg-surface rounded-2xl border border-border-subtle overflow-hidden shadow-2xl shadow-black/40">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
          <aside className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-border-subtle p-6 bg-black/20">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">
              Analysis Engine
            </p>
            <div className="space-y-1 mb-6">
              {PREVIEW_TABS.map((t) => (
                <PreviewNav
                  key={t}
                  active={tab === t}
                  onClick={() => setTab(t)}
                >
                  {t}
                </PreviewNav>
              ))}
            </div>
            <div className="aspect-square rounded-xl bg-linear-to-br from-brand-primary/30 via-brand-secondary/20 to-brand-accent/20 border border-white/5 grid place-items-center mb-4">
              <Target className="size-10 text-brand-accent" />
            </div>
            <div className="p-3 bg-zinc-900/50 rounded-lg border border-border-subtle">
              <p className="text-xs text-zinc-400 mb-1">Current Status</p>
              <p className="text-sm font-bold text-emerald-400">
                Job Ready · Highly Competitive
              </p>
            </div>
          </aside>

          <div className="lg:col-span-9 p-8 bg-linear-to-b from-zinc-900/30 to-transparent">
            <PreviewPanel key={tab} tab={tab} topCompanies={topCompanies} />
          </div>
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-zinc-600 italic">
        AI-generated estimates based on your profile signal. Company Fit Scores
        are guidance, not hiring guarantees.
      </p>
    </section>
  );
}

/** Right-hand pane of the demo. Switching tabs re-mounts it, so bars re-fill. */
function PreviewPanel({
  tab,
  topCompanies,
}: {
  tab: PreviewTab;
  topCompanies: typeof COMPANY_FIT;
}) {
  const score = useCountUp(84, 900);

  if (tab === "Skill Gap Map") {
    const gaps = [
      { skill: "System Design", you: 28, target: 75 },
      { skill: "Kubernetes", you: 20, target: 60 },
      { skill: "AWS", you: 35, target: 70 },
      { skill: "DSA", you: 78, target: 88 },
      { skill: "Web Dev", you: 88, target: 70 },
    ];
    return (
      <PanelShell
        title="Skill Gap Map"
        subtitle="Where you sit against the Tier-1 hiring bar."
      >
        <div className="space-y-5">
          {gaps.map((g) => {
            const met = g.you >= g.target;
            return (
              <div key={g.skill}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">{g.skill}</span>
                  <span className={met ? "text-emerald-400" : "text-zinc-400"}>
                    {g.you} <span className="text-zinc-600">/ {g.target}</span>
                  </span>
                </div>
                <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 w-px bg-zinc-500"
                    style={{ left: `${g.target}%` }}
                  />
                  <div
                    className={`h-full rounded-full transition-[width] duration-1000 ease-out motion-reduce:transition-none ${met ? "bg-emerald-400" : "bg-brand-primary"}`}
                    style={{ width: `${g.you}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </PanelShell>
    );
  }

  if (tab === "Company Fit") {
    return (
      <PanelShell
        title="Company Fit"
        subtitle="Estimated alignment with each hiring bar."
      >
        <div className="grid sm:grid-cols-2 gap-4">
          {COMPANY_FIT.slice(0, 8).map((c) => (
            <div
              key={c.name}
              className="p-4 rounded-xl bg-zinc-900/40 border border-border-subtle hover:border-brand-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{c.name}</span>
                <span className="text-sm font-bold tabular-nums">
                  {c.score}%
                </span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-linear-to-r from-brand-primary to-brand-accent transition-[width] duration-1000 ease-out motion-reduce:transition-none"
                  style={{ width: `${c.score}%` }}
                />
              </div>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                {c.tier}
              </p>
            </div>
          ))}
        </div>
      </PanelShell>
    );
  }

  if (tab === "AI Coach") {
    const thread = [
      {
        from: "you",
        text: "What should I fix before Amazon applications open?",
      },
      {
        from: "ai",
        text: "Your DSA is strong enough. The gap is systems — you have no distributed project and no cloud deployment. That is what the loop tests after round two.",
      },
      { from: "you", text: "How long would that take?" },
      {
        from: "ai",
        text: "Six weeks. Deploy one existing project to AWS with Docker, then write up the scaling decisions. That converts a listed skill into evidence.",
      },
    ];
    return (
      <PanelShell
        title="AI Coach"
        subtitle="Guidance grounded in your own gaps."
      >
        <div className="space-y-3">
          {thread.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.from === "you" ? "justify-end" : "justify-start"}`}
            >
              <p
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  m.from === "you"
                    ? "bg-brand-primary text-white rounded-br-sm"
                    : "bg-zinc-900/60 border border-border-subtle text-zinc-300 rounded-bl-sm"
                }`}
              >
                {m.text}
              </p>
            </div>
          ))}
        </div>
      </PanelShell>
    );
  }

  return (
    <>
      <div className="flex flex-wrap justify-between items-end gap-4 mb-10">
        <div>
          <h3 className="text-3xl font-display font-bold mb-2">
            Placement Forecast
          </h3>
          <p className="text-zinc-500">
            Based on your current stack and contribution history.
          </p>
        </div>
        <div className="text-right">
          <span className="text-5xl font-black text-white tabular-nums">
            {score}
            <span className="text-zinc-600">/100</span>
          </span>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-tighter mt-1">
            Aggregate Readiness
          </p>
        </div>
      </div>

      <div className="space-y-5 mb-12">
        {topCompanies.map((c, i) => (
          <div key={c.name}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium">{c.name}</span>
              <span
                className={`text-sm font-bold tabular-nums ${i % 3 === 0 ? "text-brand-accent" : i % 3 === 1 ? "text-brand-primary" : "text-brand-secondary"}`}
              >
                {c.score}%
              </span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-[width] duration-1000 ease-out motion-reduce:transition-none ${i % 3 === 0 ? "bg-brand-accent" : i % 3 === 1 ? "bg-brand-primary" : "bg-brand-secondary"}`}
                style={{ width: `${c.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: "ATS Score", v: "92" },
          { l: "Comm Score", v: "78" },
          { l: "LeetCode", v: "Top 8%" },
          { l: "Project IQ", v: "High" },
        ].map((s) => (
          <div
            key={s.l}
            className="p-4 bg-zinc-900/50 border border-border-subtle rounded-xl hover:border-brand-primary/40 hover:-translate-y-0.5 transition-all motion-reduce:transition-none"
          >
            <p className="text-xs font-medium text-zinc-500 mb-1">{s.l}</p>
            <p className="text-xl font-bold">{s.v}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function PanelShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="mb-8">
        <h3 className="text-3xl font-display font-bold mb-2">{title}</h3>
        <p className="text-zinc-500">{subtitle}</p>
      </div>
      {children}
    </>
  );
}

function PreviewNav({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent ${
        active
          ? "bg-brand-primary/10 text-brand-accent"
          : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/60"
      }`}
    >
      <div
        className={`size-2 rounded-full transition-colors ${active ? "bg-brand-accent" : "bg-zinc-700"}`}
      />
      <span className="text-sm font-medium">{children}</span>
    </button>
  );
}

/** Counts up once the strip scrolls into view. */
function StatValue({
  to,
  suffix = "",
  decimals = 0,
  start,
}: {
  to: number;
  suffix?: string;
  decimals?: number;
  start: boolean;
}) {
  const n = useCountUp(start ? to * 10 ** decimals : 0, 1200);
  const shown = (n / 10 ** decimals).toFixed(decimals);
  return (
    <span className="tabular-nums">
      {shown}
      {suffix}
    </span>
  );
}

function Stats() {
  const { ref, shown } = useReveal<HTMLElement>();
  const stats = [
    { to: 12, suffix: "k+", decimals: 0, l: "Profiles analyzed" },
    { to: 94, suffix: "%", decimals: 0, l: "Readiness lift in 8 weeks" },
    { to: 500, suffix: "+", decimals: 0, l: "Companies modeled" },
    { to: 4.8, suffix: "/5", decimals: 1, l: "Student rating" },
  ];
  return (
    <section
      ref={ref}
      className="border-y border-border-subtle bg-black/30 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-border-subtle">
        {stats.map((s, i) => (
          <div
            key={s.l}
            className={`py-10 px-6 text-center ${revealClass(shown, i * 90)}`}
          >
            <div className="font-display text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-brand-accent via-brand-primary to-brand-secondary">
              <StatValue
                to={s.to}
                suffix={s.suffix}
                decimals={s.decimals}
                start={shown}
              />
            </div>
            <div className="mt-2 text-[11px] text-zinc-500 uppercase tracking-widest font-bold">
              {s.l}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: FileText,
      title: "Resume analysis",
      body: "ATS, technical depth, and communication scoring with line-by-line feedback.",
    },
    {
      icon: Linkedin,
      title: "LinkedIn analysis",
      body: "Headline, about, experience, and skill section quality scored against top profiles.",
    },
    {
      icon: Github,
      title: "GitHub analysis",
      body: "Repository quality, language mix, and contribution density turned into a single score.",
    },
    {
      icon: Target,
      title: "Company Fit Score",
      body: "Estimated fit for 12+ top employers based on your profile signal.",
    },
    {
      icon: Brain,
      title: "Interview readiness",
      body: "Mock HR, technical, and company-specific question generators.",
    },
    {
      icon: GitBranch,
      title: "Skill gap detection",
      body: "See exactly what's missing for product, service, and finance-tech roles.",
    },
    {
      icon: MessageSquare,
      title: "AI career coach",
      body: "A chatbot tuned to your profile, your gaps, and your target companies.",
    },
    {
      icon: ShieldCheck,
      title: "Personalized roadmap",
      body: "Week-by-week sprint plans for Microsoft, Amazon, Google, JP Morgan, and more.",
    },
  ];
  const { ref, shown } = useReveal<HTMLElement>();
  return (
    <section ref={ref} id="features" className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-14 max-w-2xl mx-auto">
        <p className="text-xs font-bold text-brand-accent uppercase tracking-widest mb-3">
          Capabilities
        </p>
        <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Every signal. One readiness score.
        </h2>
        <p className="text-zinc-400">
          We pull from every artifact recruiters look at, then compress it into
          a single, defensible readiness number.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f, i) => (
          <div
            key={f.title}
            style={{ transitionDelay: shown ? `${i * 60}ms` : "0ms" }}
            className={`p-6 rounded-2xl bg-surface border border-border-subtle hover:border-brand-primary/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-primary/5 group ${revealClass(shown)}`}
          >
            <div className="size-10 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <f.icon className="size-5 text-brand-accent" />
            </div>
            <h3 className="font-display font-bold mb-2">{f.title}</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const { ref, shown } = useReveal<HTMLElement>();
  const items = [
    {
      name: "Aarav Sharma",
      role: "B.Tech CSE · IIIT-H",
      quote:
        "The Company Fit Scores told me exactly where I was wasting prep time. Switched focus, landed Microsoft in 11 weeks.",
    },
    {
      name: "Priya Menon",
      role: "MCA · NIT Trichy",
      quote:
        "Resume ATS jumped from 61 to 94. The roadmap for JP Morgan felt like having a senior mentor on call.",
    },
    {
      name: "Rohit Verma",
      role: "B.E. ECE · VIT",
      quote:
        "Skill-gap map saved me. Closed system design in 6 weeks and finally cleared an Amazon loop.",
    },
  ];
  return (
    <section
      ref={ref}
      id="testimonials"
      className={`max-w-7xl mx-auto px-6 py-24 border-t border-border-subtle ${revealClass(shown)}`}
    >
      <div className="text-center mb-14">
        <p className="text-xs font-bold text-brand-accent uppercase tracking-widest mb-3">
          Student stories
        </p>
        <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
          Built for the placement season.
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((t) => (
          <figure
            key={t.name}
            className="p-8 rounded-2xl bg-surface border border-border-subtle"
          >
            <blockquote className="text-zinc-300 leading-relaxed">
              "{t.quote}"
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <div className="size-9 rounded-full bg-linear-to-br from-brand-primary to-brand-secondary" />
              <div>
                <div className="text-sm font-bold">{t.name}</div>
                <div className="text-xs text-zinc-500">{t.role}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-24">
      <div className="rounded-3xl border border-border-subtle bg-linear-to-br from-brand-primary/15 via-brand-secondary/10 to-brand-accent/10 p-12 text-center">
        <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Ready to see your number?
        </h2>
        <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
          Drop in your resume and profile links. You'll get a complete readiness
          report in under a minute.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-colors"
        >
          Open the dashboard <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border-subtle py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 opacity-70">
          <div className="size-6 bg-linear-to-br from-brand-primary to-brand-secondary rounded" />
          <span className="font-display font-bold">Placify AI</span>
        </div>
        <p className="text-xs text-zinc-600 italic max-w-md text-center">
          Placement Readiness and Company Fit Scores are AI-generated estimates,
          not hiring guarantees.
        </p>
        <div className="flex gap-6 text-sm text-zinc-500">
          <a href="#" className="hover:text-white">
            Privacy
          </a>
          <a href="#" className="hover:text-white">
            Terms
          </a>
          <a href="#" className="hover:text-white">
            Security
          </a>
        </div>
      </div>
    </footer>
  );
}
