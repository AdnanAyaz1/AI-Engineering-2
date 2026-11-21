import { Send, Loader2 } from 'lucide-react';

interface RagChatInputBarProps {
  input: string;
  isLoading: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
}

export function RagChatInputBar({
  input,
  isLoading,
  textareaRef,
  onInputChange,
  onKeyDown,
  onSubmit,
}: RagChatInputBarProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 z-20">
      <div className="max-w-4xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="flex items-center gap-2"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type your question... (Enter to send, Shift+Enter for newline)"
            className="flex-1 resize-none px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488] transition-colors"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 rounded-lg bg-[#0d9488] hover:bg-[#0f766e] text-white font-medium text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 mt-2">
          Responses are grounded strictly in your indexed documents via pgvector.
        </p>
      </div>
    </footer>
  );
}
