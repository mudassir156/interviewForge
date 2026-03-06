'use client';

import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export interface ExecutionResult {
  output: string;
  error: string | null;
  success: boolean;
  executionTime: number;
}

interface ExecutionPanelProps {
  result?: ExecutionResult | null;
  isExecuting?: boolean;
}

export function ExecutionPanel({ result, isExecuting }: ExecutionPanelProps) {
  return (
    <Card className="glass-dark border-border h-full flex flex-col overflow-hidden p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">Output</h3>

      <div className="flex-1 overflow-auto">
        {isExecuting ? (
          <div className="h-full flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            <p className="text-sm text-muted-foreground">Executing...</p>
          </div>
        ) : !result ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-muted-foreground text-center">
              Run your code to see output here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {!result.success && result.error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-semibold text-red-300">Error</span>
                </div>
                <pre className="text-xs text-red-200 overflow-x-auto whitespace-pre-wrap">
                  {result.error}
                </pre>
              </div>
            )}

            {result.success && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-semibold text-green-300">Success</span>
                </div>
                <pre className="text-xs text-green-200 overflow-x-auto whitespace-pre-wrap">
                  {result.output || '(no output)'}
                </pre>
              </div>
            )}

            <div className="text-xs text-muted-foreground pt-2 border-t border-border">
              Execution time: {result.executionTime}ms
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
