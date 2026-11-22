'use client';

import { useState } from 'react';
import { History, ChevronDown, ChevronUp, Star, ThumbsUp, AlertCircle } from 'lucide-react';
import type { IterationRecord } from '@/types/agenticWriter';

interface IterationHistoryDrawerProps {
  history: IterationRecord[];
}

export function IterationHistoryDrawer({ history }: IterationHistoryDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIteration, setSelectedIteration] = useState<number>(history.length);

  if (!history || history.length === 0) return null;

  const currentItem = history.find((h) => h.iteration === selectedIteration) || history[history.length - 1];

  return (
    <div className="w-full bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="iteration-history-content"
        className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center">
            <History className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            Draft Revision History ({history.length} {history.length === 1 ? 'iteration' : 'iterations'})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-zinc-400">
            {isOpen ? 'Collapse history' : 'Inspect iterations'}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          )}
        </div>
      </button>

      {isOpen && (
        <div id="iteration-history-content" className="p-5 border-t border-zinc-200/80 dark:border-zinc-800 space-y-4">
          {/* Iteration Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1" role="tablist">
            {history.map((record) => {
              const isSelected = record.iteration === currentItem.iteration;
              return (
                <button
                  key={record.iteration}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedIteration(record.iteration)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <span>Cycle {record.iteration}</span>
                  <span className="text-[10px] font-mono opacity-80 flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    {record.review?.score?.toFixed(1) ?? 'N/A'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Iteration Detail */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800">
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Iteration {currentItem.iteration} Copy
              </span>
              <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                Score: {currentItem.review?.score?.toFixed(1) ?? 'N/A'} / 10
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-400 block mb-0.5">
                  Headline
                </span>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {currentItem.draft?.headline}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-400 block mb-0.5">
                  Description
                </span>
                <p className="text-zinc-600 dark:text-zinc-300">
                  {currentItem.draft?.description}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-400 block mb-0.5">
                  Call to Action
                </span>
                <span className="inline-block px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded text-zinc-800 dark:text-zinc-200 font-medium">
                  {currentItem.draft?.callToAction}
                </span>
              </div>
            </div>

            {/* Critique Feedback */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-zinc-200/60 dark:border-zinc-800 text-[11px]">
              <div>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1">
                  <ThumbsUp className="w-3 h-3" /> Strengths
                </span>
                <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
                  {currentItem.review?.strengths?.map((s, idx) => (
                    <li key={idx}>&bull; {s}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 mb-1">
                  <AlertCircle className="w-3 h-3" /> Improvements Needed
                </span>
                <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
                  {currentItem.review?.feedback?.map((f, idx) => (
                    <li key={idx}>&bull; {f}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
