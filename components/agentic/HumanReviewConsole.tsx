'use client';

import { useState } from 'react';
import {
  CheckCircle,
  RefreshCw,
  AlertCircle,
  ThumbsUp,
  Sliders,
  Send,
  Loader2,
  Sparkles,
} from 'lucide-react';
import type { HumanReviewData } from '@/types/agenticWriter';

interface HumanReviewConsoleProps {
  data: HumanReviewData | null;
  threadId: string | null;
  onResume: (action: 'approve' | 'improve', feedback?: string) => void;
  isLoading?: boolean;
}

export function HumanReviewConsole({
  data,
  threadId,
  onResume,
  isLoading = false,
}: HumanReviewConsoleProps) {
  const [mode, setMode] = useState<'decision' | 'improving'>('decision');
  const [feedback, setFeedback] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!data) return null;

  const draft = data.draft;
  const review = data.review;
  const score = data.bestScore ?? review?.score ?? 0;

  const handleApprove = () => {
    if (isLoading) return;
    onResume('approve');
  };

  const handleImproveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!feedback.trim()) {
      setValidationError('Please provide specific feedback on what to change.');
      return;
    }

    setValidationError(null);
    onResume('improve', feedback.trim());
  };

  const getScoreBadgeColor = (val: number) => {
    if (val >= 8.5) return 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800';
    if (val >= 7.0) return 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800';
    return 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800';
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900/80 border-2 border-purple-500/50 rounded-2xl p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200/80 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 flex items-center justify-center border border-purple-300 dark:border-purple-700">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Human-in-the-Loop Review Console
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300/80 dark:border-purple-700/80">
                Interrupted
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              The decider paused the loop for human judgment. Review the draft below.
            </p>
          </div>
        </div>

        {threadId && (
          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700">
            Thread: {threadId.slice(0, 8)}...
          </span>
        )}
      </div>

      {/* Main Grid: Draft Card + Reviewer Evaluation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 my-5">
        {/* Left: Draft Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-500" />
              Proposed Landing Page Copy
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 space-y-3.5">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1">
                Headline
              </span>
              <h4 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                {draft?.headline || 'No headline generated'}
              </h4>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1">
                Supporting Description
              </span>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {draft?.description || 'No description generated'}
              </p>
            </div>

            <div className="pt-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1.5">
                Call to Action
              </span>
              <div className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 shadow-xs">
                {draft?.callToAction || 'Get Started'}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Reviewer Critique (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Reviewer Critique
            </span>
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${getScoreBadgeColor(score)}`}>
              Score: {score.toFixed(1)} / 10
            </span>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 space-y-3 text-xs">
            {/* Strengths */}
            {review?.strengths && review.strengths.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1.5">
                  <ThumbsUp className="w-3 h-3" />
                  Identified Strengths
                </span>
                <ul className="space-y-1">
                  {review.strengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-zinc-600 dark:text-zinc-300 text-[11px] leading-tight">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Feedback / Weaknesses */}
            {review?.feedback && review.feedback.length > 0 && (
              <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 mb-1.5">
                  <AlertCircle className="w-3 h-3" />
                  Actionable Feedback
                </span>
                <ul className="space-y-1">
                  {review.feedback.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-zinc-600 dark:text-zinc-300 text-[11px] leading-tight">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Human Actions Bar */}
      <div className="pt-4 border-t border-zinc-200/80 dark:border-zinc-800">
        {mode === 'decision' ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Approve this draft as final, or request changes with custom guidance.
            </p>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setMode('improving')}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Request Improvements</span>
              </button>

              <button
                type="button"
                onClick={handleApprove}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] shadow-xs transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Approving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleImproveSubmit} className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="human-feedback-input"
                  className="text-xs font-semibold text-zinc-800 dark:text-zinc-200"
                >
                  Provide Guidance for the Copywriter Agent
                </label>
                <button
                  type="button"
                  onClick={() => setMode('decision')}
                  disabled={isLoading}
                  className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline"
                >
                  Cancel
                </button>
              </div>

              <textarea
                id="human-feedback-input"
                value={feedback}
                onChange={(e) => {
                  setFeedback(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                disabled={isLoading}
                rows={2}
                aria-invalid={!!validationError}
                aria-describedby={validationError ? "feedback-error" : undefined}
                placeholder="e.g. Make the headline punchier, emphasize 24/7 reliability, and change the CTA to 'Schedule a Architecture Call'..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
              />
              {validationError && (
                <p id="feedback-error" role="alert" className="text-[11px] text-rose-500 mt-1 font-medium">
                  {validationError}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setMode('decision')}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={!feedback.trim() || isLoading}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 active:scale-[0.98] shadow-xs transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Resuming Workflow...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Guidance & Resume</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
