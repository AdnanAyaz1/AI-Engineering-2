import React from 'react';

interface ChatEmptyStateProps {
  onSelectPrompt: (promptText: string) => void;
}

const STARTER_PROMPTS = [
  'Explain how neural networks learn in simple terms.',
  'Write a Python script to find duplicate files in a directory.',
  'What are the main architectural trade-offs of microservices?',
];

export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({ onSelectPrompt }) => {
  return (
    <div className="text-center py-16 space-y-4">
      <div className="text-5xl">💬</div>
      <h2 className="text-xl font-semibold">Conversational AI Chatbot</h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
        Features automated rolling conversation summarization when chat history grows, along with real-time token tracking and cost calculation.
      </p>

      <div className="pt-4">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
          Try a prompt:
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {STARTER_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(prompt)}
              className="text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 px-3 py-2 rounded-lg transition-colors text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
