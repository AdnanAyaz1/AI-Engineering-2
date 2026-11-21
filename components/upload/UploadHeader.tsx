import Link from 'next/link';
import { UploadCloud, BookOpen, Search, Home } from 'lucide-react';

export function UploadHeader() {
  return (
    <header className="sticky top-0 z-30 h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto h-full flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center">
            <UploadCloud className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Document Ingestion
            </h1>
            <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
              Pipeline Active
            </span>
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
          <Link
            href="/rag-chat"
            className="px-2 py-1 rounded-lg hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">RAG Chat</span>
          </Link>
          <Link
            href="/sementic-search"
            className="px-2 py-1 rounded-lg hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search</span>
          </Link>
          <Link
            href="/"
            className="p-1.5 rounded-lg hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Home"
          >
            <Home className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
