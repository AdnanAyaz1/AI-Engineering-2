'use client';

import { useRagChat } from '@/hooks/useRagChat';
import {
  RagChatHeader,
  RagChatEmptyState,
  RagChatMessageItem,
  RagChatLoadingIndicator,
  RagChatErrorBanner,
  RagChatInputBar,
} from '@/components/rag-chat';

export default function RagChatPage() {
  const {
    messages,
    input,
    topK,
    isLoading,
    error,
    expandedSources,
    messagesEndRef,
    textareaRef,
    setInput,
    setTopK,
    toggleSources,
    handleSend,
    handleKeyDown,
    dismissError,
  } = useRagChat();

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      <RagChatHeader topK={topK} onTopKChange={setTopK} />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 pb-36 space-y-5">
        <RagChatErrorBanner error={error} onDismiss={dismissError} />

        {messages.length === 0 ? (
          <RagChatEmptyState onSelectPrompt={(prompt) => handleSend(prompt)} />
        ) : (
          messages.map((msg) => (
            <RagChatMessageItem
              key={msg.id}
              message={msg}
              isExpanded={Boolean(expandedSources[msg.id])}
              onToggleSources={toggleSources}
            />
          ))
        )}

        {isLoading && <RagChatLoadingIndicator />}
        <div ref={messagesEndRef} />
      </main>

      <RagChatInputBar
        input={input}
        isLoading={isLoading}
        textareaRef={textareaRef}
        onInputChange={setInput}
        onKeyDown={handleKeyDown}
        onSubmit={() => handleSend()}
      />
    </div>
  );
}
