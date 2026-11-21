'use client';

import { useState, type ComponentPropsWithoutRef } from 'react';
import { Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface FormattedChunkProps {
  content: string;
  className?: string;
  maxHeightClass?: string;
  showCopy?: boolean;
  accentColor?: 'emerald' | 'blue' | 'teal';
}

export function FormattedChunk({
  content,
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
    : 'bg-[#0d9488]/10 text-[#0d9488] dark:text-teal-400 border border-[#0d9488]/20';
  const blockquoteBorder = isBlue ? 'border-blue-500/70' : 'border-[#0d9488]/70';
  const linkColor = isBlue
    ? 'text-blue-600 dark:text-blue-400 hover:text-blue-700'
    : 'text-[#0d9488] dark:text-teal-400 hover:text-[#0f766e]';

  return (
    <div
      className={`relative group bg-slate-50/80 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-3.5 shadow-xs transition-all ${className}`}
    >
      {showCopy && (
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy chunk text"
          className="absolute top-2.5 right-2.5 px-2 py-1 rounded-lg bg-white/90 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 text-[11px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 shadow-xs transition-all flex items-center gap-1 z-10 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-[#0d9488]" />
              <span className="text-[#0d9488]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-slate-400" />
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
              <p className="mb-2 last:mb-0 leading-relaxed text-slate-700 dark:text-slate-300">
                {children}
              </p>
            ),
            h1: ({ children }) => (
              <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 my-1.5 first:mt-0">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 my-1.5 first:mt-0">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 my-1 first:mt-0">
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
                <pre className="bg-slate-950 text-slate-100 p-3 rounded-xl overflow-x-auto my-2 text-[11px] font-mono border border-slate-800/80 shadow-inner">
                  <code {...props}>{children}</code>
                </pre>
              );
            },
            ul: ({ children }) => (
              <ul className="list-disc list-outside pl-4 space-y-1 my-1.5 text-slate-700 dark:text-slate-300">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-outside pl-4 space-y-1 my-1.5 text-slate-700 dark:text-slate-300">
                {children}
              </ol>
            ),
            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
            blockquote: ({ children }) => (
              <blockquote
                className={`border-l-2 ${blockquoteBorder} pl-2.5 italic my-1.5 text-slate-600 dark:text-slate-400`}
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
              <div className="overflow-x-auto my-2 rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-[11px]">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 text-left font-semibold text-slate-900 dark:text-slate-100">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-2.5 py-1 border-t border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                {children}
              </td>
            ),
            hr: () => <hr className="my-2 border-slate-200 dark:border-slate-800" />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
