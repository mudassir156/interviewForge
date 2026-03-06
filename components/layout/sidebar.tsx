'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Code2, Home, Plus, Clock, Settings, LogOut, Zap, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  onClose?: () => void;
}

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard', hoverColor: 'group-hover:text-indigo-400' },
  { href: '/dashboard/create-room', icon: Plus, label: 'Create Room', hoverColor: 'group-hover:text-emerald-400' },
  { href: '/dashboard/history', icon: Clock, label: 'History', hoverColor: 'group-hover:text-amber-400' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings', hoverColor: 'group-hover:text-cyan-400' },
  { href: '/dashboard/help', icon: HelpCircle, label: 'Help & Support', hoverColor: 'group-hover:text-purple-400' },
];

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((part) => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('')
    : 'U';

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border/70">
        <div
          className="relative flex h-10 w-10 items-center justify-center rounded-xl gradient-indigo-purple shrink-0"
          style={{ boxShadow: '0 0 20px rgba(99,102,241,0.45)' }}
        >
          <Code2 className="w-5 h-5 text-white" />
          <div className="absolute inset-0 rounded-xl bg-white/10" />
        </div>
        <div>
          <h2 className="text-sm font-bold gradient-text">InterviewForge</h2>
          <p className="text-[11px] text-muted-foreground/60">Technical Interviews</p>
        </div>
        <div className="ml-auto">
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
            <span className="text-[10px] text-emerald-400 font-medium">Live</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">Navigation</p>
        <div className="mt-1.5 space-y-2">
        {navItems.map((item, i) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
          return (
            <Link key={item.href} href={item.href} onClick={onClose} className="block">
              <div
                className={cn(
                  'group relative flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm transition-all duration-200 cursor-pointer',
                  isActive
                    ? 'bg-indigo-500/12 border border-indigo-500/25 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.08)]'
                    : 'interactive-surface'
                )}
              >
                {/* Active indicator */}
                {/* {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full bg-indigo-400" />
                )} */}
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all duration-200',
                    isActive
                      ? 'border-indigo-500/30 bg-indigo-500/15'
                      : 'border-border/70 bg-card/55 group-hover:border-primary/25 group-hover:bg-card/85'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-4 w-4 transition-colors duration-200',
                      isActive ? 'text-indigo-400' : cn('text-muted-foreground/60', item.hoverColor)
                    )}
                    strokeWidth={2.2}
                  />
                </div>
                <span className={cn(
                  'font-medium transition-colors duration-200',
                  isActive ? 'text-indigo-300' : 'text-muted-foreground/70 group-hover:text-foreground'
                )}>
                  {item.label}
                </span>
                {/* {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />
                )} */}
              </div>
            </Link>
          );
        })}
        </div>
      </nav>

      {/* Promo card */}
      <div className="mx-3 mb-3">
        <div
          className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 p-4"
          style={{ boxShadow: '0 0 20px rgba(99,102,241,0.08)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-semibold text-foreground">Quick Tip</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Press <kbd className="rounded bg-white/10 px-1 py-0.5 text-[10px] font-mono text-foreground">Ctrl</kbd>{' '}
            <span className="text-foreground/70">+</span>{' '}
            <kbd className="rounded bg-white/10 px-1 py-0.5 text-[10px] font-mono text-foreground">K</kbd> to open room search.
          </p>
        </div>
      </div>

      {/* User section */}
      <div className="border-t border-sidebar-border/70 p-3 space-y-1">
        <div className="flex items-center gap-3 rounded-xl bg-card/50 border border-border px-3 py-3">
          <div className="h-8 w-8 rounded-full overflow-hidden bg-card border border-border shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full gradient-indigo-purple flex items-center justify-center text-xs font-bold text-white">
                {initials}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">{user?.name ?? 'User'}</p>
            <p className="text-xs text-muted-foreground/60 truncate">{user?.email ?? ''}</p>
          </div>
        </div>
        <Link
          href="/login"
          onClick={async (event) => {
            event.preventDefault();
            await logout();
            onClose?.();
          }}
        >
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 rounded-xl text-muted-foreground/60 hover:text-red-300 hover:bg-red-500/12 transition-all duration-200 text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </Button>
        </Link>
      </div>
    </div>
  );
}
