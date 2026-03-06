'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Sparkles,
  Users,
  Zap,
  Play,
  Shield,
  Globe,
  Terminal,
  GitBranch,
  Star,
  ChevronRight,
} from 'lucide-react';

const features = [
  {
    icon: Terminal,
    title: 'Live Code Execution',
    description: 'Execute code in real-time across Python, JavaScript, Java, C++ and more — directly in the browser.',
    gradient: 'from-indigo-500 to-blue-500',
    glow: 'rgba(99,102,241,0.4)',
  },
  {
    icon: Users,
    title: 'Real-time Collaboration',
    description: 'Simultaneous multi-cursor editing with instant synchronization — zero lag, zero compromise.',
    gradient: 'from-purple-500 to-indigo-500',
    glow: 'rgba(139,92,246,0.4)',
  },
  {
    icon: Globe,
    title: 'Instant Interview Rooms',
    description: 'One-click room creation. Share a link and your candidate can join in under 10 seconds.',
    gradient: 'from-cyan-500 to-teal-500',
    glow: 'rgba(6,182,212,0.4)',
  },
  {
    icon: GitBranch,
    title: 'Interview History',
    description: 'Every session auto-recorded. Review code, chat logs, and execution history any time.',
    gradient: 'from-violet-500 to-purple-500',
    glow: 'rgba(167,139,250,0.4)',
  },
  {
    icon: Zap,
    title: 'Instant Feedback',
    description: 'Run tests and view output side-by-side while interviewing. No context switching.',
    gradient: 'from-amber-500 to-orange-500',
    glow: 'rgba(251,191,36,0.4)',
  },
  {
    icon: Shield,
    title: 'Secure Sessions',
    description: 'End-to-end encrypted rooms with role-based access. Your data, your control.',
    gradient: 'from-emerald-500 to-green-500',
    glow: 'rgba(16,185,129,0.4)',
  },
];

const stats = [
  { value: '10k+', label: 'Interviews Run', color: 'text-indigo-400' },
  { value: '<50ms', label: 'Avg. Sync Latency', color: 'text-cyan-400' },
  { value: '20+', label: 'Languages Supported', color: 'text-purple-400' },
  { value: '99.9%', label: 'Uptime SLA', color: 'text-emerald-400' },
];

