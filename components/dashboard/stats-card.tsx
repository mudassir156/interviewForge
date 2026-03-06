'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  iconBg?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
}

export function StatsCard({ label, value, icon, iconBg = 'from-indigo-500 to-purple-500', trend, description }: StatsCardProps) {
  return (
    <div
      className="card-glow surface-card group relative overflow-hidden rounded-2xl p-5"
      style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset' }}
    >
      {/* Background gradient glow */}
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60 mb-3">{label}</p>
          <p className="text-3xl font-black tracking-tight text-foreground tabular-nums">{value}</p>
          {trend && (
            <div className={cn(
              'mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
              trend.isPositive
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-red-500/15 text-red-400'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              <span className="font-normal opacity-70">vs last month</span>
            </div>
          )}
          {description && (
            <p className="mt-2 text-xs text-muted-foreground/60">{description}</p>
          )}
        </div>
        {icon && (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br ${iconBg} text-white shadow-lg`}
            style={{ boxShadow: '0 2px 10px rgba(15,23,42,0.28)' }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
