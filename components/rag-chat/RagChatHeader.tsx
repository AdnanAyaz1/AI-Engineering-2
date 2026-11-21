import Link from 'next/link';
import { TOP_K_OPTIONS } from '@/constants/ragChat';

interface RagChatHeaderProps {
  topK: number;
  onTopKChange: (topK: number) => void;
}

export function RagChatHeader({ topK, onTopKChange }: RagChatHeaderProps) {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur p-4 sticky top-0 z-20 shadow-sm">
      <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">📚</span>
          <div>
            <h1 className="text-base font-semibold leading-none text-zinc-900 dark:text-zinc-100">
              RAG Document Chat
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Grounded in PostgreSQL (pgvector) & Groq LLM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
            <span>Top-K:</span>
            <select
              aria-label="Number of retrieved chunks (Top-K)"
              value={topK}
              onChange={(e) => onTopKChange(Number(e.target.value))}
              className="bg-transparent font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
            >
              {TOP_K_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="dark:bg-zinc-800">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <span className="text-zinc-300 dark:text-zinc-700">|</span>

          <Link
            href="/upload"
            className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
          >
            📤 Ingest
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
          <Link
            href="/chatbot"
            className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
          >
            ⚡ AI Chat
          </Link>
          <Link
            href="/sementic-search"
            className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
          >
            🔍 Search
          </Link>
        </div>
      </div>
    </header>
  );
}