const testimonials = [
  {
    quote: 'InterviewForge completely changed how we run technical interviews. The live execution is a game changer.',
    author: 'Sarah Chen',
    role: 'Engineering Manager, Stripe',
    avatar: 'SC',
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    quote: 'Clean, fast and professional. Candidates are impressed before they even write a line of code.',
    author: 'Marcus Webb',
    role: 'CTO, BuildFast',
    avatar: 'MW',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    quote: 'The history tracking alone saves us hours every week. Absolutely worth it.',
    author: 'Ana Rossi',
    role: 'Staff Engineer, Notion',
    avatar: 'AR',
    gradient: 'from-violet-500 to-indigo-500',
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden gradient-dark">
      {/* Background layers */}
      <div className="absolute inset-0 animated-grid opacity-30 pointer-events-none" />
      <div className="orb w-[520px] h-[520px] -top-40 -left-32 bg-indigo-600" />
      <div className="orb orb-delay w-[400px] h-[400px] top-[40%] -right-24 bg-cyan-500" />
      <div className="orb orb-slow w-[350px] h-[350px] bottom-0 left-1/3 bg-purple-600" />

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#060912]/70 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl gradient-indigo-purple shadow-lg" style={{ boxShadow: '0 0 20px rgba(99,102,241,0.5)' }}>
                <Code2 className="h-4.5 w-4.5 text-white" />
                <div className="absolute inset-0 rounded-xl bg-white/10" />
              </div>
              <span className="text-lg font-bold tracking-tight gradient-text">
                InterviewForge
              </span>
            </div>

            {/* Nav */}
            <nav className="hidden items-center gap-8 md:flex">
              {['Features', 'Dashboard', 'History'].map((item) => (
                <Link
                  key={item}
                  href={
                    item === 'Features' ? '#features' :
                    item === 'Dashboard' ? '/dashboard' :
                    item === 'History' ? '/dashboard/history' :
                    `/${item.toLowerCase()}`
                  }
                  className="link-underline text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  {item}
                </Link>
              ))}
            </nav>

            {/* CTA */}
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="btn-glow gradient-indigo-purple border-0 text-white shadow-lg px-4">
                  Get Started
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 sm:pt-28 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="fade-up mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            Built for modern engineering teams
            <span className="ml-1 rounded-full bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300">
              NEW
            </span>
          </div>

          {/* Headline */}
          <h1 className="fade-up fade-up-1 mx-auto mb-6 max-w-5xl text-5xl font-extrabold leading-[1.08] tracking-[-0.02em] text-foreground sm:text-6xl lg:text-7xl">
            Run{' '}
            <span className="gradient-text">world-class</span>
            {' '}technical interviews
            <br className="hidden sm:block" />
            in one unified workspace
          </h1>

          {/* Sub */}
          <p className="fade-up fade-up-2 mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Live code editor, real-time execution, instant collaboration ⟶ everything your hiring team needs, nothing it doesn&apos;t.
          </p>

          {/* CTAs */}
          <div className="fade-up fade-up-3 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button
                size="lg"
                className="btn-glow h-12 gap-2 rounded-xl gradient-indigo-purple border-0 px-8 text-base font-semibold text-white shadow-2xl"
                style={{ boxShadow: '0 0 30px rgba(99,102,241,0.4), 0 4px 20px rgba(99,102,241,0.3)' }}
              >
                Start free — no card needed
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="h-12 gap-2 rounded-xl border-white/10 bg-white/5 px-8 text-base backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                <Play className="h-4 w-4 text-cyan-400" />
                View Dashboard
              </Button>
            </Link>
          </div>

          {/* Trust strip */}
          <div className="fade-up fade-up-4 mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground/70">
            {['No credit card required', 'GDPR compliant', 'SOC 2 Type II ready'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Mock editor preview */}
        <div className="fade-up fade-up-5 mt-16 relative mx-auto max-w-4xl">
          <div
            className="relative rounded-2xl border border-white/8 bg-[#0d1424] p-1 shadow-2xl overflow-hidden"
            style={{ boxShadow: '0 0 0 1px rgba(99,102,241,0.15), 0 40px 100px rgba(99,102,241,0.12), 0 20px 60px rgba(0,0,0,0.6)' }}
          >
            {/* Window chrome */}
            <div className="flex items-center gap-2 rounded-t-xl border-b border-white/5 bg-white/[0.02] px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-amber-500/80" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <div className="mx-auto flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-0.5 text-xs text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
                interviewforge.app/room/abc-123
              </div>
            </div>
            {/* Code preview */}
            <div className="p-6 font-mono text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/50">Code Editor</p>
                  <div className="space-y-1.5">
                    {[
                      { indent: 0, color: 'text-purple-400', text: 'def two_sum(nums, target):' },
                      { indent: 1, color: 'text-cyan-400', text: '    seen = {}' },
                      { indent: 1, color: 'text-cyan-400', text: '    for i, n in enumerate(nums):' },
                      { indent: 2, color: 'text-indigo-300', text: '        comp = target - n' },
                      { indent: 2, color: 'text-emerald-400', text: '        if comp in seen:' },
                      { indent: 3, color: 'text-green-400', text: '            return [seen[comp], i]' },
                      { indent: 2, color: 'text-cyan-400', text: '        seen[n] = i' },
                    ].map((line, i) => (
                      <div key={i} className={`${line.color} leading-relaxed`}>{line.text}</div>
                    ))}
                  </div>
                </div>
                <div className="border-l border-white/5 pl-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/50">Output</p>
                  <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-3">
                    <p className="text-xs text-emerald-400">✓ Passed 58/58 test cases</p>
                    <p className="mt-1 text-xs text-muted-foreground">Runtime: 48ms · Memory: 17.2 MB</p>
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-xs text-muted-foreground/50 uppercase tracking-widest">Participants</p>
                    {['Interviewer', 'Candidate'].map((p, i) => (
                      <div key={p} className="flex items-center gap-2">
                        <div className={`h-5 w-5 rounded-full text-[9px] font-bold flex items-center justify-center text-white ${i === 0 ? 'bg-indigo-500' : 'bg-cyan-500'}`}>
                          {p[0]}
                        </div>
                        <span className="text-xs text-muted-foreground">{p}</span>
                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Glow under editor */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 h-20 w-2/3 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="relative z-10 border-y border-white/5 bg-white/[0.02] py-12 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={stat.label} className={`fade-up text-center`} style={{ animationDelay: `${i * 80}ms` }}>
                <div className={`text-4xl font-black tracking-tight ${stat.color} mb-1`}
                  style={{ textShadow: '0 0 30px currentColor' }}>
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="fade-up inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-xs text-indigo-300 mb-4">
            <Zap className="h-3.5 w-3.5" />
            Everything you need
          </div>
          <h2 className="fade-up fade-up-1 text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
            Packed with <span className="gradient-text">powerful features</span>
          </h2>
          <p className="fade-up fade-up-2 mx-auto max-w-2xl text-muted-foreground text-lg">
            Every tool you need to run a world-class technical interview, thoughtfully designed and always fast.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`fade-up card-glow surface-card group p-6 cursor-default`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}
                style={{ boxShadow: `0 0 20px ${feature.glow}` }}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-white transition-colors duration-200">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="relative z-10 border-t border-white/5 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="fade-up text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
              Loved by <span className="gradient-text">engineering teams</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <div
                key={t.author}
                className={`fade-up card-glow surface-card p-6`}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-sm font-bold text-white`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.author}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div
          className="fade-up relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-cyan-500/10 p-12 text-center backdrop-blur-sm"
          style={{ boxShadow: '0 0 80px rgba(99,102,241,0.15), inset 0 0 80px rgba(99,102,241,0.03)' }}
        >
          <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
          <div className="orb w-64 h-64 -top-20 -left-10 bg-indigo-500 opacity-20 blur-[100px]" style={{ position: 'absolute', animation: 'none' }} />
          <div className="orb w-64 h-64 -bottom-20 -right-10 bg-cyan-500 opacity-20 blur-[100px]" style={{ position: 'absolute', animation: 'none' }} />

          <div className="relative z-10">
            <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Ready to elevate your <span className="gradient-text">hiring process?</span>
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
              Join thousands of engineering teams running better technical interviews with InterviewForge.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="btn-glow h-12 gap-2 rounded-xl gradient-indigo-purple border-0 px-10 text-base font-semibold text-white"
                  style={{ boxShadow: '0 0 30px rgba(99,102,241,0.5)' }}
                >
                  Start for free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-12 rounded-xl border-white/10 bg-white/5 px-10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                  Sign in to your account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-indigo-purple">
                <Code2 className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold gradient-text">InterviewForge</span>
            </div>
            <p className="text-xs text-muted-foreground/60">
              © {new Date().getFullYear()} InterviewForge. Built for engineering excellence.
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground/60">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


