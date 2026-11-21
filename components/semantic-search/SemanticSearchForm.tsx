import { Search, Loader2 } from 'lucide-react';
import { SEARCH_TOP_K_OPTIONS } from '@/constants/semanticSearch';

interface SemanticSearchFormProps {
  query: string;
  topK: number;
  loading: boolean;
  onQueryChange: (query: string) => void;
  onTopKChange: (topK: number) => void;
  onSubmit: () => void;
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5">
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
        Search Query
      </label>

      <textarea
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="e.g. How do microservice contract tests and pact verification work?"
        className="w-full min-h-24 resize-y bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm transition-colors"
      />

      <div className="flex items-center justify-between mt-3.5 gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium">
            Results limit:
          </label>

          <select
            value={topK}
            onChange={(e) => onTopKChange(Number(e.target.value))}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1 text-xs font-medium text-slate-900 dark:text-slate-100 cursor-pointer focus:outline-none"
          >
            {SEARCH_TOP_K_OPTIONS.map((val) => (
              <option key={val} value={val} className="dark:bg-slate-900">
                {val} results
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={loading || !query.trim()}
          className="bg-[#0d9488] hover:bg-[#0f766e] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
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
    </div>
  );
}
