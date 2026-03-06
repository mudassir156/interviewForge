'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  title?: string;
  phone?: string;
  timezone?: string;
  theme?: 'dark' | 'light' | 'system';
  role: string;
  profileCompleted?: boolean;
  avatar?: string;
  interviewCount?: number;
  createdAt?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, redirectTo?: string) => Promise<void>;
  register: (name: string, email: string, password: string, redirectTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the currently logged-in user on mount
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // ─── Auth actions ──────────────────────────────────────────────────────────

  const resolveRedirectPath = (redirectTo?: string) => {
    if (!redirectTo) return '/dashboard';
    if (!redirectTo.startsWith('/') || redirectTo.startsWith('//')) {
      return '/dashboard';
    }
    return redirectTo;
  };

  const resolvePostAuthPath = (nextUser: AuthUser, redirectTo?: string) => {
    const safeTarget = resolveRedirectPath(redirectTo);
    if (nextUser.profileCompleted) {
      return safeTarget;
    }
    return safeTarget === '/dashboard'
      ? '/onboarding'
      : `/onboarding?callbackUrl=${encodeURIComponent(safeTarget)}`;
  };

  const login = async (email: string, password: string, redirectTo?: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed.');

    setUser(data.user);
    router.push(resolvePostAuthPath(data.user, redirectTo));
  };

  const register = async (name: string, email: string, password: string, redirectTo?: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed.');

    setUser(data.user);
    router.push(resolvePostAuthPath(data.user, redirectTo));
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
