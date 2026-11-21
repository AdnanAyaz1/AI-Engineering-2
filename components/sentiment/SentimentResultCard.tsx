import { CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';
import type { SentimentResult } from '@/types/sentiment';

interface SentimentResultCardProps {
  result: SentimentResult;
  onReset: () => void;
}

export function SentimentResultCard({
  result,
  onReset,
}: SentimentResultCardProps) {
  const isPositive = result.sentiment.toUpperCase() === 'POSITIVE';
  const percentage = result.confidencePercentage ?? Math.round(result.confidence * 100);

  return (
    <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              isPositive
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/80 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/80 text-rose-600 dark:text-rose-400'
            }`}
          >
            {isPositive ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {result.sentiment.toUpperCase()} Polarity
            </h4>
            <p className="text-xs text-zinc-500 font-mono tabular-nums">
              Confidence score: {percentage}%
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1.5 active:scale-[0.97] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Confidence Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono tabular-nums text-zinc-500">
          <span>Model Certainty</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {percentage}%
          </span>
        </div>
        <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-[width] duration-300 ease-out ${
              isPositive ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Analyzed Text Snippet */}
      <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed italic">
        &ldquo;{result.text}&rdquo;
      </div>
    </div>
  );
}
