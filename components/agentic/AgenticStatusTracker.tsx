'use client';

import { PenLine, SearchCheck, GitFork, UserCheck, CheckCircle2, Loader2 } from 'lucide-react';
import type { AgenticStatus } from '@/types/agenticWriter';

interface AgenticStatusTrackerProps {
  status: AgenticStatus;
  iteration?: number;
}

export function AgenticStatusTracker({ status, iteration = 0 }: AgenticStatusTrackerProps) {
  if (status === 'idle') return null;

  const steps = [
    {
      id: 'writer',
      label: 'Writer Agent',
      desc: 'Crafts headline, description & CTA',
      icon: PenLine,
      isActive: status === 'starting' || status === 'resuming',
      isDone: status === 'awaiting_human' || status === 'completed',
    },
    {
      id: 'reviewer',
      label: 'SEO & Quality Reviewer',
      desc: 'Scores 0–10 & identifies weaknesses',
      icon: SearchCheck,
      isActive: status === 'starting' || status === 'resuming',
      isDone: status === 'awaiting_human' || status === 'completed',
    },
    {
      id: 'decider',
      label: 'Threshold Decider',
      desc: 'Evaluates score ≥8.5 or budget',
      icon: GitFork,
      isActive: status === 'starting' || status === 'resuming',
      isDone: status === 'awaiting_human' || status === 'completed',
    },
    {
      id: 'hitl',
      label: 'Human in the Loop',
      desc: 'Pauses for manual review & guidance',
      icon: UserCheck,
      isActive: status === 'awaiting_human' || status === 'resuming',
      isDone: status === 'completed',
    },
    {
      id: 'completed',
      label: 'Approved Copy',
      desc: 'Production-ready landing asset',
      icon: CheckCircle2,
      isActive: false,
      isDone: status === 'completed',
    },
  ];

  return (
    <div className="w-full bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Pipeline Execution State
          </span>
          {iteration > 0 && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60">
              Iteration {iteration}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs font-medium">
          {status === 'starting' && (
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Running autonomous loop...
            </span>
          )}
          {status === 'resuming' && (
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Resuming with human feedback...
            </span>
          )}
          {status === 'awaiting_human' && (
            <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Workflow Interrupted — Awaiting Human Input
            </span>
          )}
          {status === 'completed' && (
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Pipeline Complete
            </span>
          )}
        </div>
      </div>

      {/* Steps Row */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {steps.map((step) => {
          const Icon = step.icon;
          const isCurrentInterrupted = step.id === 'hitl' && status === 'awaiting_human';

          return (
            <div
              key={step.id}
              className={`p-3 rounded-xl border transition-all ${
                isCurrentInterrupted
                  ? 'border-purple-500/60 bg-purple-50/60 dark:bg-purple-950/30 ring-2 ring-purple-500/20'
                  : step.isDone
                  ? 'border-emerald-300/80 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20'
                  : step.isActive
                  ? 'border-teal-400/80 dark:border-teal-700/80 bg-teal-50/40 dark:bg-teal-950/20 animate-pulse'
                  : 'border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isCurrentInterrupted
                      ? 'bg-purple-600 text-white'
                      : step.isDone
                      ? 'bg-emerald-600 text-white'
                      : step.isActive
                      ? 'bg-teal-600 text-white'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {step.label}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
