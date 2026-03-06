'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Bell, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(searchParams.get('q') ?? '');

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
  }, [searchParams]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const normalizedQuery = query.trim();

    if (normalizedQuery) {
      params.set('q', normalizedQuery);
    } else {
      params.delete('q');
    }

    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-2xl">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="lg:hidden text-muted-foreground hover:text-foreground"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex flex-1 max-w-md">
          <div className="interactive-surface flex w-full items-center gap-3 rounded-xl px-4 py-2 text-sm text-muted-foreground focus-within:ring-1 focus-within:ring-indigo-500/40">
            <Search className="h-3.5 w-3.5" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search rooms, history..."
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/70 outline-none"
              aria-label="Search rooms and history"
            />
            <div className="flex items-center gap-1">
              <kbd className="rounded bg-white/8 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground/70">Ctrl</kbd>
              <span className="text-[10px] text-muted-foreground/50">+</span>
              <kbd className="rounded bg-white/8 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground/60">K</kbd>
            </div>
          </div>
        </form>

        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500" style={{ boxShadow: '0 0 6px rgba(99,102,241,0.8)' }} />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 gap-2 rounded-xl px-2.5 text-sm">
                <div className="h-7 w-7 rounded-lg overflow-hidden bg-card border border-border shrink-0">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center gradient-indigo-purple text-xs font-bold text-white"
                      style={{ boxShadow: '0 0 12px rgba(99,102,241,0.4)' }}
                    >
                      {initials}
                    </div>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-foreground leading-tight">{user?.name ?? 'Loading...'}</p>
                  <p className="text-[10px] text-muted-foreground/60 truncate">{user?.title?.trim() || 'No title set'}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border border-border bg-popover shadow-2xl p-1">
              <div className="px-3 py-2 mb-1">
                <p className="text-sm font-semibold text-foreground">{user?.name ?? 'User'}</p>
                <p className="text-xs text-muted-foreground">{user?.email ?? ''}</p>
              </div>
              <DropdownMenuSeparator className="bg-border my-1" />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings?tab=profile" className="rounded-lg text-sm cursor-pointer">Profile Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings?tab=preferences" className="rounded-lg text-sm cursor-pointer">Preferences</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/help" className="rounded-lg text-sm cursor-pointer">Help &amp; Support</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border my-1" />
              <DropdownMenuItem
                onClick={logout}
                className="rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

