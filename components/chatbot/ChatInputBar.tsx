import { ArrowUp, Loader2 } from 'lucide-react';

interface ChatInputBarProps {
  input: string;
  isLoading: boolean;
  onInputChange: (val: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function ChatInputBar({
  input,
  isLoading,
  onInputChange,
  onSubmit,
}: ChatInputBarProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md p-3 sm:p-4 z-20">
      <div className="max-w-2xl mx-auto">
        <form
          onSubmit={onSubmit}
          className="relative flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs focus-within:border-zinc-400 dark:focus-within:border-zinc-650 focus-within:ring-2 focus-within:ring-teal-500/20 transition-[border-color,box-shadow] duration-150 ease-out p-1.5"
        >
          <input
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Send a message to Groq gpt-oss-20b..."
            className="flex-1 px-3 py-2 bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm focus:outline-none"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shrink-0 active:scale-95 transition-[transform,background-color,opacity] duration-150 ease-out shadow-xs cursor-pointer ml-1.5"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </form>

        <p className="text-[11px] text-center text-zinc-400 dark:text-zinc-500 mt-2">
          Direct LLM streaming with token usage and estimated cost tracking.
        </p>
      </div>
    </footer>
  );
}
