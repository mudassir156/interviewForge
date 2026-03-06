import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

export default function InterviewRoomLoading() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-gradient-dark" aria-busy="true" aria-live="polite">
      <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-6 py-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-52" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Preparing room
        </div>
      </header>

      <main className="grid min-h-0 flex-1 gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="grid min-h-0 gap-4 rounded-xl border border-border bg-card/40 p-4">
          <div className="min-h-0 rounded-lg border border-border bg-card/40 p-4">
            <Skeleton className="mb-4 h-5 w-40" />
            <Skeleton className="h-[calc(100%-2.25rem)] w-full" />
          </div>
          <div className="h-40 rounded-lg border border-border bg-card/40 p-4">
            <Skeleton className="mb-4 h-5 w-36" />
            <Skeleton className="h-20 w-full" />
          </div>
        </section>

        <aside className="grid min-h-0 gap-4">
          <div className="rounded-xl border border-border bg-card/40 p-4">
            <Skeleton className="mb-3 h-5 w-28" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card/40 p-4">
            <Skeleton className="mb-3 h-5 w-24" />
            <Skeleton className="h-40 w-full" />
          </div>
        </aside>
      </main>
    </div>
  );
}
