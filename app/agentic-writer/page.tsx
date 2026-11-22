'use client';

import { AppHeader } from '@/components/navigation/AppHeader';
import { useAgenticWriter } from '@/hooks/useAgenticWriter';
import {
  AgenticTaskInput,
  AgenticStatusTracker,
  HumanReviewConsole,
  CompletedDraftView,
  TokenTelemetryCard,
  IterationHistoryDrawer,
} from '@/components/agentic';
import { Sparkles, AlertCircle, Bot, ShieldCheck, RefreshCw } from 'lucide-react';

export default function AgenticWriterPage() {
  const {
    status,
    task,
    threadId,
    humanReviewData,
    completedData,
    history,
    tokenUsage,
    error,
    startPipeline,
    resumePipeline,
    reset,
  } = useAgenticWriter();

  const activeIteration =
    history.length > 0
      ? history.length
      : completedData?.evaluation?.iterations ?? 0;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-[#0d9488]/20 selection:text-[#0d9488]">
      <AppHeader activeBadge="Agentic HITL" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-teal-600 dark:text-teal-400 font-semibold">
                Autonomous LangGraph Pipeline
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
              Agentic Copywriting & Human-in-the-Loop Studio
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Dual-agent feedback loop with real-time SEO evaluation, automated threshold checks, and human interruption controls.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
              <Bot className="w-3.5 h-3.5 text-teal-600" />
              Writer + Reviewer
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              HITL Gate
            </span>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-200 flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Pipeline Error</p>
                <p className="mt-0.5 opacity-90">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={reset}
              className="text-xs font-medium underline hover:opacity-80 shrink-0"
            >
              Reset Pipeline
            </button>
          </div>
        )}

        {/* Task Input (When Idle or Error) */}
        {(status === 'idle' || status === 'error') && (
          <AgenticTaskInput
            status={status}
            onSubmit={startPipeline}
          />
        )}

        {/* Active Pipeline Status Tracker */}
        {status !== 'idle' && (
          <AgenticStatusTracker
            status={status}
            iteration={activeIteration}
          />
        )}

        {/* Current Task Display (When Working) */}
        {status !== 'idle' && status !== 'error' && task && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800 text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="font-semibold text-zinc-500 shrink-0">Current Task:</span>
              <span className="text-zinc-800 dark:text-zinc-200 truncate font-medium">
                {task}
              </span>
            </div>
            {status === 'completed' && (
              <button
                type="button"
                onClick={reset}
                className="text-teal-600 dark:text-teal-400 hover:underline shrink-0 font-medium ml-3 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Change Task
              </button>
            )}
          </div>
        )}

        {/* Human in the Loop Console */}
        {(status === 'awaiting_human' || status === 'resuming') && (
          <HumanReviewConsole
            data={humanReviewData}
            threadId={threadId}
            onResume={resumePipeline}
            isLoading={status === 'resuming'}
          />
        )}

        {/* Completed Output Hero View */}
        {status === 'completed' && completedData && (
          <CompletedDraftView
            data={completedData}
            onReset={reset}
          />
        )}

        {/* Revision History & Telemetry (Visible when there is data) */}
        {history.length > 0 && (
          <div className="space-y-4 pt-2">
            <IterationHistoryDrawer history={history} />
            <TokenTelemetryCard usage={tokenUsage || completedData?.tokenUsage || null} />
          </div>
        )}

        {/* Empty State Helper */}
        {status === 'idle' && (
          <div className="p-8 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 mx-auto flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Autonomous Loop with Safety Gates
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mt-1 leading-relaxed">
                The Writer Agent creates high-converting copy, the SEO Reviewer critically evaluates it, and the Decider routes to human approval if threshold isn&apos;t automatically reached within 2 iterations.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
