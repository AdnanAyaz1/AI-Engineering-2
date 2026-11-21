import { Loader2 } from 'lucide-react';

export function RagChatLoadingIndicator() {
  return (
    <div className="flex flex-col items-start">
      <div className="text-[11px] font-medium text-slate-400 mb-1">
        Assistant
      </div>
      <div className="rounded-xl rounded-bl-none px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2.5">
        <Loader2 className="w-4 h-4 animate-spin text-[#0d9488]" />
        <span>Retrieving passages & synthesizing answer...</span>
      </div>
    </div>
  );
}
