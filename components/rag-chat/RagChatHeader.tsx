import Link from 'next/link';
import { BookOpen, UploadCloud, Search, Home } from 'lucide-react';
import { TOP_K_OPTIONS } from '@/constants/ragChat';

interface RagChatHeaderProps {
  topK: number;
  onTopKChange: (topK: number) => void;
}

export function RagChatHeader({ topK, onTopKChange }: RagChatHeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto h-full flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              RAG Document Chat
            </h1>
            <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
              pgvector · Groq
            </span>
          </div>
        </div>

        {/* Controls & Nav */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg">
            <span className="text-[11px] text-slate-500">Top-K:</span>
            <select
              aria-label="Number of retrieved chunks (Top-K)"
              value={topK}
              onChange={(e) => onTopKChange(Number(e.target.value))}
              className="bg-transparent font-medium text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer text-xs"
            >
              {TOP_K_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="dark:bg-slate-900">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <span className="text-slate-200 dark:text-slate-800">|</span>

          <Link
            href="/upload"
            className="px-2 py-1 rounded-lg hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload</span>
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
