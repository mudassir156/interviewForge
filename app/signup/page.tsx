'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Code2, Lock, Mail, User, ArrowRight, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

function SignupPageContent() {
  const { register } = useAuth();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '';
  const loginHref = callbackUrl
    ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : '/login';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register(name, email, password, callbackUrl || undefined);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden gradient-dark">
      <div className="absolute inset-0 animated-grid opacity-25 pointer-events-none" />
      <div className="orb w-[480px] h-[480px] -top-40 -right-24 bg-purple-600" />
      <div className="orb orb-delay w-[380px] h-[380px] bottom-0 -left-20 bg-indigo-600" />
      <div className="orb orb-slow w-[300px] h-[300px] top-1/3 left-1/4 bg-cyan-600" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-5xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left panel */}
          <section className="slide-in-left hidden lg:block">
            <Link href="/" className="inline-flex items-center gap-2 mb-8">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-indigo-purple" style={{ boxShadow: '0 0 20px rgba(99,102,241,0.5)' }}>
                <Code2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">InterviewForge</span>
            </Link>

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs text-purple-300">
              <Sparkles className="h-3.5 w-3.5" />
              Free to get started
            </div>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground mb-4">
              Create your{' '}
              <span className="gradient-text">hiring workspace</span>{' '}today
            </h1>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Join engineering teams using InterviewForge to run structured, collaborative technical interviews at scale.
            </p>

            {/* Benefits */}
            <div className="space-y-3">
              {[
                'Unlimited interview rooms',
                'Live execution for 20+ languages',
                'Candidate history & recordings',
                'Team collaboration tools',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  {benefit}
                </div>
              ))}
            </div>
          </section>

          {/* Right panel - Form */}
          <div className="slide-in-right">
            <div
              className="surface-card border-glow rounded-2xl p-8"
              style={{ boxShadow: '0 0 0 1px rgba(139,92,246,0.1), 0 25px 60px rgba(0,0,0,0.5)' }}
            >
              {/* Mobile logo */}
              <div className="flex items-center gap-2 mb-6 lg:hidden">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-indigo-purple">
                  <Code2 className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold gradient-text">InterviewForge</span>
              </div>

              <div className="mb-7">
                <h2 className="text-2xl font-bold tracking-tight text-foreground mb-1">Create account</h2>
                <p className="text-sm text-muted-foreground">Get started — it&apos;s completely free</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-foreground/80">Full name</Label>
                  <div className="relative group">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-400 transition-colors duration-200" />
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="h-11 pl-10 bg-card/60 border-border focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all duration-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground/80">Work email</Label>
                  <div className="relative group">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-400 transition-colors duration-200" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      className="h-11 pl-10 bg-card/60 border-border focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all duration-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground/80">Password</Label>
                  <div className="relative group">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-400 transition-colors duration-200" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Create a secure password"
                      required
                      className="h-11 pl-10 bg-card/60 border-border focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all duration-200 rounded-xl"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="btn-glow w-full h-11 gradient-indigo-purple border-0 rounded-xl text-white font-semibold text-base"
                  style={{ boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}
                >
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</>
                  ) : (
                    <>Create free account <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>

                {error && (
                  <p className="text-sm text-red-400 text-center -mt-1">{error}</p>
                )}
              </form>

              <p className="mt-4 text-center text-xs text-muted-foreground/60">
                By signing up, you agree to our{' '}
                <Link href="#" className="underline hover:text-muted-foreground transition-colors">Terms</Link>{' '}and{' '}
                <Link href="#" className="underline hover:text-muted-foreground transition-colors">Privacy Policy</Link>.
              </p>

              <p className="mt-5 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href={loginHref} className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupPageContent />
    </Suspense>
  );
}
