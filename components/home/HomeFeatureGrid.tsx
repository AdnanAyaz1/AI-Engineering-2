import Link from 'next/link';
import {
  BookOpen,
  UploadCloud,
  Search,
  MessageSquare,
  BarChart3,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
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
      className="group relative p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all duration-150 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200/80 dark:border-slate-700">
            <Icon className="w-4 h-4 text-slate-800 dark:text-slate-200" />
          </div>
          {badge && (
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {badge}
            </span>
          )}
        </div>

        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[#0d9488] dark:group-hover:text-teal-400 transition-colors">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-medium text-slate-500 group-hover:text-[#0d9488] dark:group-hover:text-teal-400 transition-colors">
        <span>Open module</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}

export function HomeFeatureGrid() {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <FeatureCard
          title="RAG Document Chat"
          description="Ask questions grounded in indexed knowledge with verifiable chunk citations."
          href="/rag-chat"
          icon={BookOpen}
          badge="pgvector + Groq"
        />

        <FeatureCard
          title="Document Ingestion"
          description="Upload PDF, DOCX, or TXT files to extract text and store vector embeddings."
          href="/upload"
          icon={UploadCloud}
          badge="Embeddings"
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
          description="Conversational chat with Groq gpt-oss-20b with live token and cost telemetry."
          href="/chatbot"
          icon={MessageSquare}
          badge="Groq API"
        />

        <FeatureCard
          title="Sentiment Analysis"
          description="Score text sentiment and confidence with Hugging Face transformer models."
          href="/sentiment"
          icon={BarChart3}
          badge="Transformers"
        />
      </div>
    </section>
  );
}
