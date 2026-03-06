'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Plus, Play, Clock, Archive, Users, Code2, TrendingUp, Activity, Sparkles, BookOpen, CheckCircle2, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatsCard } from '@/components/dashboard/stats-card';
import { useAuth } from '@/contexts/AuthContext';

type Room = {
  _id?: string;
  roomId: string;
  title: string;
  language: string;
  participants?: string[];
  createdAt: string;
  updatedAt?: string;
  status: 'active' | 'completed' | 'archived';
  difficulty?: 'easy' | 'medium' | 'hard';
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
  typescript: 'from-blue-400 to-indigo-500',
  go: 'from-cyan-500 to-blue-500',
  rust: 'from-orange-600 to-amber-600',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchQuery = (searchParams.get('q') ?? '').trim().toLowerCase();

  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (user?.id) {
          params.set('userId', user.id);
        }
        const queryString = params.toString();
        const response = await fetch(`/api/rooms${queryString ? `?${queryString}` : ''}`, {
          credentials: 'include',
          cache: 'no-store',
        });
        const data = await response.json();
        if (response.ok && Array.isArray(data.rooms)) {
          setRooms(data.rooms);
        }
      } catch (error) {
        console.error('[v0] Failed to fetch rooms:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, [user?.id]);

  const filteredRooms = rooms.filter(room => {
    const searchableText = `${room.title} ${room.roomId} ${room.language} ${room.difficulty ?? ''}`.toLowerCase();

    const matchesStatus =
      filter === 'active'
        ? room.status === 'active'
        : filter === 'completed'
          ? room.status === 'completed'
          : true;

    const matchesSearch = !searchQuery || searchableText.includes(searchQuery);

    if (!matchesStatus) return false;
    if (!matchesSearch) return false;
    return true;
  });

  const stats = useMemo(() => {
    const totalRooms = rooms.length;
    const activeSessions = rooms.filter((room) => room.status === 'active').length;
    const completedRooms = rooms.filter((room) => room.status === 'completed').length;
    const totalParticipants = rooms.reduce((sum, room) => sum + (room.participants?.length ?? 0), 0);

    return [
      {
        label: 'Total Rooms',
        value: String(totalRooms),
        icon: <BookOpen className="h-5 w-5" strokeWidth={2.2} />,
        iconBg: 'from-indigo-500 to-purple-500',
      },
      {
        label: 'Active Sessions',
        value: String(activeSessions),
        icon: <Activity className="h-5 w-5" strokeWidth={2.2} />,
        iconBg: 'from-amber-500 to-orange-500',
      },
      {
        label: 'Completed',
        value: String(completedRooms),
        icon: <CheckCircle2 className="h-5 w-5" strokeWidth={2.2} />,
        iconBg: 'from-emerald-500 to-teal-500',
      },
      {
        label: 'Participants',
        value: String(totalParticipants),
        icon: <Users className="h-5 w-5" strokeWidth={2.2} />,
        iconBg: 'from-cyan-500 to-blue-500',
      },
    ];
  }, [rooms]);

  const weekStart = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 7);
    return date;
  }, []);

  const weekRooms = useMemo(
    () => rooms.filter((room) => new Date(room.createdAt).getTime() >= weekStart.getTime()),
    [rooms, weekStart]
  );

  const averageDurationMs = useMemo(() => {
    if (weekRooms.length === 0) return 0;
    const total = weekRooms.reduce((sum, room) => {
      const start = new Date(room.createdAt).getTime();
      const end = new Date(room.updatedAt || room.createdAt).getTime();
      return sum + Math.max(0, end - start);
    }, 0);
    return Math.round(total / weekRooms.length);
  }, [weekRooms]);

  const formatMinutes = (durationMs: number) => {
    if (!durationMs) return 'N/A';
    const minutes = Math.floor(durationMs / (1000 * 60));
    return `${minutes} min`;
  };

  const topLanguages = useMemo(() => {
    const counts = rooms.reduce<Record<string, number>>((acc, room) => {
      acc[room.language] = (acc[room.language] || 0) + 1;
      return acc;
    }, {});

    const total = rooms.length || 1;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([lang, count]) => ({
        lang,
        count,
        pct: Math.round((count / total) * 100),
        gradient: languageColors[lang] || 'from-slate-500 to-slate-600',
      }));
  }, [rooms]);

  const formatRelativeTime = (dateValue: string) => {
    const date = new Date(dateValue);
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const formatLanguage = (language: string) =>
    language === 'cpp'
      ? 'C++'
      : language.charAt(0).toUpperCase() + language.slice(1);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8" aria-busy="true" aria-live="polite">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-64 max-w-full" />
              <Skeleton className="h-4 w-80 max-w-full" />
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/50 px-3 py-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading dashboard
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-border bg-card/60 p-4">
                <Skeleton className="mb-4 h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-border bg-card/60 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-5 w-64 max-w-full" />
                    <Skeleton className="h-4 w-72 max-w-full" />
                  </div>
                  <Skeleton className="h-9 w-24 shrink-0" />
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
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Dashboard</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Good morning, <span className="gradient-text capitalize">{user?.name ?? 'there'}</span> 👋
            </h1>
            <p className="mt-1 text-muted-foreground/70 text-sm">Here&apos;s what&apos;s happening with your interview sessions.</p>
          </div>
          <Link href="/dashboard/create-room">
            <Button
              size="lg"
              className="btn-glow gradient-indigo-purple border-0 gap-2 rounded-xl text-white font-semibold shadow-2xl"
              style={{ boxShadow: '0 0 20px rgba(99,102,241,0.35)' }}
            >
              <Plus className="w-4 h-4" />
              New Interview Room
            </Button>
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className={`fade-up`} style={{ animationDelay: `${i * 60}ms` }}>
              <StatsCard
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                iconBg={stat.iconBg}
              />
            </div>
          ))}
        </div>

        {/* Rooms section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">Interview Rooms</h2>
              <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-400">
                {filteredRooms.length}
              </span>
            </div>
            {/* Filter tabs */}
            <div className="flex rounded-xl border border-border bg-card/60 p-1 gap-1">
              {(['all', 'active', 'completed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all duration-200 ${
                    filter === tab
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20'
                      : 'text-muted-foreground/60 hover:text-muted-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredRooms.length > 0 ? (
              filteredRooms.map((room, i) => {
                const diff = difficultyConfig[room.difficulty || 'medium'];
                const langGradient = languageColors[room.language] || 'from-slate-500 to-slate-600';
                const isActive = room.status === 'active';
                const participantCount = room.participants?.length ?? 0;

                return (
                  <div
                    key={room.roomId}
                    className={`card-glow surface-card group relative overflow-hidden rounded-2xl p-4 sm:p-5 fade-up`}
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    {/* Active glow strip */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 to-cyan-500 rounded-l-2xl" />
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Language icon */}
                      <div className={`hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${langGradient} shadow-lg`}>
                        <Code2 className="h-5 w-5 text-white" />
                      </div>

                      {/* Room info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <h3 className="text-base font-semibold text-foreground group-hover:text-foreground transition-colors truncate">
                            {room.title}
                          </h3>
                          {isActive && (
                            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
                              Live
                            </span>
                          )}
                          {!isActive && (
                            <span className="rounded-full border border-border bg-card/60 px-2 py-0.5 text-xs text-muted-foreground/60">
                              Completed
                            </span>
                          )}
                          <Badge className={`${diff.className} border text-xs`}>
                            {diff.label}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground/60">
                          <span className="flex items-center gap-1.5">
                            <div className={`h-3 w-3 rounded-sm bg-gradient-to-br ${langGradient}`} />
                            {formatLanguage(room.language)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className="h-3 w-3" />
                            {participantCount} participant{participantCount !== 1 ? 's' : ''}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(room.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 sm:shrink-0">
                        {isActive ? (
                          <Link href={`/interview/${room.roomId}`}>
                            <Button
                              size="sm"
                              className="btn-glow gradient-indigo-purple border-0 rounded-xl gap-1.5 text-white font-semibold"
                              style={{ boxShadow: '0 0 15px rgba(99,102,241,0.3)' }}
                            >
                              <Play className="w-3.5 h-3.5" />
                              Join Room
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/dashboard/history`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl gap-1.5 border-border bg-card/60 hover:bg-muted/40 transition-all duration-200"
                            >
                              <Archive className="w-3.5 h-3.5" />
                              View
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="surface-card rounded-2xl p-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-indigo-purple opacity-60">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <p className="text-lg font-semibold text-foreground mb-2">No rooms found</p>
                <p className="text-sm text-muted-foreground mb-6">Create your first interview room to get started.</p>
                <Link href="/dashboard/create-room">
                  <Button className="btn-glow gradient-indigo-purple border-0 rounded-xl text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Room
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick insights */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="surface-card card-glow rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-foreground">This Week</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Interviews conducted', value: String(weekRooms.length), bar: Math.min(100, weekRooms.length * 10) },
                { label: 'Avg. session length', value: formatMinutes(averageDurationMs), bar: Math.min(100, Math.floor(averageDurationMs / (1000 * 60))) },
                {
                  label: 'Completion rate',
                  value: `${weekRooms.length ? Math.round((weekRooms.filter((room) => room.status === 'completed').length / weekRooms.length) * 100) : 0}%`,
                  bar: weekRooms.length ? Math.round((weekRooms.filter((room) => room.status === 'completed').length / weekRooms.length) * 100) : 0,
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground/70">{item.label}</span>
                    <span className="text-foreground font-semibold">{item.value}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-border/60 overflow-hidden">
                    <div
                      className="h-full rounded-full gradient-indigo-purple transition-all duration-1000"
                      style={{ width: `${item.bar}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card card-glow rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Code2 className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-foreground">Top Languages</h3>
            </div>
            <div className="space-y-3">
              {topLanguages.map((item) => (
                <div key={item.lang} className="flex items-center gap-3">
                  <div className={`h-6 w-6 rounded-md bg-gradient-to-br ${item.gradient} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-foreground font-medium">{formatLanguage(item.lang)}</span>
                      <span className="text-muted-foreground/60">{item.count} sessions</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-border/60 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${item.gradient}`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {topLanguages.length === 0 && (
                <p className="text-xs text-muted-foreground/70">No language data available yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

