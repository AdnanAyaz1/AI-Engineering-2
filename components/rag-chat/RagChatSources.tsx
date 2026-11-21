import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
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
    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 mt-2.5">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer text-xs"
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span>Sources ({sources.length})</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
          )}
        </button>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
          {cost && <span>${cost.totalCost.toFixed(5)}</span>}
          {usage && (
            <>
              <span>·</span>
              <span>{usage.totalTokens} tokens</span>
            </>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-2.5 space-y-2">
          {sources.map((chunk, sIdx) => (
            <div
              key={chunk.id || sIdx}
              className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
            >
              <div className="flex items-center justify-between font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Chunk #{chunk.chunkIndex}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                  {(chunk.similarity * 100).toFixed(1)}% match
                </span>
              </div>
              <FormattedChunk
                content={chunk.content}
                accentColor="teal"
                maxHeightClass="max-h-48"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
