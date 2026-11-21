import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-24 px-8 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert h-5 w-[100px]"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left mt-8">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            AI Engineering Playground
          </h1>
          <p className="max-w-md text-base text-zinc-600 dark:text-zinc-400">
            Explore conversational AI, RAG document search, and Hugging Face pipelines.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-4">
            <Link
              href="/rag-chat"
              className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 hover:border-emerald-500 transition-all text-left group"
            >
              <div className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                <span>📚 RAG Chat Bot</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                Chat with indexed documents using pgvector retrieval and Markdown answers.
              </p>
            </Link>

            <Link
              href="/chatbot"
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all text-left group"
            >
              <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
                <span>⚡ AI Chat</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                Direct streaming chat with Groq and token telemetry.
              </p>
            </Link>

            <Link
              href="/sementic-search"
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all text-left group"
            >
              <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
                <span>🔍 Semantic Search</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                Embedding-based cosine similarity search across chunks.
              </p>
            </Link>

            <Link
              href="/sentiment"
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all text-left group"
            >
              <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
                <span>🤗 Sentiment Analysis</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                Classify sentiment with Hugging Face Inference API.
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
