import { SAMPLE_PROMPTS } from '@/constants/ragChat';

interface RagChatEmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export function RagChatEmptyState({ onSelectPrompt }: RagChatEmptyStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mb-4 text-2xl">
        📖
      </div>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Ask anything about your documents
      </h2>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-md mx-auto leading-relaxed">
        Queries retrieve the most relevant passages from your pgvector database and synthesize concise, fact-checked markdown answers.
      </p>

      <div className="mt-8 flex flex-col items-center gap-2 max-w-md mx-auto">
        <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
          Try asking
        </span>
        {SAMPLE_PROMPTS.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(sample)}
            className="w-full text-left text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all text-zinc-700 dark:text-zinc-300 cursor-pointer"
          >
            💬 {sample}
          </button>
        ))}
      </div>
    </div>
  );
}
