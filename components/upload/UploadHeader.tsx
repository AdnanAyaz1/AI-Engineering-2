import Link from 'next/link';

export function UploadHeader() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur p-4 sticky top-0 z-20 shadow-sm">
      <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">📤</span>
          <div>
            <h1 className="text-base font-semibold leading-none text-zinc-900 dark:text-zinc-100">
              Document Ingestion
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Chunk, embed, and store documents into PostgreSQL (pgvector)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/rag-chat"
            className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
          >
            📚 RAG Chat
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
          <Link
            href="/sementic-search"
            className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
          >
            🔍 Search
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
          <Link
            href="/"
            className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors font-medium"
          >
            🏠 Home
          </Link>
        </div>
      </div>
    </header>
  );
}
