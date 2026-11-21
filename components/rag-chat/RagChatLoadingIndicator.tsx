import { Loader2 } from 'lucide-react';

export function RagChatLoadingIndicator() {
  return (
    <div className="flex flex-col items-start">
      <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-1 font-medium">
        Assistant
      </div>
      <div className="rounded-2xl rounded-bl-sm px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs flex items-center gap-2.5 text-xs text-zinc-500 dark:text-zinc-400">
        <Loader2 className="w-4 h-4 animate-spin text-teal-600 dark:text-teal-400" />
        <span>Retrieving relevant chunks & generating answer...</span>
      </div>
    </div>
  );
}
