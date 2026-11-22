'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import type { PipelineApiResponse } from '@/types/agenticWriter';

interface CompletedDraftViewProps {
  data: PipelineApiResponse | null;
  onReset: () => void;
}

export function CompletedDraftView({ data, onReset }: CompletedDraftViewProps) {
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const draft = data.draft;
  const review = data.review;
  const evaluation = data.evaluation;
  const humanDecision = data.humanDecision;

  const score = evaluation?.bestScore ?? review?.score ?? 0;

  const handleCopy = async () => {
    if (!draft) return;
    const text = `${draft.headline}\n\n${draft.description}\n\nCTA: ${draft.callToAction}`;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  const humanActionLabel = humanDecision?.action
    ? humanDecision.action === 'approve'
      ? 'Human Approved'
      : 'Human Guided Revision'
    : 'Automated (Threshold Met)';

  return (
    <div className="w-full space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-900 dark:text-emerald-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">
              Production-Grade Landing Page Ready
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              {evaluation?.reason || 'Pipeline finished with passing quality criteria.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!draft}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 shadow-2xs hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Hero Landing Page Mockup */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-md">
        {/* Browser Mock Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-100/80 dark:bg-zinc-900 border-b border-zinc-200/80 dark:border-zinc-800">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
          </div>

          <div className="flex items-center gap-2 px-3 py-0.5 rounded-md bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 max-w-xs w-full justify-center">
            <span className="text-zinc-400">https://</span>10xdevs.com/launch
          </div>

          <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
        </div>

        {/* Live Mock Hero Canvas */}
        <div className="p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            <Sparkles className="w-3 h-3" />
            10xDevs Software Engineering
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
            {draft?.headline}
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
            {draft?.description}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm transition-all"
            >
              {draft?.callToAction || 'Get Started Now'}
            </button>
            <span className="text-xs text-zinc-400">No long contracts &bull; 100% Guaranteed</span>
          </div>
        </div>
      </div>

      {/* Metrics & Evaluation Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
              Final Score
            </span>
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              {score.toFixed(1)} / 10
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
              Loop Iterations
            </span>
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              {evaluation?.iterations ?? 1} cycles
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
              Human Review Status
            </span>
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {humanActionLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
