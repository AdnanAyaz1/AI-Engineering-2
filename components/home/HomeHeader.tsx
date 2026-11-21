import Link from 'next/link';
import { Layers, MessageSquare, UploadCloud, Search } from 'lucide-react';

export function HomeHeader() {
  return (
    <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              AI Engineering Studio
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Online
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
          <Link
            href="/rag-chat"
            className="px-2.5 py-1.5 rounded-lg hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>RAG Chat</span>
          </Link>
          <Link
            href="/sementic-search"
            className="px-2.5 py-1.5 rounded-lg hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </Link>
          <Link
            href="/upload"
            className="px-3 py-1.5 rounded-lg bg-[#0d9488] hover:bg-[#0f766e] text-white transition-colors flex items-center gap-1.5 font-medium ml-1"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
