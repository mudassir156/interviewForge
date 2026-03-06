'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  HelpCircle,
  Search,
  MessageSquare,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Mail,
  ArrowRight,
  Zap,
  Users,
  Code2,
  Settings,
  ExternalLink,
} from 'lucide-react';

const faqs = [
  {
    q: 'How do I create an interview room?',
    a: 'Navigate to the Dashboard and click "New Interview Room" in the top-right corner — or use the "Create Room" link in the sidebar. Fill in the title, language, and difficulty, then click Create.',
    href: '/dashboard/create-room',
    cta: 'Open Create Room',
  },
  {
    q: 'How do I invite a candidate to a room?',
    a: 'After creating a room, click "Join Room" then copy the URL from your browser address bar. Share that link with your candidate — they can join without creating an account.',
    href: '/dashboard',
    cta: 'Open Dashboard',
  },
  {
    q: 'Which programming languages are supported?',
    a: 'InterviewForge supports 20+ languages including Python, JavaScript, TypeScript, Java, C++, Go, Rust, Ruby, PHP, Swift, Kotlin, and more. More are added regularly.',
    href: '/dashboard/code-execution',
    cta: 'Open Code Execution',
  },
  {
    q: 'Is my interview data saved?',
    a: 'Yes. Every session — code snapshots, chat messages, and execution results — is automatically saved and accessible from the History page for your plan\'s retention period.',
    href: '/dashboard/history',
    cta: 'Open History',
  },
  {
    q: 'Can multiple interviewers join the same room?',
    a: 'Absolutely. You can share the room link with multiple team members. Everyone sees the same editor in real time with full collaboration support.',
  },
  {
    q: 'How do I change my password?',
    a: 'Go to Settings → Security tab → Change Password section. Enter your current password and your new password, then click Update Password.',
    href: '/dashboard/settings',
    cta: 'Open Settings',
  },
];

const guides = [
  { icon: Zap, title: 'Quick Start', desc: 'Get your first room up in 2 minutes', gradient: 'from-indigo-500 to-purple-500', href: '/dashboard/create-room' },
  { icon: Users, title: 'Inviting Candidates', desc: 'Share rooms and manage participants', gradient: 'from-cyan-500 to-teal-500', href: '/dashboard' },
  { icon: Code2, title: 'Code Execution', desc: 'Run code in 20+ languages live', gradient: 'from-amber-500 to-orange-500', href: '/dashboard/code-execution' },
  { icon: Settings, title: 'Account Settings', desc: 'Profile, billing, and security', gradient: 'from-purple-500 to-pink-500', href: '/dashboard/settings' },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const filteredFaqs = faqs.filter(
    (f) =>
      search === '' ||
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto fade-up space-y-10">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-indigo-purple" style={{ boxShadow: '0 0 25px rgba(99,102,241,0.4)' }}>
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">
            Help &amp; <span className="gradient-text">Support</span>
          </h1>
          <p className="text-muted-foreground/70 text-sm max-w-md mx-auto">
            Find answers, read guides, or reach out to our support team.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search the help center…"
            className="h-12 pl-11 rounded-xl bg-card/60 border-border focus:border-indigo-500/50 text-sm transition-all"
          />
        </div>

        {/* Guides */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-4 w-4 text-indigo-400" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/50">Guides</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {guides.map((g) => {
              const Icon = g.icon;
              return (
                <Link key={g.title} href={g.href}>
                  <div className="card-glow surface-card group flex items-center gap-4 rounded-2xl p-4 hover:border-indigo-500/20 transition-all duration-200 cursor-pointer">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${g.gradient}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground group-hover:text-foreground transition-colors">{g.title}</p>
                      <p className="text-xs text-muted-foreground/60">{g.desc}</p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-indigo-400 transition-colors shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-4 w-4 text-indigo-400" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/50">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-2">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, i) => (
                <div
                  key={i}
                  className={`surface-card rounded-2xl overflow-hidden transition-all duration-200 ${
                    openFaq === i ? 'border-indigo-500/20' : ''
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-sm font-semibold text-foreground">{faq.q}</span>
                    {openFaq === i ? (
                      <ChevronUp className="h-4 w-4 text-indigo-400 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    )}
                  </button>
                  {openFaq === i && (
                    <div className="border-t border-border px-5 py-4">
                      <p className="text-sm leading-relaxed text-muted-foreground/70">{faq.a}</p>
                      {'href' in faq && faq.href && (
                        <Link
                          href={faq.href}
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          {('cta' in faq && faq.cta) || 'Open'}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="surface-card rounded-2xl p-10 text-center">
                <p className="text-muted-foreground">No results for &ldquo;{search}&rdquo;. Try different keywords.</p>
              </div>
            )}
          </div>
        </section>

        {/* Contact */}
        <section
          className="surface-card border-glow rounded-2xl p-8 text-center"
          style={{ boxShadow: '0 0 0 1px rgba(99,102,241,0.1)' }}
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10">
            <Mail className="h-6 w-6 text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">Still need help?</h3>
          <p className="text-sm text-muted-foreground/70 mb-5">
            Our support team typically responds within 24 hours.
          </p>
          <a href="mailto:support@interviewforge.io">
            <Button
              className="btn-glow gradient-indigo-purple border-0 rounded-xl text-white gap-2"
              style={{ boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}
            >
              Contact Support
              <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
        </section>
      </div>
    </DashboardLayout>
  );
}
