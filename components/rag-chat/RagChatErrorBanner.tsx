import { AlertCircle } from 'lucide-react';

interface RagChatErrorBannerProps {
  error: string | null;
  onDismiss: () => void;
}

export function RagChatErrorBanner({ error, onDismiss }: RagChatErrorBannerProps) {
  if (!error) return null;

  return (
    <div className="p-3 text-xs rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{error}</span>
      </div>
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
