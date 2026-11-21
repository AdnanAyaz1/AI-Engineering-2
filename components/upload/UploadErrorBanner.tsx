interface UploadErrorBannerProps {
  error: string | null;
  onDismiss: () => void;
}

export function UploadErrorBanner({ error, onDismiss }: UploadErrorBannerProps) {
  if (!error) return null;

  return (
    <div className="p-3.5 text-xs rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-2">
        <span className="text-sm">⚠️</span>
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
