import { BookOpen, MessageSquare, ArrowRight } from 'lucide-react';
import { SAMPLE_PROMPTS } from '@/constants/ragChat';

interface RagChatEmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export function RagChatEmptyState({ onSelectPrompt }: RagChatEmptyStateProps) {
  return (
    <div className="text-center py-10 px-4 max-w-xl mx-auto">
      <div className="w-10 h-10 mx-auto rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center mb-3.5">
        <BookOpen className="w-5 h-5" />
      </div>

      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
        Query Knowledge Documents
      </h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
        Ask natural language questions. The pipeline retrieves relevant chunks from pgvector and answers with citations.
      </p>

      {/* Suggested Prompts */}
      <div className="mt-7 flex flex-col items-center gap-2 w-full text-left">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider self-start ml-0.5">
          Sample questions
        </span>
        {SAMPLE_PROMPTS.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(sample)}
            className="w-full text-left text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-slate-700 dark:text-slate-300 flex items-center justify-between group cursor-pointer"
          >
            <span className="flex items-center gap-2.5 truncate">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{sample}</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </button>
        ))}
      </div>
    </div>
  );
}
