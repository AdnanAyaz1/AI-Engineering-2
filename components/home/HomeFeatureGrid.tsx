import Link from 'next/link';
import {
  BookOpen,
  UploadCloud,
  Search,
  MessageSquare,
  BarChart3,
  ArrowUpRight,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  accent?: string;
}

function FeatureCard({
  title,
  description,
  href,
  icon: Icon,
  badge,
}: FeatureCardProps) {
  return (
    <Link
      href={href}
      className="group relative p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-[0_6px_20px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)] active:scale-[0.985] transition-[transform,border-color,box-shadow,background-color] duration-150 ease-out flex flex-col justify-between"
    >
      <div>
        {/* Header row: Icon & Badge */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center border border-zinc-200/70 dark:border-zinc-700/70 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900 transition-[background-color,color] duration-150 ease-out">
            <Icon className="w-4 h-4" />
          </div>
          {badge && (
            <span className="text-[10px] font-mono tabular-nums text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-750">
              {badge}
            </span>
          )}
        </div>

        {/* Content */}
        <h3 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 [text-wrap:balance]">
          {title}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed [text-wrap:pretty]">
          {description}
        </p>
      </div>

      {/* Footer link */}
      <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-medium text-zinc-500 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
        <span>Launch module</span>
        <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-150 ease-out" />
      </div>
    </Link>
  );
}

export function HomeFeatureGrid() {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <FeatureCard
          title="Agentic Copywriting"
          description="Autonomous LangGraph writer and reviewer loop with human-in-the-loop review checkpoints."
          href="/agentic-writer"
          icon={Sparkles}
          badge="LangGraph + HITL"
        />

        <FeatureCard
          title="RAG Document Chat"
          description="Ask questions grounded strictly in indexed knowledge with verifiable chunk citations."
          href="/rag-chat"
          icon={BookOpen}
          badge="pgvector + Groq"
        />

        <FeatureCard
          title="Document Ingestion"
          description="Upload PDF, DOCX, or TXT files to extract structured text and store vector embeddings."
          href="/upload"
          icon={UploadCloud}
          badge="384-dim"
        />

        <FeatureCard
          title="Semantic Search"
          description="Search documents using natural language meaning and cosine similarity ranking."
          href="/sementic-search"
          icon={Search}
          badge="Cosine Distance"
        />

        <FeatureCard
          title="Direct LLM Chat"
          description="Stream conversations with Groq openai/gpt-oss-20b with real-time token cost telemetry."
          href="/chatbot"
          icon={MessageSquare}
          badge="Groq Stream"
        />

        <FeatureCard
          title="Sentiment Analysis"
          description="Classify text sentiment polarity and model confidence scores using transformer models."
          href="/sentiment"
          icon={BarChart3}
          badge="Transformers"
        />
      </div>
    </section>
  );
}
