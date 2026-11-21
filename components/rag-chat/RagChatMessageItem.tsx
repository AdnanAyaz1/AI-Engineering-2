import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { RagChatSources } from "./RagChatSources";
import type { ChatMessage } from "@/types/ragChat";

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
  const isUser = message.role === "user";
  const hasSources = (message.sources?.length ?? 0) > 0;

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      <div className="text-[11px] font-medium text-zinc-400 mb-1 flex items-center gap-2">
        <span>{isUser ? "You" : "RAG Assistant"}</span>
        <span>•</span>
        <span>{message.createdAt}</span>
      </div>

      <div
        className={`rounded-2xl px-4 py-3.5 max-w-[90%] text-sm leading-relaxed shadow-sm ${
          isUser
            ? "bg-emerald-600 text-white rounded-br-none whitespace-pre-wrap"
            : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-bl-none text-zinc-800 dark:text-zinc-200 w-full"
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
                  <p className="mb-2.5 last:mb-0 leading-relaxed text-zinc-800 dark:text-zinc-200">
                    {children}
                  </p>
                ),
                code: ({ className, children, ...props }: any) => {
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
