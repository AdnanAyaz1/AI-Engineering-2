import { Bot } from 'lucide-react';

export function ChatEmptyState() {
  return (
    <div className="text-center py-20 px-4 max-w-sm mx-auto">
      <div className="w-10 h-10 mx-auto rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-800 dark:text-zinc-200 flex items-center justify-center mb-3.5 shadow-2xs">
        <Bot className="w-5 h-5 text-teal-600 dark:text-teal-400" />
      </div>
      <h3 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        Direct Groq Inference
      </h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed [text-wrap:pretty]">
        Send a prompt to test streaming latency, reasoning generation, and exact token cost tracking.
      </p>
    </div>
  );
}
