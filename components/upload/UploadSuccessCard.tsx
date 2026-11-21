import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import type { UploadResult } from '@/types/upload';

interface UploadSuccessCardProps {
  result: UploadResult;
  onUploadAnother: () => void;
}

export function UploadSuccessCard({ result, onUploadAnother }: UploadSuccessCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <CheckCircle2 className="w-5 h-5 text-[#0d9488] shrink-0" />
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Ingestion Complete
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {result.fileName} has been indexed into PostgreSQL.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-5">
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">
            Chunks
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
            {result.totalChunks}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">
            Characters
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
            {result.totalCharacters.toLocaleString()}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">
            Dimensions
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
            {result.embeddingDimensions || 384}d
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">
            Document ID
          </span>
          <span
            className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate block mt-1"
            title={result.documentId}
          >
            {result.documentId.slice(0, 10)}...
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onUploadAnother}
          className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          ← Ingest another file
        </button>

        <div className="flex items-center gap-2">
          <Link
            href="/sementic-search"
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            View in Search
          </Link>
          <Link
            href="/rag-chat"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#0d9488] hover:bg-[#0f766e] text-white transition-colors flex items-center gap-1.5"
          >
            <span>Query Document</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
