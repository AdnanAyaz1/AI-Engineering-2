import { FileText, Loader2, ArrowUpRight } from 'lucide-react';
import { formatFileSize } from '@/constants/upload';
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

  return (
    <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xs">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 truncate max-w-sm sm:max-w-md">
              {file.name}
            </h4>
            <p className="text-xs text-zinc-500 font-mono tabular-nums mt-0.5">
              {formatFileSize(file.size)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          disabled={isUploading}
          className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-40 transition-colors cursor-pointer"
        >
          Remove
        </button>
      </div>

      {isUploading && (
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600 dark:text-teal-400" />
              <span>Parsing text & storing vector embeddings...</span>
            </span>
          </div>
          <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-teal-600 dark:bg-teal-500 rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      )}

      <div className="mt-7 flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
        <button
          type="button"
          onClick={onReset}
          disabled={isUploading}
          className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 disabled:opacity-40 active:scale-[0.97] transition-[transform,background-color] duration-150 ease-out cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onUpload}
          disabled={isUploading}
          className="px-4 py-2 rounded-xl text-xs font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 active:scale-[0.97] transition-[transform,background-color] duration-150 ease-out flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Ingesting...</span>
            </>
          ) : (
            <>
              <span>Start Ingestion</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
