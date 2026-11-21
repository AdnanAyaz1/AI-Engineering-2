import { BookOpen, MessageSquare, ArrowRight } from 'lucide-react';
import { SAMPLE_PROMPTS } from '@/constants/ragChat';

interface RagChatEmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export function RagChatEmptyState({ onSelectPrompt }: RagChatEmptyStateProps) {
  return (
    <div className="text-center py-12 px-4 max-w-xl mx-auto">
      {/* Icon */}
      <div className="w-10 h-10 mx-auto rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-800 dark:text-zinc-200 flex items-center justify-center mb-4 shadow-2xs">
        <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" />
      </div>

      <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 [text-wrap:balance]">
        Query Knowledge Documents
      </h2>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-sm mx-auto leading-relaxed [text-wrap:pretty]">
        Ask questions in plain English. The engine fetches the most relevant context chunks from pgvector and synthesizes an answer with exact source citations.
      </p>

      {/* Suggested Prompts */}
      <div className="mt-8 flex flex-col items-center gap-2 w-full text-left">
        <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider self-start ml-1">
          Sample questions
        </span>
        {SAMPLE_PROMPTS.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(sample)}
            className="w-full text-left text-xs px-3.5 py-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 active:scale-[0.985] transition-[transform,border-color,background-color] duration-150 ease-out text-zinc-700 dark:text-zinc-300 flex items-center justify-between group cursor-pointer"
          >
            <span className="flex items-center gap-2.5 truncate">
              <MessageSquare className="w-3.5 h-3.5 text-zinc-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors shrink-0" />
              <span className="truncate">{sample}</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-[transform,color] duration-150 ease-out shrink-0 ml-2" />
          </button>
        ))}
      </div>
    </div>
  );
}
