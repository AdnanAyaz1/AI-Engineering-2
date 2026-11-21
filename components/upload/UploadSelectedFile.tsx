import { FileText, Loader2 } from 'lucide-react';
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <span className="text-[9px] font-mono font-semibold text-slate-500 uppercase">
              {ext}
            </span>
          </div>

          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {file.name}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {sizeLabel} · Ready for ingestion
            </p>
          </div>
        </div>

        {!isUploading && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-slate-500 hover:text-rose-500 transition-colors px-2 py-1 cursor-pointer shrink-0 font-medium"
          >
            Change
          </button>
        )}
      </div>

      {isUploading && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-[#0d9488] dark:text-teal-400 font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Chunking text, computing embeddings & indexing into pgvector...</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-[#0d9488] rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      )}

      {!isUploading && (
        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onReset}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onUpload}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#0d9488] hover:bg-[#0f766e] text-white transition-colors cursor-pointer"
          >
            Upload & Ingest
          </button>
        </div>
      )}
    </div>
  );
}
