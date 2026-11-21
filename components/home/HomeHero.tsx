import { Sparkles, Terminal } from 'lucide-react';

export function HomeHero() {
  return (
    <section className="text-center pt-14 pb-12 px-4 max-w-3xl mx-auto">
      {/* Category Pill */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100/90 dark:bg-zinc-850/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 mb-5 shadow-2xs">
        <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
        <span className="tracking-tight">Vector Retrieval & LLM Synthesis Engine</span>
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 [text-wrap:balance] leading-[1.15]">
        Document Intelligence Studio
      </h1>

      {/* Subtitle */}
      <p className="mt-4 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto [text-wrap:pretty] leading-relaxed">
        Ingest documents, generate high-density 384-dimensional embeddings, and execute grounded RAG queries with sub-second Groq inference.
      </p>

      {/* Technical Specification Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-mono tabular-nums text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
          <Terminal className="w-3 h-3 text-zinc-400" />
          <span>pgvector · 384-dim</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-mono tabular-nums text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
          <span>Groq · gpt-oss-20b</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-mono tabular-nums text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
          <span>Chunking · 1000ch / 200ov</span>
        </span>
      </div>
    </section>
  );
}
