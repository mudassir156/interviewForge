'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Code2, Lock, Mail, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '';
  const signupHref = callbackUrl
    ? `/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : '/signup';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password, callbackUrl || undefined);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden gradient-dark">
      <div className="absolute inset-0 animated-grid opacity-25 pointer-events-none" />
      <div className="orb w-[480px] h-[480px] -top-40 -left-24 bg-indigo-600" />
      <div className="orb orb-delay w-[380px] h-[380px] bottom-0 -right-20 bg-cyan-500" />
      <div className="orb orb-slow w-[300px] h-[300px] top-1/2 left-1/2 bg-purple-600" />

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

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              Welcome back
            </div>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground mb-4">
              Back to your{' '}
              <span className="gradient-text">interview workspace</span>
            </h1>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Continue running high-quality technical interviews with live code execution and real-time collaboration.
            </p>

            {/* Feature list */}
            <div className="space-y-3">
              {[
                { icon: '⚡', text: 'Live code execution across 20+ languages' },
                { icon: '🤝', text: 'Real-time multi-cursor collaboration' },
                { icon: '📋', text: 'Full interview history and recordings' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="text-base">{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </section>

          {/* Right panel - Form */}
          <div className="slide-in-right">
            <div
              className="surface-card border-glow rounded-2xl p-8"
              style={{ boxShadow: '0 0 0 1px rgba(99,102,241,0.1), 0 25px 60px rgba(0,0,0,0.5)' }}
            >
              {/* Mobile logo */}
              <div className="flex items-center gap-2 mb-6 lg:hidden">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-indigo-purple">
                  <Code2 className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold gradient-text">InterviewForge</span>
              </div>

              <div className="mb-7">
                <h2 className="text-2xl font-bold tracking-tight text-foreground mb-1">Sign in</h2>
                <p className="text-sm text-muted-foreground">Welcome back — enter your details below</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground/80">Email address</Label>
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-foreground/80">Password</Label>
                    <Link href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</Link>
                  </div>
                  <div className="relative group">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-400 transition-colors duration-200" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
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
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>
                  ) : (
                    <>Sign in <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>

                {error && (
                  <p className="text-sm text-red-400 text-center -mt-1">{error}</p>
                )}
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or continue with</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* OAuth stubs */}
              <div className="grid grid-cols-2 gap-3">
                {['GitHub', 'Google'].map((provider) => (
                  <Button
                    key={provider}
                    variant="outline"
                    className="h-10 border-border bg-card/60 hover:bg-muted/40 transition-all duration-200 rounded-xl text-sm"
                  >
                    {provider}
                  </Button>
                ))}
              </div>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href={signupHref} className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                  Create one free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
