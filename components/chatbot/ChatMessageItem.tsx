import type { ComponentPropsWithoutRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatTelemetryBadge } from './ChatTelemetryBadge';
import type { ChatMetadata } from '@/types/chatbot';
import type { UIMessage } from 'ai';

interface ChatMessageItemProps {
  message: UIMessage;
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const isUser = message.role === 'user';
  const metadata = message.metadata as ChatMetadata | undefined;

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 mb-1">
        {isUser ? 'You' : 'Assistant'}
      </div>

      <div
        className={`rounded-2xl px-4 py-3 max-w-[85%] text-sm leading-relaxed ${
          isUser
            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 rounded-br-sm shadow-2xs whitespace-pre-wrap'
            : 'bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-bl-sm text-zinc-850 dark:text-zinc-200 shadow-2xs w-full'
        }`}
      >
        {isUser ? (
          message.parts.map((part, i) =>
            part.type === 'text' ? <span key={i}>{part.text}</span> : null
          )
        ) : (
          <div className="space-y-3">
            {message.parts.map((part, i) => {
              if (part.type !== 'text') return null;
              return (
                <ReactMarkdown
                  key={i}
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => (
                      <p className="mb-2 last:mb-0 leading-relaxed text-zinc-800 dark:text-zinc-200 [text-wrap:pretty]">
                        {children}
                      </p>
                    ),
                    code: ({
                      className,
                      children,
                      ...props
                    }: ComponentPropsWithoutRef<'code'>) => {
                      const isInline =
                        !className &&
                        typeof children === 'string' &&
                        !children.includes('\n');
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
                        <pre className="bg-zinc-950 text-zinc-100 p-3.5 rounded-xl overflow-x-auto my-2 text-xs font-mono border border-zinc-800 shadow-inner">
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
                      <h1 className="text-base font-semibold my-2.5 text-zinc-900 dark:text-zinc-100 tracking-tight [text-wrap:balance]">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-sm font-semibold my-2 text-zinc-900 dark:text-zinc-100 tracking-tight [text-wrap:balance]">
                        {children}
                      </h2>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-teal-500 pl-3 italic my-2 text-zinc-600 dark:text-zinc-400">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {part.text}
                </ReactMarkdown>
              );
            })}

            <ChatTelemetryBadge metadata={metadata} />
          </div>
        )}
      </div>
    </div>
  );
}
