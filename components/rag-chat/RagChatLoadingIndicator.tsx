export function RagChatLoadingIndicator() {
  return (
    <div className="flex flex-col items-start">
      <div className="text-[11px] font-medium text-zinc-400 mb-1">
        RAG Assistant
      </div>
      <div className="rounded-2xl rounded-bl-none px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2.5 shadow-sm">
        <svg className="animate-spin h-4 w-4 text-emerald-500" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
        <span>Searching vector database & synthesizing answer...</span>
      </div>
    </div>
  );
}
