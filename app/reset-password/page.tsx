'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Code2, KeyRound, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function ResetPasswordPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const hasToken = token.trim().length > 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!hasToken || isLoading) return;

    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Unable to reset password.');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password.');
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
          {success ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15" style={{ boxShadow: '0 0 20px rgba(16,185,129,0.2)' }}>
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <h1 className="text-xl font-bold text-foreground mb-2">Password reset complete</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Your password has been updated. Sign in with your new password.
              </p>
              <Button
                onClick={() => router.push('/login')}
                className="btn-glow w-full h-11 gradient-indigo-purple border-0 rounded-xl text-white font-semibold text-base"
                style={{ boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}
              >
                Go to sign in
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-7 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-indigo-purple" style={{ boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
                  <KeyRound className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Set a new password</h1>
                <p className="text-sm text-muted-foreground">
                  Choose a secure password for your account.
                </p>
              </div>

              {!hasToken ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300 mb-5">
                  Reset link is invalid or missing a token. Please request a new reset email.
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground/80">New password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    className="h-11 bg-card/60 border-border focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground/80">Confirm new password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Re-enter your password"
                    required
                    className="h-11 bg-card/60 border-border focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all rounded-xl"
                  />
                </div>

                {error ? <p className="text-sm text-red-300">{error}</p> : null}

                <Button
                  type="submit"
                  disabled={isLoading || !hasToken}
                  className="btn-glow w-full h-11 gradient-indigo-purple border-0 rounded-xl text-white font-semibold text-base"
                  style={{ boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}
                >
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating password...</>
                  ) : (
                    'Update password'
                  )}
                </Button>
              </form>
            </>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
