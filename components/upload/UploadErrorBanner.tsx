import { AlertCircle } from 'lucide-react';

interface UploadErrorBannerProps {
  error: string | null;
  onDismiss: () => void;
}

export function UploadErrorBanner({ error, onDismiss }: UploadErrorBannerProps) {
  if (!error) return null;

  return (
    <div className="p-3 text-xs rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span className="font-medium">{error}</span>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="underline hover:opacity-80 ml-2 font-medium cursor-pointer"
      >
        Dismiss
      </button>
    </div>
  );
}
