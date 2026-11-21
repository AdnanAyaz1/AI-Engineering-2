"use client";

import { useState, type ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface FormattedChunkProps {
  content: string;
  className?: string;
  maxHeightClass?: string;
  showCopy?: boolean;
  accentColor?: "emerald" | "blue";
}

export function FormattedChunk({
  content,
  className = "",
  maxHeightClass = "max-h-56",
  showCopy = true,
}: FormattedChunkProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy chunk content", err);
    }
  };

  

  return (
    <div
      className={`relative group bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200/70 dark:border-zinc-800/80 p-3 shadow-xs ${className}`}
    >
      {showCopy && (
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy chunk text"
          className="absolute top-2 right-2 px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[10px] font-medium text-zinc-600 dark:text-zinc-300 transition-colors flex items-center gap-1 z-10 opacity-70 group-hover:opacity-100"
        >
          {copied ? (
            <>
              <span className="text-emerald-500">✓</span>
              <span>Copied</span>
            </>
          ) : (
            <>
              <span>📋</span>
              <span>Copy</span>
            </>
          )}
        </button>
      )}

      <div
        className={`overflow-y-auto pr-1 text-xs leading-relaxed ${maxHeightClass}`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => (
              <p className="mb-2.5 last:mb-0 leading-relaxed text-zinc-800 dark:text-zinc-200">
                {children}
              </p>
            ),
            code: ({ className, children, ...props }: ComponentPropsWithoutRef<'code'>) => {
              const isInline =
                !className &&
                typeof children === "string" &&
                !children.includes("\n");
              if (isInline) {
                return (
                  <code
                    className="bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded text-xs font-mono font-medium"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
              return (
                <pre className="bg-zinc-950 text-zinc-100 p-3.5 rounded-xl overflow-x-auto my-3 text-xs font-mono border border-zinc-800">
                  <code {...props}>{children}</code>
                </pre>
              );
            },
            ul: ({ children }) => (
              <ul className="list-disc list-outside pl-4 space-y-1 my-2 text-zinc-800 dark:text-zinc-200">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-outside pl-4 space-y-1 my-2 text-zinc-800 dark:text-zinc-200">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed">{children}</li>
            ),
            h1: ({ children }) => (
              <h1 className="text-base font-bold my-2 text-zinc-900 dark:text-zinc-100">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-sm font-bold my-2 text-zinc-900 dark:text-zinc-100">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-sm font-semibold my-1 text-zinc-900 dark:text-zinc-100">
                {children}
              </h3>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-emerald-500 pl-3 italic my-2 text-zinc-600 dark:text-zinc-400">
                {children}
              </blockquote>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-600 dark:text-emerald-400 underline hover:opacity-80 font-medium"
              >
                {children}
              </a>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-3">
                <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-left font-semibold text-zinc-900 dark:text-zinc-100">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-3 py-1.5 border-t border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                {children}
              </td>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
