import { Search, Loader2 } from 'lucide-react';
import { TOP_K_OPTIONS } from '@/constants/semanticSearch';

interface SemanticSearchFormProps {
  query: string;
  topK: number;
  loading: boolean;
  onQueryChange: (query: string) => void;
  onTopKChange: (topK: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function SemanticSearchForm({
  query,
  topK,
  loading,
  onQueryChange,
  onTopKChange,
  onSubmit,
}: SemanticSearchFormProps) {
  return (
    <form onSubmit={onSubmit} className="mb-8 space-y-3">
      <div className="flex flex-col sm:flex-row gap-2.5">
        {/* Search Input Container */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search documents by conceptual meaning..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:border-zinc-400 dark:focus-within:border-zinc-650 focus:ring-2 focus:ring-teal-500/20 shadow-2xs transition-[border-color,box-shadow] duration-150 ease-out"
          />
        </div>

        {/* Top-K Select */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-xl shrink-0 shadow-2xs">
          <label htmlFor="topK-select" className="text-xs text-zinc-500 font-medium">
            Top-K:
          </label>
          <select
            id="topK-select"
            value={topK}
            onChange={(e) => onTopKChange(Number(e.target.value))}
            className="bg-transparent text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
          >
            {TOP_K_OPTIONS.map((k) => (
              <option key={k} value={k} className="dark:bg-zinc-900">
                {k}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-medium text-xs disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs active:scale-[0.97] transition-[transform,background-color] duration-150 ease-out flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-center justify-between px-1 text-[11px] text-zinc-400 dark:text-zinc-500">
        <span>Queries convert to 384-dim vectors for cosine similarity lookup</span>
        <span className="font-mono tabular-nums">pgvector &lt;=&gt; distance</span>
      </div>
    </form>
  );
}
