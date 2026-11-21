'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMetadata {
  tokens?: {
    input: number;
    output: number;
    reasoning?: number;
    total: number;
  };
  costUsd?: number;
}

export default function ChatPage() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status, error } = useChat();

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-base font-semibold flex items-center gap-2">
            <span>⚡</span> AI Chat Assistant
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500">
              Groq • openai/gpt-oss-20b
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <Link
              href="/sentiment"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              🤗 Sentiment Analysis →
            </Link>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 pb-36 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 text-sm">
            Start a conversation to see Markdown formatting, code highlighting, and cost telemetry.
          </div>
        ) : (
          messages.map((message) => {
            const isUser = message.role === 'user';
            const metadata = message.metadata as ChatMetadata | undefined;

            return (
              <div
                key={message.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className="text-[11px] font-medium text-zinc-400 mb-1">
                  {isUser ? 'You' : 'Assistant'}
                </div>

                <div
                  className={`rounded-2xl px-4 py-3 max-w-[85%] text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-br-none whitespace-pre-wrap'
                      : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-bl-none text-zinc-800 dark:text-zinc-200'
                  }`}
                >
                  {isUser ? (
                    message.parts.map((part, i) =>
                      part.type === 'text' ? <span key={i}>{part.text}</span> : null
                    )
                  ) : (
                    <div className="space-y-2">
                      {message.parts.map((part, i) => {
                        if (part.type === 'text') {
                          return (
                            <ReactMarkdown
                              key={i}
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ children }) => (
                                  <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                                ),
                                code: ({ node, className, children, ...props }: any) => {
                                  // Determine if inline or code block
                                  const isInline = !className && typeof children === 'string' && !children.includes('\n');
                                  if (isInline) {
                                    return (
                                      <code
                                        className="bg-zinc-100 dark:bg-zinc-800 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded text-xs font-mono font-medium"
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
                                  <ul className="list-disc list-outside pl-4 space-y-1 my-2">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="list-decimal list-outside pl-4 space-y-1 my-2">
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
                                  <blockquote className="border-l-2 border-zinc-300 dark:border-zinc-700 pl-3 italic my-2 text-zinc-600 dark:text-zinc-400">
                                    {children}
                                  </blockquote>
                                ),
                                a: ({ href, children }) => (
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 dark:text-blue-400 underline hover:opacity-80 font-medium"
                                  >
                                    {children}
                                  </a>
                                ),
                                table: ({ children }) => (
                                  <div className="overflow-x-auto my-2">
                                    <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs">
                                      {children}
                                    </table>
                                  </div>
                                ),
                                th: ({ children }) => (
                                  <th className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-left font-semibold">
                                    {children}
                                  </th>
                                ),
                                td: ({ children }) => (
                                  <td className="px-3 py-1.5 border-t border-zinc-200 dark:border-zinc-800">
                                    {children}
                                  </td>
                                ),
                              }}
                            >
                              {part.text}
                            </ReactMarkdown>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}
                </div>

                {/* Token Telemetry & Cost Badge */}
                {!isUser && metadata?.tokens && (
                  <div className="mt-1.5 text-[11px] text-zinc-500 flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-800">
                    <span>
                      Tokens: <strong>{metadata.tokens.input}</strong> in / <strong>{metadata.tokens.output}</strong> out
                    </span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      ${metadata.costUsd?.toFixed(6)} USD
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="text-xs text-zinc-400 animate-pulse">
            Thinking...
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-lg text-xs">
            {error.message || 'Error occurred.'}
          </div>
        )}
      </main>

      {/* Input */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur border-t border-zinc-200 dark:border-zinc-800 p-4">
        <form className="max-w-2xl mx-auto flex gap-2" onSubmit={handleSubmit}>
          <input
            className="flex-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={input}
            disabled={isLoading}
            placeholder="Type a message..."
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-5 py-2 rounded-xl text-sm transition-colors"
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}
