import { FormattedChunk } from '@/components/FormattedChunk';
import type { MessageCost, MessageUsage, RetrievedSource } from '@/types/ragChat';

interface RagChatSourcesProps {
  sources: RetrievedSource[];
  isExpanded: boolean;
  onToggle: () => void;
  cost?: MessageCost;
  usage?: MessageUsage;
}

export function RagChatSources({
  sources,
  isExpanded,
  onToggle,
  cost,
  usage,
}: RagChatSourcesProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 mt-3">
      <div className="flex items-center justify-between text-[11px] text-zinc-500">
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-colors cursor-pointer"
        >
          <span>📖</span>
          <span>Sources ({sources.length})</span>
          <span className="text-[9px]">{isExpanded ? '▲' : '▼'}</span>
        </button>

        <div className="flex items-center gap-2 text-zinc-400">
          {cost && <span>${cost.totalCost.toFixed(5)}</span>}
          {usage && (
            <>
              <span>•</span>
              <span>{usage.totalTokens} tokens</span>
            </>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-2.5">
          {sources.map((chunk, sIdx) => (
            <div
              key={chunk.id || sIdx}
              className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 text-xs"
            >
              <div className="flex items-center justify-between font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                  Source #{sIdx + 1} • Chunk #{chunk.chunkIndex}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px]">
                  {(chunk.similarity * 100).toFixed(1)}% match
                </span>
              </div>
              <FormattedChunk
                content={chunk.content}
                accentColor="emerald"
                maxHeightClass="max-h-52"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
