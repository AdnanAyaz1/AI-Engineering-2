import Link from 'next/link';
import {
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Search,
  RotateCcw,
} from 'lucide-react';
import type { UploadResult } from '@/types/upload';

interface UploadSuccessCardProps {
  result: UploadResult;
  onUploadAnother: () => void;
}

export function UploadSuccessCard({
  result,
  onUploadAnother,
}: UploadSuccessCardProps) {
  const totalChunks = result.totalChunks ?? 0;
  const originalName = result.fileName || 'Document';

  return (
    <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Document Ingestion Complete
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate max-w-sm sm:max-w-md">
            {originalName} has been parsed, vectorized, and indexed into pgvector.
          </p>
        </div>
      </div>

      {/* Structured KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
          <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-medium">
            Chunks Created
          </span>
          <span className="text-lg font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100 mt-1 block">
            {totalChunks}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
          <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-medium">
            Dimensions
          </span>
          <span className="text-lg font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100 mt-1 block">
            384-dim
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
          <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-medium">
            Target DB
          </span>
          <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1 block">
            pgvector
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
          <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-medium">
            Chunk Size
          </span>
          <span className="text-lg font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100 mt-1 block">
            1000ch
          </span>
        </div>
      </div>

      {/* Action Next Steps */}
      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onUploadAnother}
          className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 active:scale-[0.97] transition-[transform,background-color] duration-150 ease-out flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Ingest Another</span>
        </button>

        <div className="flex items-center gap-2">
          <Link
            href="/sementic-search"
            className="px-3.5 py-2 rounded-xl text-xs font-medium border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 active:scale-[0.97] transition-[transform,background-color] duration-150 ease-out flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Document</span>
          </Link>
          <Link
            href="/rag-chat"
            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-[0.97] transition-[transform,background-color] duration-150 ease-out flex items-center gap-1.5 shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Start RAG Chat</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
