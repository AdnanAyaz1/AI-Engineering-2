import type { ChatMetadata } from '@/types/chatbot';

interface ChatTelemetryBadgeProps {
  metadata?: ChatMetadata;
}

export function ChatTelemetryBadge({ metadata }: ChatTelemetryBadgeProps) {
  if (!metadata || (!metadata.tokens && !metadata.costUsd)) {
    return null;
  }

  const { tokens, costUsd } = metadata;

  return (
    <div className="mt-2.5 pt-2 border-t border-zinc-150 dark:border-zinc-800/80 flex flex-wrap items-center gap-2 text-[11px] font-mono tabular-nums text-zinc-500 dark:text-zinc-400">
      {tokens && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60">
          <span>{tokens.total.toLocaleString()} tokens</span>
          {tokens.reasoning ? (
            <span className="text-zinc-400 dark:text-zinc-500">
              ({tokens.reasoning} reasoning)
            </span>
          ) : null}
        </span>
      )}
      {costUsd !== undefined && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-emerald-600 dark:text-emerald-400 font-semibold">
          ${costUsd.toFixed(6)}
        </span>
      )}
    </div>
  );
}
