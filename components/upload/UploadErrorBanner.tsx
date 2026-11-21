import { AlertCircle, X } from 'lucide-react';

interface UploadErrorBannerProps {
  error: string | null;
  onDismiss: () => void;
}

export function UploadErrorBanner({
  error,
  onDismiss,
}: UploadErrorBannerProps) {
  if (!error) return null;

  return (
    <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 px-4 py-3 rounded-xl mb-4 flex items-center justify-between text-xs shadow-2xs">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
        <span>{error}</span>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-200 p-1 rounded-md transition-colors cursor-pointer"
        aria-label="Dismiss error"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
