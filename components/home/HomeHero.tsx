export function HomeHero() {
  return (
    <section className="text-center pt-12 pb-10 px-4 max-w-3xl mx-auto">
      <p className="text-xs font-semibold text-[#0d9488] uppercase tracking-wider mb-2">
        Vector Retrieval & Generation Pipeline
      </p>

      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Document Intelligence Studio
      </h1>

      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
        Ingest, chunk, and semantically query knowledge documents with pgvector embeddings and Groq LLM answer synthesis.
      </p>

      {/* Structured Specification Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
        <span className="px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          pgvector · 384-dim
        </span>
        <span className="px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          Groq · OSS 20B
        </span>
        <span className="px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          Recursive Chunking · 1000ch
        </span>
      </div>
    </section>
  );
}
