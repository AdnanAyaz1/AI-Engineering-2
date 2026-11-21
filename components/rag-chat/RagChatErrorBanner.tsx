interface RagChatErrorBannerProps {
  error: string | null;
  onDismiss: () => void;
}

export function RagChatErrorBanner({ error, onDismiss }: RagChatErrorBannerProps) {
  if (!error) return null;

  return (
    <div className="p-3 text-xs rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 flex items-center justify-between">
      <span>⚠️ {error}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="underline hover:opacity-80 ml-2 cursor-pointer font-medium"
      >
        Dismiss
      </button>
    </div>
  );
}
