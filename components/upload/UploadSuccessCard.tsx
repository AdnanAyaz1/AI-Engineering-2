import Link from 'next/link';
import type { UploadResult } from '@/types/upload';

interface UploadSuccessCardProps {
  result: UploadResult;
  onUploadAnother: () => void;
}

export function UploadSuccessCard({ result, onUploadAnother }: UploadSuccessCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-emerald-500/30 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
          ✓
        </div>
        <div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Document Ingestion Complete
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {result.fileName} has been embedded and stored in PostgreSQL.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800">
          <span className="text-[11px] text-zinc-400 block font-medium">Chunks</span>
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {result.totalChunks}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800">
          <span className="text-[11px] text-zinc-400 block font-medium">Characters</span>
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {result.totalCharacters.toLocaleString()}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800">
          <span className="text-[11px] text-zinc-400 block font-medium">Embedding Dim</span>
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {result.embeddingDimensions || 384}d
          </span>
        </div>

        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800">
          <span className="text-[11px] text-zinc-400 block font-medium">Document ID</span>
          <span className="text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400 truncate block mt-1" title={result.documentId}>
            {result.documentId.slice(0, 10)}...
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onUploadAnother}
          className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
        >
          ← Upload another document
        </button>

        <div className="flex items-center gap-2">
          <Link
            href="/sementic-search"
            className="px-3.5 py-2 rounded-xl text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            🔍 Test in Search
          </Link>
          <Link
            href="/rag-chat"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>📚 Chat with Document</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
