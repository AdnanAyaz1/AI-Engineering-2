'use client';

import { useRagChat } from '@/hooks/useRagChat';
import {
  RagChatHeader,
  RagChatEmptyState,
  RagChatMessageItem,
  RagChatInputBar,
  RagChatErrorBanner,
  RagChatLoadingIndicator,
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

      <main className="flex-1 max-w-3xl w-full mx-auto p-4 pb-36 space-y-5">
        <RagChatErrorBanner error={error} onDismiss={dismissError} />

        {messages.length === 0 ? (
          <RagChatEmptyState onSelectPrompt={handleSend} />
        ) : (
          messages.map((message) => (
            <RagChatMessageItem
              key={message.id}
              message={message}
              isExpanded={!!expandedSources[message.id]}
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
