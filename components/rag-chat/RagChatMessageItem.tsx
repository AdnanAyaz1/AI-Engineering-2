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
      <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-1 flex items-center gap-1.5 font-medium tabular-nums">
        <span>{isUser ? 'You' : 'Assistant'}</span>
        <span>·</span>
        <span>{message.createdAt}</span>
      </div>

      <div
        className={`rounded-2xl px-4 py-3 max-w-[88%] text-sm leading-relaxed ${
          isUser
            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 rounded-br-sm shadow-2xs whitespace-pre-wrap'
            : 'bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-bl-sm text-zinc-850 dark:text-zinc-200 shadow-2xs w-full'
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
                  <p className="mb-2 last:mb-0 leading-relaxed text-zinc-800 dark:text-zinc-200 [text-wrap:pretty]">
                    {children}
                  </p>
                ),
                code: ({ className, children, ...props }: ComponentPropsWithoutRef<'code'>) => {
                  const isInline =
                    !className && typeof children === 'string' && !children.includes('\n');
                  if (isInline) {
                    return (
                      <code
                        className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-1.5 py-0.5 rounded-md font-mono text-xs border border-zinc-200/70 dark:border-zinc-700/70"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }
                  return (
                    <pre className="bg-zinc-950 text-zinc-100 p-3.5 rounded-xl overflow-x-auto my-2.5 text-xs font-mono border border-zinc-800 shadow-inner">
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
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                h1: ({ children }) => (
                  <h1 className="text-base font-semibold my-2.5 tracking-tight text-zinc-900 dark:text-zinc-100 [text-wrap:balance]">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-sm font-semibold my-2 tracking-tight text-zinc-900 dark:text-zinc-100 [text-wrap:balance]">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xs font-semibold my-1 text-zinc-900 dark:text-zinc-100">
                    {children}
                  </h3>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-teal-500 pl-3 italic my-2 text-zinc-600 dark:text-zinc-400">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-600 dark:text-teal-400 underline underline-offset-2 hover:opacity-80"
                  >
                    {children}
                  </a>
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
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
