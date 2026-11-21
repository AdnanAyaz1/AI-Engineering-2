import type { UploadStatus } from '@/types/upload';

interface UploadSelectedFileProps {
  file: File;
  status: UploadStatus;
  onUpload: () => void;
  onReset: () => void;
}

export function UploadSelectedFile({
  file,
  status,
  onUpload,
  onReset,
}: UploadSelectedFileProps) {
  const isUploading = status === 'uploading';
  const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
  const sizeKb = (file.size / 1024).toFixed(1);
  const sizeLabel = file.size > 1024 * 1024 ? `${sizeMb} MB` : `${sizeKb} KB`;

  const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 flex flex-col items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              {ext}
            </span>
            <span className="text-base">📄</span>
          </div>

          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {file.name}
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {sizeLabel} • Ready for ingestion
            </p>
          </div>
        </div>

        {!isUploading && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-zinc-500 hover:text-red-500 transition-colors px-2 py-1 cursor-pointer shrink-0"
          >
            Change
          </button>
        )}
      </div>

      {isUploading && (
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>Extracting text, computing embeddings & storing in pgvector...</span>
          </div>
          <div className="mt-2.5 h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      )}

      {!isUploading && (
        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2.5 rounded-xl text-xs font-medium border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onUpload}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <span>Upload & Ingest</span>
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
}
