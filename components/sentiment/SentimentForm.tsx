import { BarChart3, Loader2 } from 'lucide-react';

interface SentimentFormProps {
  text: string;
  loading: boolean;
  onTextChange: (text: string) => void;
  onSubmit: () => void;
}

export function SentimentForm({
  text,
  loading,
  onTextChange,
  onSubmit,
}: SentimentFormProps) {
  return (
    <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-4">
      <div>
        <label
          htmlFor="sentiment-input"
          className="block text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-1"
        >
          Enter text to analyze
        </label>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Paste customer reviews, support transcripts, or feedback.
        </p>
      </div>

      <div className="relative">
        <textarea
          id="sentiment-input"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Example: The retrieval accuracy is remarkable and response times are blazing fast..."
          rows={5}
          maxLength={5000}
          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650 focus:ring-2 focus:ring-teal-500/20 transition-[border-color,box-shadow] duration-150 ease-out resize-none leading-relaxed"
          disabled={loading}
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <span className="text-[11px] font-mono tabular-nums text-zinc-400 dark:text-zinc-500">
          {text.length} / 5,000 characters
        </span>

        <button
          type="button"
          onClick={onSubmit}
          disabled={loading || !text.trim()}
          className="px-4 py-2 rounded-xl text-xs font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs active:scale-[0.97] transition-[transform,background-color] duration-150 ease-out flex items-center gap-1.5 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analyze Sentiment</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
