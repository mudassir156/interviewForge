'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Code2, Mail, ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [devResetUrl, setDevResetUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setError('');
    setDevResetUrl('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Unable to send reset link right now.');
      }

      setSubmitted(true);
      setDevResetUrl(typeof data?.resetUrl === 'string' ? data.resetUrl : '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send reset link right now.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden gradient-dark flex items-center justify-center px-4">
      <div className="absolute inset-0 animated-grid opacity-25 pointer-events-none" />
      <div className="orb w-[420px] h-[420px] -top-32 -left-20 bg-indigo-600" />
      <div className="orb orb-delay w-[340px] h-[340px] bottom-0 -right-16 bg-purple-600" />

      <div className="relative z-10 w-full max-w-md slide-in-right">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl gradient-indigo-purple"
            style={{ boxShadow: '0 0 20px rgba(99,102,241,0.5)' }}
          >
            <Code2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold gradient-text">InterviewForge</span>
        </Link>

        <div
          className="surface-card border-glow rounded-2xl p-8"
          style={{ boxShadow: '0 0 0 1px rgba(99,102,241,0.1), 0 25px 60px rgba(0,0,0,0.5)' }}
        >
          {!submitted ? (
            <>
              <div className="mb-7 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-indigo-purple" style={{ boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Forgot your password?</h1>
                <p className="text-sm text-muted-foreground">
                  No worries — enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground/80">Email address</Label>
                  <div className="relative group">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-400 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      className="h-11 pl-10 bg-card/60 border-border focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all rounded-xl"
                    />
                  </div>
                </div>

                {error ? (
                  <p className="text-sm text-red-300">{error}</p>
                ) : null}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="btn-glow w-full h-11 gradient-indigo-purple border-0 rounded-xl text-white font-semibold text-base"
                  style={{ boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}
                >
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending link...</>
                  ) : (
                    <>Send reset link <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15" style={{ boxShadow: '0 0 20px rgba(16,185,129,0.2)' }}>
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Check your inbox</h2>
              <p className="text-sm text-muted-foreground mb-6">
                We sent a password reset link to{' '}
                <span className="font-semibold text-indigo-400">{email}</span>.
                Check your spam folder if you don&apos;t see it.
              </p>
              {devResetUrl ? (
                <div className="mb-6 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3 text-left">
                  <p className="text-xs text-indigo-200/90 mb-1">Development reset link:</p>
                  <a href={devResetUrl} className="text-xs break-all text-indigo-300 hover:text-indigo-200 transition-colors">
                    {devResetUrl}
                  </a>
                </div>
              ) : null}
              <Button
                onClick={() => setSubmitted(false)}
                variant="outline"
                size="sm"
                  className="rounded-xl border-border bg-card/60 hover:bg-muted/40"
              >
                Try a different email
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
