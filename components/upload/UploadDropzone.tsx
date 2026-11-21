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
      className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-colors cursor-pointer select-none ${
        isDragging
          ? 'border-[#0d9488] bg-[#0d9488]/5'
          : 'border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-400 dark:hover:border-slate-700'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_FILE_ACCEPT}
        onChange={onFileChange}
        className="hidden"
      />

      <div className="w-10 h-10 mx-auto rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center mb-3">
        <UploadCloud className="w-5 h-5 text-slate-700 dark:text-slate-300" />
      </div>

      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        Choose a file or drag and drop
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
        Upload PDF, DOCX, or TXT documents to extract text and generate vector embeddings.
      </p>

      {/* Badges */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 mt-5">
        {SUPPORTED_FORMAT_BADGES.map((badge) => (
          <span
            key={badge.ext}
            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
          >
            {badge.ext}
          </span>
        ))}
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
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
          className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 transition-opacity"
        >
          Browse file
        </button>
      </div>
    </div>
  );
}
