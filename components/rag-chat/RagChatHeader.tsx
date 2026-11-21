import { AppHeader } from '@/components/navigation/AppHeader';
import { TOP_K_OPTIONS } from '@/constants/ragChat';

interface RagChatHeaderProps {
  topK: number;
  onTopKChange: (topK: number) => void;
}

export function RagChatHeader({ topK, onTopKChange }: RagChatHeaderProps) {
  return (
    <AppHeader activeBadge="pgvector · Groq">
      <div className="flex items-center gap-1.5 bg-zinc-100/90 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 px-2 py-1 rounded-lg text-xs">
        <span className="text-[11px] text-zinc-500 font-medium">Top-K:</span>
        <select
          aria-label="Number of retrieved chunks (Top-K)"
          value={topK}
          onChange={(e) => onTopKChange(Number(e.target.value))}
          className="bg-transparent font-medium tabular-nums text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer text-xs"
        >
          {TOP_K_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="dark:bg-zinc-900">
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </AppHeader>
  );
}
