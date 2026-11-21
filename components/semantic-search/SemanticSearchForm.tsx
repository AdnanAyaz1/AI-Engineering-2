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
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <label className="block text-sm text-zinc-300 mb-3">
        Your search query
      </label>

      <textarea
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="e.g. I forgot my password and cannot access my account..."
        className="w-full min-h-32 resize-y bg-zinc-950 border border-zinc-800 rounded-lg p-4 outline-none focus:border-blue-500 text-white placeholder:text-zinc-600"
      />

      <div className="flex items-center justify-between mt-4 gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-zinc-400">
            Results:
          </label>

          <select
            value={topK}
            onChange={(e) => onTopKChange(Number(e.target.value))}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white cursor-pointer"
          >
            {SEARCH_TOP_K_OPTIONS.map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={loading || !query.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
    </div>
  );
}
