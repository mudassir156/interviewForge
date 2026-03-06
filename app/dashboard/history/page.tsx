'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Download, Calendar, Users, Clock, Code2, History, SortAsc, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

type HistorySession = {
  roomId: string;
  title: string;
  language: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  status: 'active' | 'completed' | 'archived';
  participants?: string[];
  createdAt: string;
  updatedAt: string;
};

const difficultyConfig: Record<string, { label: string; className: string }> = {
  easy: { label: 'Easy', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  medium: { label: 'Medium', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  hard: { label: 'Hard', className: 'bg-red-500/15 text-red-400 border-red-500/20' },
};

const languageColors: Record<string, string> = {
  javascript: 'from-yellow-500 to-amber-500',
  python: 'from-blue-500 to-cyan-500',
  java: 'from-orange-500 to-red-500',
  cpp: 'from-purple-500 to-indigo-500',
  go: 'from-cyan-500 to-blue-500',
  rust: 'from-orange-600 to-amber-600',
};

export default function HistoryPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [sortBy, setSortBy] = useState<'date' | 'duration'>('date');
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);
  const searchQuery = (searchParams.get('q') ?? '').trim().toLowerCase();

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ status: 'completed' });
        if (user?.id) {
          params.set('userId', user.id);
        }

        const response = await fetch(`/api/rooms?${params.toString()}`, {
          credentials: 'include',
          cache: 'no-store',
        });
        const data = await response.json();
        if (response.ok && Array.isArray(data.rooms)) {
          setSessions(data.rooms);
        }
      } catch (error) {
        console.error('[v0] Failed to fetch history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user?.id]);

  const formatLanguage = (language: string) =>
    language === 'cpp'
      ? 'C++'
      : language.charAt(0).toUpperCase() + language.slice(1);

  const getDurationMs = (session: HistorySession) => {
    const start = new Date(session.createdAt).getTime();
    const end = new Date(session.updatedAt).getTime();
    return Math.max(0, end - start);
  };

  const formatDuration = (durationMs: number) => {
    if (durationMs <= 0) return 'N/A';
    const totalSeconds = Math.floor(durationMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const filteredSessions = useMemo(() => sessions.filter((session) => {
    if (!searchQuery) return true;
    const searchableText = `${session.title} ${session.roomId} ${session.language} ${session.difficulty ?? ''}`.toLowerCase();
    return searchableText.includes(searchQuery);
  }), [sessions, searchQuery]);

  const sortedHistory = useMemo(() => [...filteredSessions].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return getDurationMs(b) - getDurationMs(a);
  }), [filteredSessions, sortBy]);

  const formatDate = (dateValue: string) =>
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateValue));

  const handleExport = (session: HistorySession) => {
    const durationMs = getDurationMs(session);
    const participantCount = session.participants?.length ?? 0;
    const data = {
      title: session.title,
      language: formatLanguage(session.language),
      difficulty: session.difficulty ?? 'medium',
      duration: formatDuration(durationMs),
      date: formatDate(session.createdAt),
      participants: participantCount,
      status: session.status,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-${session.title.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (session: HistorySession) => {
    if (!user?.id || deletingRoomId) return;

    const confirmed = window.confirm(`Delete "${session.title}" from history? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingRoomId(session.roomId);
    try {
      const response = await fetch('/api/rooms', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ roomId: session.roomId, userId: user.id }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete history');
      }

      setSessions((previous) => previous.filter((item) => item.roomId !== session.roomId));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Failed to delete history');
    } finally {
      setDeletingRoomId(null);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8" aria-busy="true" aria-live="polite">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-56 max-w-full" />
              <Skeleton className="h-4 w-40 max-w-full" />
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/50 px-3 py-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading history
            </div>
          </div>

          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-border bg-card/60 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-5 w-64 max-w-full" />
                    <Skeleton className="h-4 w-72 max-w-full" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <History className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50">History</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Interview <span className="gradient-text">History</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground/70">{sortedHistory.length} past sessions</p>
          </div>

          {/* Sort tabs */}
          <div className="flex items-center gap-2">
            <SortAsc className="h-4 w-4 text-muted-foreground/50" />
            <div className="flex rounded-xl border border-border bg-card/60 p-1 gap-1">
              {(['date', 'duration'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSortBy(tab)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all duration-200 ${
                    sortBy === tab
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20'
                      : 'text-muted-foreground/60 hover:text-muted-foreground'
                  }`}
                >
                  {tab === 'date' ? 'Latest First' : 'Duration'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* History list */}
        <div className="space-y-3">
          {sortedHistory.length > 0 ? (
            sortedHistory.map((session, i) => {
              const diff = difficultyConfig[session.difficulty || 'medium'];
              const langGradient = languageColors[session.language] || 'from-slate-500 to-slate-600';
              const participantCount = session.participants?.length ?? 0;
              const durationMs = getDurationMs(session);

              return (
                <div
                  key={session.roomId}
                  className={`card-glow surface-card group rounded-2xl p-4 sm:p-5 fade-up`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Icon */}
                    <div className={`hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${langGradient}`}>
                      <Code2 className="h-5 w-5 text-white" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className="text-base font-semibold text-foreground group-hover:text-foreground transition-colors">
                          {session.title}
                        </h3>
                        <Badge className={`${diff.className} border text-xs`}>{diff.label}</Badge>
                        {session.status === 'completed' && (
                          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                            Completed
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground/60">
                        <span className="flex items-center gap-1.5">
                          <div className={`h-3 w-3 rounded-sm bg-gradient-to-br ${langGradient}`} />
                          {formatLanguage(session.language)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          {formatDate(session.createdAt)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="h-3 w-3" />
                          {participantCount} participant{participantCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Duration + Actions */}
                    <div className="flex items-center gap-3 sm:shrink-0">
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-0.5">Duration</p>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-indigo-400" />
                          <span className="text-sm font-bold text-foreground">{formatDuration(durationMs)}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport(session)}
                        disabled={deletingRoomId === session.roomId}
                        className="rounded-xl gap-2 border-border bg-card/60 hover:bg-muted/40 transition-all duration-200 text-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(session)}
                        disabled={deletingRoomId !== null}
                        className="rounded-xl gap-2 border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200 text-xs"
                      >
                        {deletingRoomId === session.roomId ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="surface-card rounded-2xl p-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-indigo-purple opacity-60">
                <History className="h-8 w-8 text-white" />
              </div>
              <p className="text-lg font-semibold text-foreground mb-2">No interview history</p>
              <p className="text-sm text-muted-foreground mb-6">Complete your first interview to see it here.</p>
              <Link href="/dashboard/create-room">
                <Button className="btn-glow gradient-indigo-purple border-0 rounded-xl text-white">
                  Create Interview Room
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}


