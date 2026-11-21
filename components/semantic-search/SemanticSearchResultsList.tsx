import { Loader2, Search, AlertCircle, X } from 'lucide-react';
import { SemanticSearchResultCard } from './SemanticSearchResultCard';
import type { SearchResult } from '@/types/semanticSearch';

interface SemanticSearchResultsListProps {
  results: SearchResult[];
  loading: boolean;
  searched: boolean;
  error: string | null;
  onDismissError: () => void;
}

export function SemanticSearchResultsList({
  results,
  loading,
  searched,
  error,
  onDismissError,
}: SemanticSearchResultsListProps) {
  if (error) {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 px-4 py-3 rounded-xl mb-6 flex items-center justify-between text-xs shadow-2xs">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
        <button
          type="button"
          onClick={onDismissError}
          className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-200 p-1 rounded-md transition-colors cursor-pointer"
          aria-label="Dismiss error"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-600 dark:text-teal-400" />
        <p className="text-xs text-zinc-500 font-medium">
          Generating embedding & calculating vector distances...
        </p>
      </div>
    );
  }

  if (searched && results.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl">
        <div className="w-10 h-10 mx-auto rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-500 flex items-center justify-center mb-3">
          <Search className="w-5 h-5 text-zinc-400" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          No matching chunks found
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
          Try broadening your query terms or ingest more documents first.
        </p>
      </div>
    );
  }

  if (!searched && results.length === 0) {
    return (
      <div className="text-center py-16 px-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Type a concept above to query indexed vector chunks.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-zinc-500 px-1 font-medium">
        <span className="tabular-nums">
          Found {results.length} relevant {results.length === 1 ? 'chunk' : 'chunks'}
        </span>
        <span className="text-[11px] font-mono text-zinc-400">Ranked by cosine similarity</span>
      </div>

      <div className="space-y-3">
        {results.map((result, idx) => (
          <SemanticSearchResultCard key={result.id} result={result} index={idx} />
        ))}
      </div>
    </div>
  );
}
