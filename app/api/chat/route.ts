import {
  streamText,
  generateText,
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
  type UIMessage,
  type ModelMessage,
} from 'ai';
import { groq } from '@ai-sdk/groq';

// ============================================================================
// CONFIGURATION & PRICING
// ============================================================================
const model = groq('openai/gpt-oss-20b');

const INPUT_PRICE_PER_1M = 0.075;  // $0.075 per 1,000,000 input tokens
const OUTPUT_PRICE_PER_1M = 0.30;  // $0.30 per 1,000,000 output tokens

const MAX_MESSAGES = 6;      // Trigger summary when conversation has > 6 messages
const RECENT_TO_KEEP = 3;    // Keep the latest 3 turns raw, summarize the rest

// ============================================================================
// HELPERS: Cost Calculation & Summarization
// ============================================================================

/**
 * Calculates total generation cost in USD.
 */
function calculateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * INPUT_PRICE_PER_1M;
  const outputCost = (outputTokens / 1_000_000) * OUTPUT_PRICE_PER_1M;
  return inputCost + outputCost;
}

/**
 * Summarizes older messages using an LLM pass without pruning raw data.
 */
async function summarizeOlderMessages(messages: ModelMessage[]): Promise<string> {
  const historyText = messages
    .map((m) => {
      const content =
        typeof m.content === 'string'
          ? m.content
          : Array.isArray(m.content)
            ? m.content.map((c: any) => c.text || '').join(' ')
            : JSON.stringify(m.content);
      return `${m.role}: ${content}`;
    })
    .join('\n');

  try {
    const { text } = await generateText({
      model,
      prompt: `Summarize the essential context, user goals, and facts from this conversation history in 2-3 concise bullet points:\n\n${historyText}`,
      temperature: 0.1,
      maxOutputTokens: 250,
    });
    return text.trim();
  } catch (err) {
    console.error('[Summarizer error]:', err);
    return 'Summary unavailable.';
  }
}

// ============================================================================
// MAIN ROUTE HANDLER
// ============================================================================
export async function POST(req: Request) {
  // 1. Take messages from request
  const { messages }: { messages: UIMessage[] } = await req.json();

  // 2. Convert incoming UI messages to AI SDK model messages (no pruning)
  let modelMessages = await convertToModelMessages(messages);

  // 3. Summarize older messages if the chat history has grown past the threshold
  let systemPrompt = 'You are a helpful, clear, and concise AI assistant.';
  if (modelMessages.length > MAX_MESSAGES) {
    const olderSlice = modelMessages.slice(0, -RECENT_TO_KEEP);
    const recentSlice = modelMessages.slice(-RECENT_TO_KEEP);

    const summary = await summarizeOlderMessages(olderSlice);
    systemPrompt += `\n\n[Context Summary of Earlier Conversation]:\n${summary}`;
    modelMessages = recentSlice;
  }

  // 4. Stream response from the LLM
  const result = streamText({
    model,
    system: systemPrompt,
    messages: modelMessages,
    temperature: 0.7,
    maxOutputTokens: 1024,
    abortSignal: req.signal,
  });

  // 5. Calculate cost & send stream with token telemetry to frontend
  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      messageMetadata: ({ part }) => {
        if (part.type === 'finish' && part.totalUsage) {
          const input = part.totalUsage.inputTokens ?? 0;
          const output = part.totalUsage.outputTokens ?? 0;
          const total = part.totalUsage.totalTokens ?? input + output;

          return {
            tokens: { input, output,  total },
            costUsd: calculateCost(input, output),
          };
        }
      },
    }),
  });
}
