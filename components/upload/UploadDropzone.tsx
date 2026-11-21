import { UploadCloud } from 'lucide-react';
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
      className={`border-2 border-dashed rounded-2xl p-8 sm:p-14 text-center cursor-pointer select-none transition-[border-color,background-color] duration-150 ease-out ${
        isDragging
          ? 'border-teal-500 bg-teal-500/5 dark:bg-teal-500/10'
          : 'border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-zinc-400 dark:hover:border-zinc-700 shadow-2xs'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_FILE_ACCEPT}
        onChange={onFileChange}
        className="hidden"
      />

      {/* Concentric Icon Box */}
      <div className="w-11 h-11 mx-auto rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-800 dark:text-zinc-200 flex items-center justify-center mb-4 shadow-2xs">
        <UploadCloud className="w-5 h-5 text-teal-600 dark:text-teal-400" />
      </div>

      <h3 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 [text-wrap:balance]">
        Select a document or drag and drop
      </h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed [text-wrap:pretty]">
        PDF, DOCX, or plain text. The engine parses raw text into semantic chunks and writes embeddings directly to PostgreSQL.
      </p>

      {/* Badges */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 mt-5">
        {SUPPORTED_FORMAT_BADGES.map((badge) => (
          <span
            key={badge.ext}
            className="text-[10px] font-mono tabular-nums px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-750"
          >
            {badge.ext}
          </span>
        ))}
        <span className="text-[10px] font-mono tabular-nums px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200/80 dark:border-zinc-750">
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
          className="px-4 py-2 rounded-xl text-xs font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-2xs active:scale-[0.97] transition-[transform,background-color] duration-150 ease-out cursor-pointer"
        >
          Browse files
        </button>
      </div>
    </div>
  );
}
