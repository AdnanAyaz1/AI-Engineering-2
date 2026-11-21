'use client';

import { useSentimentAnalysis } from '@/hooks/useSentimentAnalysis';
import {
  SentimentHeader,
  SentimentForm,
  SentimentResultCard,
} from '@/components/sentiment';
import { AlertCircle, X } from 'lucide-react';

export default function SentimentPage() {
  const {
    text,
    result,
    loading,
    error,
    setText,
    handleAnalyze,
    handleReset,
    dismissError,
  } = useSentimentAnalysis();

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      <SentimentHeader />

      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 px-4 py-3 rounded-xl flex items-center justify-between text-xs shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={dismissError}
              className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-200 p-1 rounded-md transition-colors cursor-pointer"
              aria-label="Dismiss error"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <SentimentForm
          text={text}
          loading={loading}
          onTextChange={setText}
          onSubmit={handleAnalyze}
        />

        {result && (
          <SentimentResultCard result={result} onReset={handleReset} />
        )}
      </main>
    </div>
  );
}
