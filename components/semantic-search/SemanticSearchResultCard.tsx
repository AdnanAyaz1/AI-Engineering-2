import { FormattedChunk } from '@/components/FormattedChunk';
import type { SearchResult } from '@/types/semanticSearch';

interface SemanticSearchResultCardProps {
  result: SearchResult;
  index: number;
}

export function SemanticSearchResultCard({ result, index }: SemanticSearchResultCardProps) {
  const percentage = (result.score * 100).toFixed(1);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 mb-3">
      <div className="flex justify-between items-start gap-4 mb-2.5">
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-0.5">
            Result #{index + 1}
          </span>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
            {result.title}
          </h3>
        </div>

        <div className="text-right shrink-0">
          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {percentage}% match
          </span>
        </div>
      </div>

      <FormattedChunk
        content={result.content}
        accentColor="teal"
        maxHeightClass="max-h-56"
        className="my-2.5"
      />

      {/* Progress bar */}
      <div className="mt-3 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#0d9488] rounded-full"
          style={{
            width: `${Math.max(0, Math.min(100, result.score * 100))}%`,
          }}
        />
      </div>
    </div>
  );
}
