'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { CodeEditor } from '@/components/interview/code-editor';
import { ExecutionPanel } from '@/components/interview/execution-panel';
import type { ExecutionResult } from '@/components/interview/execution-panel';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Code2 } from 'lucide-react';

function CodeExecutionContent() {
  const { user } = useAuth();
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const sandboxRoomId = user?.id ? `sandbox-${user.id}` : 'sandbox';

  return (
    <DashboardLayout>
      <div className="space-y-6 fade-up">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Code2 className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50">Code Execution</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Code <span className="gradient-text">Execution</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground/70">Write and run code without opening an interview room.</p>
          </div>

          <Link href="/dashboard/help">
            <Button variant="outline" className="gap-2 rounded-xl">
              <ArrowLeft className="h-4 w-4" />
              Back to Help
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 h-[calc(100dvh-14rem)] min-h-[34rem] grid-rows-[minmax(0,1fr)_12rem] lg:grid-rows-[minmax(0,1fr)_14rem]">
          <div className="min-h-0 flex">
            <CodeEditor
              roomId={sandboxRoomId}
              userId={user?.id}
              onExecute={setExecutionResult}
              onExecuting={setIsExecuting}
              enableCollaboration={false}
            />
          </div>

          <div className="min-h-0">
            <ExecutionPanel result={executionResult} isExecuting={isExecuting} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function CodeExecutionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CodeExecutionContent />
    </Suspense>
  );
}