import { BookOpen, ChevronUp, ChevronDown } from 'lucide-react';
import { FormattedChunk } from '@/components/FormattedChunk';
import type { RagSource } from '@/types/ragChat';

interface RagChatSourcesProps {
  sources: RagSource[];
  isExpanded: boolean;
  onToggle: () => void;
}

export function RagChatSources({
  sources,
  isExpanded,
  onToggle,
}: RagChatSourcesProps) {
  if (sources.length === 0) return null;

  return (
    <div className="pt-2 border-t border-zinc-150 dark:border-zinc-800/80">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors font-medium active:scale-[0.98] cursor-pointer"
      >
        <BookOpen className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
        <span className="tabular-nums">
          {sources.length} {sources.length === 1 ? 'source' : 'sources'} cited
        </span>
        {isExpanded ? (
          <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2">
          {sources.map((src, i) => (
            <FormattedChunk
              key={src.id ?? i}
              content={src.content}
              metadata={{ source: `Document ${src.documentId.slice(0, 8)}... (chunk #${src.chunkIndex})` }}
              similarity={src.similarity}
              compact
            />
          ))}
        </div>
      )}
    </div>
  );
}
