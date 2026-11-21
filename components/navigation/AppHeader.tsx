'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Layers,
  UploadCloud,
  Search,
  BookOpen,
  MessageSquare,
  BarChart3,
} from 'lucide-react';
import type { ReactNode } from 'react';

const NAV_LINKS = [
  { href: '/', label: 'Overview', icon: Layers },
  { href: '/upload', label: 'Ingest', icon: UploadCloud },
  { href: '/sementic-search', label: 'Search', icon: Search },
  { href: '/rag-chat', label: 'RAG Chat', icon: BookOpen },
  { href: '/chatbot', label: 'LLM Chat', icon: MessageSquare },
  { href: '/sentiment', label: 'Sentiment', icon: BarChart3 },
];

interface AppHeaderProps {
  children?: ReactNode;
  activeBadge?: string;
}

export function AppHeader({ children, activeBadge }: AppHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand / Title */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-lg"
          >
            <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center shadow-xs group-hover:scale-105 active:scale-95 transition-[transform,background-color] duration-150 ease-out">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                AI Studio
              </span>
              {activeBadge ? (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800/90 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-750">
                  {activeBadge}
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-700/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Online
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* Center Nav Pills */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-100/80 dark:bg-zinc-900/80 p-1 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-[transform,background-color,color,box-shadow] duration-150 ease-out active:scale-[0.97] ${
                  isActive
                    ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-2xs font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-zinc-400'}`} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action / Mobile Nav */}
        <div className="flex items-center gap-2">
          {children}

          {/* Mobile Quick Nav */}
          <div className="flex md:hidden items-center gap-1">
            <Link
              href="/rag-chat"
              className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="RAG Chat"
            >
              <BookOpen className="w-4 h-4" />
            </Link>
            <Link
              href="/upload"
              className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Upload"
            >
              <UploadCloud className="w-4 h-4" />
            </Link>
            <Link
              href="/sementic-search"
              className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
