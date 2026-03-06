'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Briefcase, Clock3, Loader2, Phone, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';

const roleOptions = [
  { id: 'interviewer', label: 'Interviewer' },
  { id: 'candidate', label: 'Candidate' },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, refreshUser } = useAuth();

  const [role, setRole] = useState<'interviewer' | 'candidate'>('candidate');
  const [title, setTitle] = useState('');
  const [timezone, setTimezone] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const callbackUrl = useMemo(() => {
    const value = searchParams.get('callbackUrl') || '/dashboard';
    if (!value.startsWith('/') || value.startsWith('//')) {
      return '/dashboard';
    }
    return value;
  }, [searchParams]);

  useEffect(() => {
    if (isLoading || !user) return;

    if (user.profileCompleted) {
      router.replace(callbackUrl);
      return;
    }

    setRole(user.role === 'interviewer' ? 'interviewer' : 'candidate');
    setTitle(user.title || '');
    setTimezone(user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || '');
    setPhone(user.phone || '');
  }, [callbackUrl, isLoading, router, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      setError('Please log in again to continue.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          role,
          title,
          timezone,
          phone,
          theme: user.theme || 'dark',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save profile details.');
      }

      await refreshUser();
      router.replace(callbackUrl);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save profile details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !user) {
    return (
      <main className="min-h-screen gradient-dark flex items-center justify-center px-4">
        <div className="surface-card rounded-2xl p-6 flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading your profile...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen gradient-dark flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl surface-card border-glow rounded-2xl p-6 sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Complete Profile</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-foreground">Tell us about your role</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This helps InterviewForge personalize your workspace after first login.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground/80">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as 'interviewer' | 'candidate')}>
              <SelectTrigger className="h-11 rounded-xl bg-card/60 border-border focus:ring-indigo-500/20">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-indigo-400" />
                  <SelectValue placeholder="Select your role" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border bg-popover">
                {roleOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id} className="rounded-lg cursor-pointer">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-foreground/80">Job Title</Label>
            <div className="relative">
              <Briefcase className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={role === 'candidate' ? 'e.g., Frontend Engineer' : 'e.g., Senior Engineering Manager'}
                className="h-11 pl-10 rounded-xl bg-card/60 border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone" className="text-sm font-medium text-foreground/80">Timezone</Label>
            <div className="relative">
              <Clock3 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="timezone"
                required
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="e.g., Asia/Karachi"
                className="h-11 pl-10 rounded-xl bg-card/60 border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-foreground/80">Phone (optional)</Label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., +92 300 1234567"
                className="h-11 pl-10 rounded-xl bg-card/60 border-border"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button
            type="submit"
            disabled={isSubmitting || !title.trim() || !timezone.trim()}
            className="w-full h-11 btn-glow gradient-indigo-purple border-0 rounded-xl text-white font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving details...
              </>
            ) : (
              'Continue to workspace'
            )}
          </Button>
        </form>
      </div>
    </main>
  );
}
