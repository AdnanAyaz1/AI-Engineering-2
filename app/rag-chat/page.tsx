'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface RetrievedSource {
  id: string;
  content: string;
  chunkIndex: number;
  documentId: string;
  similarity: number;
}

interface MessageUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

interface MessageCost {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  currency: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: RetrievedSource[];
  usage?: MessageUsage;
  cost?: MessageCost;
  createdAt: string;
}

const SAMPLE_PROMPTS = [
  'What are the test levels in a microservice ecosystem?',
  'Explain mutation testing and how Stryker is used.',
  'How do hermetic integration tests with Testcontainers work?',
];

export default function RagChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [topK, setTopK] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const toggleSources = (messageId: string) => {
    setExpandedSources((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const handleSend = async (queryText?: string) => {
    const query = (queryText ?? input).trim();
    if (!query || isLoading) return;

    setError(null);
    setInput('');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/retrieve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query, topK }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to retrieve response');
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        sources: data.sources ?? [],
        usage: data.usage,
        cost: data.cost,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('RAG chat error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur p-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">📚</span>
            <div>
              <h1 className="text-base font-semibold leading-none text-zinc-900 dark:text-zinc-100">
                RAG Document Chat
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Grounded in PostgreSQL (pgvector) & Groq LLM
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* TopK Selector */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
              <span>Top-K:</span>
              <select
                aria-label="Number of retrieved chunks (Top-K)"
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value))}
                className="bg-transparent font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
              >
                <option value={3} className="dark:bg-zinc-800">3 chunks</option>
                <option value={5} className="dark:bg-zinc-800">5 chunks</option>
                <option value={8} className="dark:bg-zinc-800">8 chunks</option>
                <option value={10} className="dark:bg-zinc-800">10 chunks</option>
              </select>
            </div>

            <span className="text-zinc-300 dark:text-zinc-700">|</span>

            <Link
              href="/chatbot"
              className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              ⚡ AI Chat
            </Link>
            <Link
              href="/sementic-search"
              className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
            >
              🔍 Search
            </Link>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 pb-36 space-y-5">
        {error && (
          <div className="p-3 text-xs rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button
              onClick={() => setError(null)}
              className="underline hover:opacity-80 ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mb-4 text-2xl">
              📖
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Ask anything about your documents
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-md mx-auto leading-relaxed">
              Queries retrieve the most relevant passages from your pgvector database and synthesize concise, fact-checked markdown answers.
            </p>

            <div className="mt-8 flex flex-col items-center gap-2 max-w-md mx-auto">
              <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Try asking
              </span>
              {SAMPLE_PROMPTS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(sample)}
                  className="w-full text-left text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all text-zinc-700 dark:text-zinc-300"
                >
                  💬 {sample}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isUser = message.role === 'user';
            const isExpanded = !!expandedSources[message.id];
            const hasSources = (message.sources?.length ?? 0) > 0;

            return (
              <div
                key={message.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className="text-[11px] font-medium text-zinc-400 mb-1 flex items-center gap-2">
                  <span>{isUser ? 'You' : 'RAG Assistant'}</span>
                  <span>•</span>
                  <span>{message.createdAt}</span>
                </div>

                <div
                  className={`rounded-2xl px-4 py-3.5 max-w-[90%] text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-br-none whitespace-pre-wrap'
                      : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-bl-none text-zinc-800 dark:text-zinc-200 w-full'
                  }`}
                >
                  {isUser ? (
                    message.content
                  ) : (
                    <div className="space-y-3">
                      {/* Markdown Body */}
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => (
                            <p className="mb-2.5 last:mb-0 leading-relaxed text-zinc-800 dark:text-zinc-200">{children}</p>
                          ),
                          code: ({ className, children, ...props }: any) => {
                            const isInline = !className && typeof children === 'string' && !children.includes('\n');
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
                        {message.content}
                      </ReactMarkdown>

                      {/* Sources Accordion & Telemetry */}
                      {hasSources && (
                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 mt-3">
                          <div className="flex items-center justify-between text-[11px] text-zinc-500">
                            <button
                              onClick={() => toggleSources(message.id)}
                              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-colors"
                            >
                              <span>📖</span>
                              <span>Sources ({message.sources?.length})</span>
                              <span className="text-[9px]">{isExpanded ? '▲' : '▼'}</span>
                            </button>

                            <div className="flex items-center gap-2 text-zinc-400">
                              {message.cost && (
                                <span>${message.cost.totalCost.toFixed(5)}</span>
                              )}
                              {message.usage && (
                                <>
                                  <span>•</span>
                                  <span>{message.usage.totalTokens} tokens</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Expanded Sources Details */}
                          {isExpanded && (
                            <div className="mt-3 space-y-2.5">
                              {message.sources?.map((chunk, sIdx) => (
                                <div
                                  key={chunk.id || sIdx}
                                  className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 text-xs"
                                >
                                  <div className="flex items-center justify-between font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                                      Source #{sIdx + 1} • Chunk #{chunk.chunkIndex}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px]">
                                      {(chunk.similarity * 100).toFixed(1)}% match
                                    </span>
                                  </div>
                                  <p className="text-zinc-700 dark:text-zinc-300 text-[12px] whitespace-pre-wrap leading-relaxed font-mono bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 max-h-48 overflow-y-auto">
                                    {chunk.content}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex flex-col items-start">
            <div className="text-[11px] font-medium text-zinc-400 mb-1">
              RAG Assistant
            </div>
            <div className="rounded-2xl rounded-bl-none px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2.5 shadow-sm">
              <svg className="animate-spin h-4 w-4 text-emerald-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Searching vector database & synthesizing answer...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Sticky Bottom Input Bar */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur p-4 z-20 shadow-md">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your documents... (Enter to send, Shift+Enter for newline)"
              className="flex-1 resize-none px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-1.5"
            >
              {isLoading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <span>Send</span>
              )}
            </button>
          </form>

          <p className="text-[11px] text-center text-zinc-400 dark:text-zinc-500 mt-2">
            Answers are grounded strictly in your indexed documents using pgvector and Groq.
          </p>
        </div>
      </footer>
    </div>
  );
}
