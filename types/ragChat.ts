export interface RetrievedSource {
  id: string;
  content: string;
  chunkIndex: number;
  documentId: string;
  similarity: number;
}

export type RagSource = RetrievedSource;

export interface MessageUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface MessageCost {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  currency: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: RetrievedSource[];
  usage?: MessageUsage;
  cost?: MessageCost;
  createdAt: string;
}

export interface UseRagChatReturn {
  messages: ChatMessage[];
  input: string;
  topK: number;
  isLoading: boolean;
  error: string | null;
  expandedSources: Record<string, boolean>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  setInput: (value: string) => void;
  setTopK: (value: number) => void;
  toggleSources: (messageId: string) => void;
  handleSend: (queryText?: string) => Promise<void>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  dismissError: () => void;
}
