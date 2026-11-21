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
      <div className="mt-6 p-4 rounded-lg border border-red-800 bg-red-950/30 text-red-400 flex items-center justify-between text-sm">
        <span>⚠️ {error}</span>
        <button
          type="button"
          onClick={onDismissError}
          className="underline hover:opacity-80 text-xs cursor-pointer"
        >
          Dismiss
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mt-10 text-center text-zinc-400 text-sm">
        Generating query embedding and comparing documents...
      </div>
    );
  }

  if (searched) {
    return (
      <section className="mt-10">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold">
            Search Results
          </h2>
          <span className="text-sm text-zinc-500">
            {results.length} documents found
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
          <p className="text-zinc-500 text-sm">
            No documents returned.
          </p>
        )}
      </section>
    );
  }

  return (
    <div className="mt-10 text-center text-zinc-600 text-sm">
      Your search results will appear here.
    </div>
  );
}
