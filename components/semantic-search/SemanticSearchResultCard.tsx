import { FormattedChunk } from '@/components/FormattedChunk';
import type { SearchResult } from '@/types/semanticSearch';

interface SemanticSearchResultCardProps {
  result: SearchResult;
  index: number;
}

export function SemanticSearchResultCard({ result, index }: SemanticSearchResultCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-4">
      <div className="flex justify-between items-start gap-4 mb-3">
        <div>
          <p className="text-xs text-zinc-500 mb-1">
            RESULT #{index + 1}
          </p>
          <h3 className="font-semibold text-white">
            {result.title}
          </h3>
        </div>

        <div className="text-right shrink-0">
          <p className="text-xl font-bold text-blue-400">
            {(result.score * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-zinc-500">
            Similarity
          </p>
        </div>
      </div>

      <FormattedChunk
        content={result.content}
        accentColor="blue"
        maxHeightClass="max-h-64"
        className="my-3"
      />

      <div className="mt-4 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full"
          style={{
            width: `${Math.max(0, Math.min(100, result.score * 100))}%`,
          }}
        />
      </div>
    </div>
  );
}
