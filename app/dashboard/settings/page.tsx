'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import {
  User,
  Shield,
  CreditCard,
  Settings,
  Camera,
  Check,
  Moon,
  Sun,
  Laptop,
  Mail,
  Phone,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

const validTabs = new Set(tabs.map((tab) => tab.id));

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const { setTheme: applyTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [billingMessage, setBillingMessage] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Profile state
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileTitle, setProfileTitle] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileTimezone, setProfileTimezone] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!user) return;
    setProfileName(user.name || '');
    setProfileEmail(user.email || '');
    setProfileTitle(user.title || '');
    setProfilePhone(user.phone || '');
    setProfileTimezone(user.timezone || '');
    setProfileAvatar(user.avatar || '');
    setTheme(user.theme || 'dark');
    applyTheme(user.theme || 'dark');
  }, [user, applyTheme]);

  // Theme
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');

  const initials = profileName
    ? profileName
        .split(' ')
        .map((part) => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('')
    : 'U';

  const hasPasswordMismatch = Boolean(confirmPassword) && newPassword !== confirmPassword;
  const hasWeakPassword = Boolean(newPassword) && newPassword.length < 6;
  const canSubmitPassword =
    Boolean(currentPassword) &&
    Boolean(newPassword) &&
    Boolean(confirmPassword) &&
    !hasPasswordMismatch &&
    !hasWeakPassword;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileError('Please choose an image file.');
      event.target.value = '';
      return;
    }

    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      setProfileError('Image must be 2MB or smaller.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfileAvatar(reader.result);
        setProfileError(null);
      }
    };
    reader.onerror = () => {
      setProfileError('Could not read the selected image.');
    };

    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleSave = async () => {
    setSaveError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setSaveError('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSaveError('New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setSaveError('New password must be at least 6 characters.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password.');
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to update password.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (saveError) {
      setSaveError(null);
    }
  }, [currentPassword, newPassword, confirmPassword]);

  const handleProfileSave = async () => {
    setProfileError(null);
    setProfileSaved(false);
    setIsProfileSaving(true);

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: profileName,
          email: profileEmail,
          title: profileTitle,
          phone: profilePhone,
          timezone: profileTimezone,
          avatar: profileAvatar,
          theme,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile.');
      }

      setProfileName(data.user?.name || '');
      setProfileEmail(data.user?.email || '');
      setProfileTitle(data.user?.title || '');
      setProfilePhone(data.user?.phone || '');
      setProfileTimezone(data.user?.timezone || '');
      setProfileAvatar(data.user?.avatar || '');
      setTheme(data.user?.theme || 'dark');
      applyTheme(data.user?.theme || 'dark');

      await refreshUser();
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Failed to update profile.');
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleThemeChange = async (nextTheme: 'dark' | 'light' | 'system') => {
    setTheme(nextTheme);
    applyTheme(nextTheme);

    if (!user) return;

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: profileName,
          email: profileEmail,
          title: profileTitle,
          phone: profilePhone,
          timezone: profileTimezone,
          avatar: profileAvatar,
          theme: nextTheme,
        }),
      });

      if (res.ok) {
        await refreshUser();
      }
    } catch {
      // Keep instant local theme application even if persistence fails.
    }
  };

  const handleBillingPlanClick = () => {
    setBillingMessage('Professional plan coming soon.');
  };

  useEffect(() => {
    const requestedTab = searchParams.get('tab');
    if (!requestedTab) {
      return;
    }

    // Keep backward-compatible alias for dropdown wording.
    if (requestedTab === 'preferences') {
      setActiveTab('profile');
      return;
    }

    if (validTabs.has(requestedTab)) {
      setActiveTab(requestedTab);
    }
  }, [searchParams]);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto fade-up space-y-7 sm:space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl gradient-indigo-purple">
              <Settings className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50">Settings</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Account <span className="gradient-text">Settings</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground/70 max-w-xl">Manage your profile, preferences, and account security.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
          {/* Tab sidebar */}
          <aside className="surface-card rounded-2xl p-1.5 sm:p-2 flex lg:flex-col gap-1 lg:w-52 h-fit shrink-0 overflow-x-auto lg:overflow-visible">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-400' : ''}`} />
                  {tab.label}
                </button>
              );
            })}
          </aside>

          {/* Content area */}
          <div className="flex-1 min-w-0">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="card-glow surface-card rounded-2xl p-5 sm:p-6 space-y-6">
                <h2 className="text-lg font-bold text-foreground">Profile Information</h2>

                {/* Avatar */}
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-2xl overflow-hidden bg-card border border-border flex items-center justify-center text-2xl font-black text-white">
                      {profileAvatar ? (
                        <img src={profileAvatar} alt="Profile avatar" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full gradient-indigo-purple flex items-center justify-center">
                          {initials}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-card border border-border hover:border-indigo-500/40 transition-all duration-200"
                    >
                      <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{profileName}</p>
                    <p className="text-xs text-muted-foreground">{profileEmail}</p>
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      className="mt-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Upload new photo
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full-name" className="text-sm font-medium text-foreground/80">Full Name</Label>
                    <div className="relative group">
                      <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-400 transition-colors" />
                      <Input
                        id="full-name"
                        value={profileName}
                        onChange={e => setProfileName(e.target.value)}
                        className="h-11 pl-10 rounded-xl bg-card/60 border-border focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground/80">Email Address</Label>
                    <div className="relative group">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-400 transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        value={profileEmail}
                        onChange={e => setProfileEmail(e.target.value)}
                        className="h-11 pl-10 rounded-xl bg-card/60 border-border focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="job-title" className="text-sm font-medium text-foreground/80">Job Title</Label>
                    <Input
                      id="job-title"
                      value={profileTitle}
                      onChange={e => setProfileTitle(e.target.value)}
                      className="h-11 rounded-xl bg-card/60 border-border focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-foreground/80">Phone</Label>
                    <div className="relative group">
                      <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-400 transition-colors" />
                      <Input
                        id="phone"
                        type="tel"
                        value={profilePhone}
                        onChange={e => setProfilePhone(e.target.value)}
                        className="h-11 pl-10 rounded-xl bg-card/60 border-border focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="timezone" className="text-sm font-medium text-foreground/80">Timezone</Label>
                    <div className="relative group">
                      <Globe className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-400 transition-colors" />
                      <Input
                        id="timezone"
                        value={profileTimezone}
                        onChange={e => setProfileTimezone(e.target.value)}
                        className="h-11 pl-10 rounded-xl bg-card/60 border-border focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Theme selector */}
                <div>
                  <Label className="text-sm font-medium text-foreground/80 mb-3 block">Appearance</Label>
                  <div className="flex flex-wrap gap-3">
                    {([
                      { id: 'dark', label: 'Dark', icon: Moon },
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'system', label: 'System', icon: Laptop },
                    ] as const).map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleThemeChange(opt.id)}
                          className={`flex min-w-[96px] flex-1 sm:flex-none flex-col items-center gap-2 rounded-xl border px-4 py-3 text-xs font-medium transition-all duration-200 ${
                            theme === opt.id
                              ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300'
                              : 'border-border bg-card/50 text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleProfileSave}
                    disabled={isProfileSaving}
                    className="btn-glow gradient-indigo-purple border-0 rounded-xl text-white px-6 h-10 font-semibold"
                  >
                    {isProfileSaving ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                    ) : profileSaved ? (
                      <><Check className="mr-2 h-4 w-4" /> Saved!</>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
                {profileError && (
                  <p className="text-sm text-red-400">{profileError}</p>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-4 sm:space-y-5">
                <div className="card-glow surface-card rounded-2xl p-5 sm:p-6 space-y-5">
                  <h2 className="text-lg font-bold text-foreground">Change Password</h2>
                  <p className="text-sm text-muted-foreground/70">Use a strong password with at least 6 characters to keep your account secure.</p>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void handleSave();
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground/80">Current Password</Label>
                      <div className="relative group">
                        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type={showCurrentPw ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          autoComplete="current-password"
                          className="h-11 pl-10 pr-10 rounded-xl bg-card/60 border-border focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPw(!showCurrentPw)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground/80">New Password</Label>
                      <div className="relative group">
                        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type={showNewPw ? 'text' : 'password'}
                          placeholder="Create a new secure password"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          autoComplete="new-password"
                          className="h-11 pl-10 pr-10 rounded-xl bg-card/60 border-border focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPw(!showNewPw)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground/80">Confirm New Password</Label>
                      <div className="relative group">
                        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="Re-enter new password"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          autoComplete="new-password"
                          className="h-11 pl-10 rounded-xl bg-card/60 border-border focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSaving || !canSubmitPassword}
                        className="btn-glow gradient-indigo-purple border-0 rounded-xl text-white px-6 h-10 font-semibold"
                      >
                        {isSaving ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</>
                        ) : saved ? (
                          <><Check className="mr-2 h-4 w-4" /> Updated!</>
                        ) : (
                          'Update Password'
                        )}
                      </Button>
                    </div>
                    {saveError && (
                      <p className="text-sm text-red-400">{saveError}</p>
                    )}
                    {saved && (
                      <p className="text-sm text-emerald-400">Password changed successfully.</p>
                    )}
                    {hasWeakPassword && (
                      <p className="text-xs text-amber-400">Password must be at least 6 characters.</p>
                    )}
                    {hasPasswordMismatch && (
                      <p className="text-xs text-amber-400">New password and confirm password must match.</p>
                    )}
                  </form>
                </div>

                <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-4 border border-red-500/20">
                  <h3 className="text-base font-bold text-red-400">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground/70">Irreversible actions. Please be absolutely sure before proceeding.</p>
                  <Button variant="outline" size="sm" className="rounded-xl border-red-500/20 text-red-400 hover:bg-red-500/5 hover:border-red-500/30 transition-all">
                    Delete Account
                  </Button>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-4 sm:space-y-5">
                {/* Current Plan */}
                <div className="card-glow surface-card rounded-2xl p-5 sm:p-6 relative overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                      Active
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/40 mb-1">Current Plan</h3>
                  <p className="text-3xl font-extrabold text-foreground gradient-text mb-1">Free</p>
                  <p className="text-sm text-muted-foreground/70 mb-5">Up to 5 interview rooms · 2 active sessions · Basic analytics</p>

                  <div className="space-y-2 mb-6">
                    {[
                      '5 interview rooms',
                      '2 active sessions at a time',
                      '20+ programming languages',
                      '7-day session history',
                    ].map((feat) => (
                      <div key={feat} className="flex items-center gap-2 text-sm text-muted-foreground/70">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        {feat}
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleBillingPlanClick}
                    className="btn-glow gradient-indigo-purple border-0 rounded-xl text-white h-10 font-semibold"
                  >
                    Upgrade to Pro
                  </Button>
                  {billingMessage && (
                    <p className="mt-3 text-sm text-indigo-300">{billingMessage}</p>
                  )}
                </div>

                {/* Pro card */}
                <div className="surface-card rounded-2xl p-5 sm:p-6 border border-indigo-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-0.5">Pro Plan</p>
                      <p className="text-2xl font-extrabold text-foreground">$29 <span className="text-sm font-normal text-muted-foreground">/month</span></p>
                    </div>
                    <div className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
                      Recommended
                    </div>
                  </div>
                  <div className="space-y-2 mb-5">
                    {[
                      'Unlimited interview rooms',
                      'Unlimited active sessions',
                      'Full interview recordings',
                      '1-year session history',
                      'Priority support',
                      'Custom branding',
                    ].map((feat) => (
                      <div key={feat} className="flex items-center gap-2 text-sm text-muted-foreground/70">
                        <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                        {feat}
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleBillingPlanClick}
                    className="w-full rounded-xl border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-300 hover:text-indigo-200 transition-all"
                  >
                    Upgrade Now
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
