import { Loader2 } from 'lucide-react';
import { SemanticSearchResultCard } from './SemanticSearchResultCard';
import type { SearchResult } from '@/types/semanticSearch';

interface SemanticSearchResultsListProps {
  results: SearchResult[];
  loading: boolean;
  searched: boolean;
  error: string;
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
      <div className="mt-4 p-3.5 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 flex items-center justify-between text-xs font-medium">
        <span>{error}</span>
        <button
          type="button"
          onClick={onDismissError}
          className="underline hover:opacity-80 text-xs cursor-pointer ml-2"
        >
          Dismiss
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mt-10 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#0d9488]" />
        <span>Comparing vector embeddings...</span>
      </div>
    );
  }

  if (searched) {
    return (
      <section className="mt-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Matching Documents ({results.length})
          </h2>
          <span className="text-[11px] text-slate-400">
            Sorted by cosine similarity
          </span>
        </div>

        {results.map((result, index) => (
          <SemanticSearchResultCard
            key={result.id}
            result={result}
            index={index}
          />
        ))}

        {results.length === 0 && (
          <div className="p-6 text-center rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            No matching document passages returned. Try broadening your query terms.
          </div>
        )}
      </section>
    );
  }

  return (
    <div className="mt-10 text-center text-slate-400 text-xs">
      Enter a search query above to inspect similarity rankings.
    </div>
  );
}
