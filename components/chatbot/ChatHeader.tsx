import React from 'react';

export const ChatHeader: React.FC = () => {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sticky top-0 z-10 shadow-sm">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <span>⚡</span> Conversational AI Assistant
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Powered by <span className="font-semibold text-zinc-700 dark:text-zinc-300">openai/gpt-oss-20b</span> via Groq
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded font-medium border border-emerald-300 dark:border-emerald-800">
            ✓ Live Streaming
          </span>
          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 rounded font-medium border border-purple-300 dark:border-purple-800">
            ✓ Auto-Summary
          </span>
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded font-medium border border-blue-300 dark:border-blue-800">
            ✓ Cost Telemetry
          </span>
        </div>
      </div>
    </header>
  );
};
