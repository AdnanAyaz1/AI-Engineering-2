import type { ComponentPropsWithoutRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { RagChatSources } from './RagChatSources';
import type { ChatMessage } from '@/types/ragChat';

interface RagChatMessageItemProps {
  message: ChatMessage;
  isExpanded: boolean;
  onToggleSources: (messageId: string) => void;
}

export function RagChatMessageItem({
  message,
  isExpanded,
  onToggleSources,
}: RagChatMessageItemProps) {
  const isUser = message.role === 'user';
  const hasSources = (message.sources?.length ?? 0) > 0;

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1.5 font-medium">
        <span>{isUser ? 'You' : 'Assistant'}</span>
        <span>·</span>
        <span>{message.createdAt}</span>
      </div>

      <div
        className={`rounded-xl px-4 py-3 max-w-[88%] text-sm leading-relaxed ${
          isUser
            ? 'bg-[#0d9488] text-white rounded-br-none whitespace-pre-wrap'
            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-bl-none text-slate-800 dark:text-slate-200 w-full'
        }`}
      >
        {isUser ? (
          message.content
        ) : (
          <div className="space-y-3">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0 leading-relaxed text-slate-800 dark:text-slate-200">
                    {children}
                  </p>
                ),
                code: ({ className, children, ...props }: ComponentPropsWithoutRef<'code'>) => {
                  const isInline =
                    !className && typeof children === 'string' && !children.includes('\n');
                  if (isInline) {
                    return (
                      <code
                        className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-1.5 py-0.5 rounded font-mono text-xs border border-slate-200 dark:border-slate-700"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }
                  return (
                    <pre className="bg-slate-950 text-slate-100 p-3 rounded-lg overflow-x-auto my-2 text-xs font-mono border border-slate-800">
                      <code {...props}>{children}</code>
                    </pre>
                  );
                },
                ul: ({ children }) => (
                  <ul className="list-disc list-outside pl-4 space-y-1 my-2 text-slate-800 dark:text-slate-200">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-outside pl-4 space-y-1 my-2 text-slate-800 dark:text-slate-200">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                h1: ({ children }) => (
                  <h1 className="text-base font-bold my-2 text-slate-900 dark:text-slate-100">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-sm font-semibold my-2 text-slate-900 dark:text-slate-100">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xs font-semibold my-1 text-slate-900 dark:text-slate-100">
                    {children}
                  </h3>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-[#0d9488] pl-3 italic my-2 text-slate-600 dark:text-slate-400">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0d9488] dark:text-teal-400 underline underline-offset-2 hover:opacity-80"
                  >
                    {children}
                  </a>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-2 rounded-lg border border-slate-200 dark:border-slate-800">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-left font-semibold text-slate-900 dark:text-slate-100">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-3 py-1.5 border-t border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    {children}
                  </td>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>

            {hasSources && (
              <RagChatSources
                sources={message.sources!}
                isExpanded={isExpanded}
                onToggle={() => onToggleSources(message.id)}
                cost={message.cost}
                usage={message.usage}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
