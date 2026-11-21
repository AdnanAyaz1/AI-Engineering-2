import {
  ALLOWED_FILE_ACCEPT,
  MAX_FILE_SIZE_LABEL,
  SUPPORTED_FORMAT_BADGES,
} from '@/constants/upload';

interface UploadDropzoneProps {
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTriggerInput: () => void;
}

export function UploadDropzone({
  isDragging,
  fileInputRef,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileChange,
  onTriggerInput,
}: UploadDropzoneProps) {
  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={onTriggerInput}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onTriggerInput();
        }
      }}
      className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer select-none ${
        isDragging
          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 scale-[1.01]'
          : 'border-zinc-300 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/70'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_FILE_ACCEPT}
        onChange={onFileChange}
        className="hidden"
      />

      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl shadow-xs">
        📁
      </div>

      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        Choose a file or drag & drop it here
      </h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
        Upload a document to extract text, chunk with semantic boundaries, and store embeddings in PostgreSQL.
      </p>

      {/* Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
        {SUPPORTED_FORMAT_BADGES.map((badge) => (
          <span
            key={badge.ext}
            className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${badge.color}`}
          >
            {badge.label}
          </span>
        ))}
        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800">
          Max {MAX_FILE_SIZE_LABEL}
        </span>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTriggerInput();
          }}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity shadow-xs"
        >
          Browse Files
        </button>
      </div>
    </div>
  );
}
