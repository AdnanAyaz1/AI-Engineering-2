'use client';

import { useState, type ComponentPropsWithoutRef } from 'react';
import { Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface FormattedChunkProps {
  content: string;
  metadata?: Record<string, unknown> | null;
  similarity?: number;
  compact?: boolean;
  className?: string;
  maxHeightClass?: string;
  showCopy?: boolean;
  accentColor?: 'emerald' | 'blue' | 'teal';
}

export function FormattedChunk({
  content,
  metadata,
  similarity,
  compact = false,
  className = '',
  maxHeightClass = 'max-h-56',
  showCopy = true,
  accentColor = 'teal',
}: FormattedChunkProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy chunk content', err);
    }
  };

  const isBlue = accentColor === 'blue';
  const inlineCodeStyle = isBlue
    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
    : 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20';
  const blockquoteBorder = isBlue ? 'border-blue-500' : 'border-teal-500';
  const linkColor = isBlue
    ? 'text-blue-600 dark:text-blue-400 hover:text-blue-700'
    : 'text-teal-600 dark:text-teal-400 hover:text-teal-700';

  return (
    <div
      className={`relative group bg-zinc-50/90 dark:bg-zinc-900/60 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 ${
        compact ? 'p-3' : 'p-4'
      } shadow-2xs transition-[border-color,background-color] duration-150 ease-out ${className}`}
    >
      {/* Top Header / Metadata Bar */}
      <div className="flex items-center justify-between gap-2 mb-2 pr-12">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono tabular-nums text-zinc-500">
          {similarity !== undefined && (
            <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700/70 font-semibold text-teal-700 dark:text-teal-400">
              {Math.round(similarity * 100)}% match
            </span>
          )}
          {metadata && typeof metadata === 'object' && metadata.source ? (
            <span className="truncate max-w-[200px] text-zinc-400 dark:text-zinc-500">
              {String(metadata.source)}
            </span>
          ) : null}
        </div>
      </div>

      {showCopy && (
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy chunk text"
          className="absolute top-2.5 right-2.5 px-2 py-1 rounded-md bg-white dark:bg-zinc-800 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs hover:bg-zinc-50 dark:hover:bg-zinc-750 active:scale-[0.97] transition-[transform,background-color] duration-150 ease-out flex items-center gap-1 z-10 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-teal-600 dark:text-teal-400" />
              <span className="text-teal-600 dark:text-teal-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-zinc-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      )}

      <div className={`overflow-y-auto pr-1 text-xs leading-relaxed ${maxHeightClass}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => (
              <p className="mb-2 last:mb-0 leading-relaxed text-zinc-700 dark:text-zinc-300 [text-wrap:pretty]">
                {children}
              </p>
            ),
            h1: ({ children }) => (
              <h1 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 my-1.5 first:mt-0">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xs font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 my-1.5 first:mt-0">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 my-1 first:mt-0">
                {children}
              </h3>
            ),
            code: ({ className: codeClassName, children, ...props }: ComponentPropsWithoutRef<'code'>) => {
              const isInline =
                !codeClassName &&
                typeof children === 'string' &&
                !children.includes('\n');

              if (isInline) {
                return (
                  <code
                    className={`px-1.5 py-0.5 rounded-md font-mono text-[11px] font-medium ${inlineCodeStyle}`}
                    {...props}
                  >
                    {children}
                  </code>
                );
              }

              return (
                <pre className="bg-zinc-950 text-zinc-100 p-3 rounded-xl overflow-x-auto my-2 text-[11px] font-mono border border-zinc-800/80 shadow-inner">
                  <code {...props}>{children}</code>
                </pre>
              );
            },
            ul: ({ children }) => (
              <ul className="list-disc list-outside pl-4 space-y-1 my-1.5 text-zinc-700 dark:text-zinc-300">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-outside pl-4 space-y-1 my-1.5 text-zinc-700 dark:text-zinc-300">
                {children}
              </ol>
            ),
            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
            blockquote: ({ children }) => (
              <blockquote
                className={`border-l-2 ${blockquoteBorder} pl-2.5 italic my-1.5 text-zinc-600 dark:text-zinc-400`}
              >
                {children}
              </blockquote>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className={`${linkColor} underline underline-offset-2 font-medium`}
              >
                {children}
              </a>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-[11px]">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-1 text-left font-semibold text-zinc-900 dark:text-zinc-100">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-2.5 py-1 border-t border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                {children}
              </td>
            ),
            hr: () => <hr className="my-2 border-zinc-200 dark:border-zinc-800" />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
