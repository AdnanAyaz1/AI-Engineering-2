import { FormattedChunk } from '@/components/FormattedChunk';
import type { SearchResult } from '@/types/semanticSearch';

interface SemanticSearchResultCardProps {
  result: SearchResult;
  index: number;
}

export function SemanticSearchResultCard({
  result,
  index,
}: SemanticSearchResultCardProps) {
  const percentage = Math.round(result.score * 100);

  return (
    <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-3">
      {/* Result Card Header */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono text-zinc-400 font-medium tabular-nums">
          #{String(index + 1).padStart(2, '0')}
        </span>

        {/* Match Percentage Pill */}
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-600 dark:bg-teal-500 rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
            />
          </div>
          <span className="font-mono text-[11px] font-semibold tabular-nums text-teal-700 dark:text-teal-400">
            {percentage}% match
          </span>
        </div>
      </div>

      {/* Chunk Content */}
      <FormattedChunk
        content={result.content}
        metadata={{ source: result.title }}
        similarity={result.score}
        compact
      />
    </div>
  );
}
