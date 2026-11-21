import Link from 'next/link';
import { Search, BookOpen, Home } from 'lucide-react';

export function SemanticSearchHeader() {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" />
          Embeddings · Experiment 01
        </span>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link
            href="/rag-chat"
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>RAG Chat</span>
          </Link>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <Link
            href="/"
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors flex items-center gap-1"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center">
          <Search className="w-3.5 h-3.5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Semantic Vector Search
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Search document passages based on meaning using pgvector cosine distance.
          </p>
        </div>
      </div>
    </div>
  );
}
