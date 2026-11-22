'use client';

import { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, Lightbulb } from 'lucide-react';
import type { AgenticStatus } from '@/types/agenticWriter';

const SUGGESTIONS = [
  'B2B SaaS Cloud Migration & DevOps consulting service',
  'Autonomous AI Code Review assistant for enterprise teams',
  'High-velocity Mobile & Full-Stack app development studio',
];

interface AgenticTaskInputProps {
  status: AgenticStatus;
  onSubmit: (task: string) => void;
  disabled?: boolean;
}

export function AgenticTaskInput({
  status,
  onSubmit,
  disabled = false,
}: AgenticTaskInputProps) {
  const [task, setTask] = useState('');
  const isLoading = status === 'starting' || status === 'resuming';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (task.trim() && !isLoading && !disabled) {
      onSubmit(task);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setTask(suggestion);
    if (!isLoading && !disabled) {
      onSubmit(suggestion);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200/60 dark:border-teal-800/60">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Launch Copywriting Task
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Provide the product, service, or goal for 10xDevs landing-page copy.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="relative">
          <label htmlFor="agentic-task-input" className="sr-only">
            Landing page copywriting task description
          </label>
          <textarea
            id="agentic-task-input"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            disabled={isLoading || disabled}
            rows={3}
            aria-label="Landing page copywriting task description"
            placeholder="e.g. Write a high-converting landing-page hero section for 10xDevs specialized Kubernetes consulting service for fintech companies..."
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Quick Suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500 shrink-0">
              <Lightbulb className="w-3 h-3 text-amber-500" />
              Examples:
            </span>
            {SUGGESTIONS.map((item) => (
              <button
                key={item}
                type="button"
                title={item}
                aria-label={`Use template: ${item}`}
                disabled={isLoading || disabled}
                onClick={() => handleSuggestionClick(item)}
                className="px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/70 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 rounded-md border border-zinc-200/60 dark:border-zinc-700/60 transition-colors disabled:opacity-50"
              >
                {item.split(' ')[0]} {item.split(' ')[1]}...
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={!task.trim() || isLoading || disabled}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 active:scale-[0.98] shadow-xs transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Running Pipeline...</span>
              </>
            ) : (
              <>
                <span>Start Pipeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
