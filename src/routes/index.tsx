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
      </div>
    </section>
  );
}

function DashboardPreview() {
  const topCompanies = COMPANY_FIT.slice(0, 6);
  return (
    <section id="preview" className="max-w-7xl mx-auto px-6 pb-32">
      <div className="bg-surface rounded-2xl border border-border-subtle overflow-hidden shadow-2xl shadow-black/40">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
          <aside className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-border-subtle p-6 bg-black/20">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">
              Analysis Engine
            </p>
            <div className="space-y-1 mb-6">
              <PreviewNav active>Readiness Score</PreviewNav>
              <PreviewNav>Skill Gap Map</PreviewNav>
              <PreviewNav>Company Fit</PreviewNav>
              <PreviewNav>AI Coach</PreviewNav>
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
                <span className="text-5xl font-black text-white">
                  84<span className="text-zinc-600">/100</span>
                </span>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-tighter mt-1">
                  Aggregate Readiness
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-5">
                {topCompanies.map((c, i) => (
                  <div key={c.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium">{c.name}</span>
                      <span
                        className={`text-sm font-bold ${i % 3 === 0 ? "text-brand-accent" : i % 3 === 1 ? "text-brand-primary" : "text-brand-secondary"}`}
                      >
                        {c.score}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${i % 3 === 0 ? "bg-brand-accent" : i % 3 === 1 ? "bg-brand-primary" : "bg-brand-secondary"}`}
                        style={{ width: `${c.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-zinc-900/40 border border-border-subtle p-6 rounded-xl">
                <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <div className="size-1.5 bg-amber-400 rounded-full animate-pulse" />
                  Critical Skill Gaps
                </h4>
                <div className="flex flex-wrap gap-2">
                  {["SYSTEM DESIGN", "KUBERNETES", "AWS"].map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 bg-red-400/10 border border-red-400/20 text-red-400 text-[10px] font-bold rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                  {["REDIS", "DOCKER"].map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] font-bold rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="mt-6 p-3 bg-zinc-950/50 rounded-lg">
                  <p className="text-xs text-zinc-500 italic">
                    AI COACH: "Your GitHub shows weak cloud orchestration
                    presence. Focus on Docker/K8s to unlock Tier-1 roles."
                  </p>
                </div>
              </div>
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
                  className="p-4 bg-zinc-900/50 border border-border-subtle rounded-xl"
                >
                  <p className="text-xs font-medium text-zinc-500 mb-1">
                    {s.l}
                  </p>
                  <p className="text-xl font-bold">{s.v}</p>
                </div>
              ))}
            </div>
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

function PreviewNav({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${active ? "bg-brand-primary/10 text-brand-accent" : "text-zinc-500 hover:text-zinc-200"}`}
    >
      <div
        className={`size-2 rounded-full ${active ? "bg-brand-accent" : "bg-zinc-700"}`}
      />
      <span className="text-sm font-medium">{children}</span>
    </div>
  );
}

function Stats() {
  const stats = [
    { v: "12k+", l: "Profiles analyzed" },
    { v: "94%", l: "Readiness lift in 8 weeks" },
    { v: "500+", l: "Companies modeled" },
    { v: "4.8/5", l: "Student rating" },
  ];
  return (
    <section className="border-y border-border-subtle bg-black/30">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-border-subtle">
        {stats.map((s) => (
          <div key={s.l} className="py-10 px-6 text-center">
            <div className="font-display text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-brand-accent via-brand-primary to-brand-secondary">
              {s.v}
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
  return (
    <section id="features" className="max-w-7xl mx-auto px-6 py-24">
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
        {features.map((f) => (
          <div
            key={f.title}
            className="p-6 rounded-2xl bg-surface border border-border-subtle hover:border-brand-primary/40 transition-colors group"
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
      id="testimonials"
      className="max-w-7xl mx-auto px-6 py-24 border-t border-border-subtle"
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
