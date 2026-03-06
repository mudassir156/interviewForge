import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <DashboardLayout>
      <div className="space-y-8" aria-busy="true" aria-live="polite">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/50 px-3 py-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Syncing live data
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
