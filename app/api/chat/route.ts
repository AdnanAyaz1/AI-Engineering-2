import {
  streamText,
  generateText,
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
  type UIMessage,
  type ModelMessage,
} from "ai";
import { groq } from "@ai-sdk/groq";

const model = groq("openai/gpt-oss-20b");

const INPUT_PRICE_PER_1M = 0.075;
const OUTPUT_PRICE_PER_1M = 0.3;

const MAX_MESSAGES = 6;
const RECENT_TO_KEEP = 3;

function calculateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * INPUT_PRICE_PER_1M;
  const outputCost = (outputTokens / 1_000_000) * OUTPUT_PRICE_PER_1M;

  return inputCost + outputCost;
}

async function summarizeOlderMessages(
  messages: ModelMessage[],
): Promise<string> {
  const historyText = messages
    .map((m) => {
      const content =
        typeof m.content === "string"
          ? m.content
          : Array.isArray(m.content)
            ? m.content
                .map((c: unknown) => {
                  if (typeof c === "string") return c;

                  if (c && typeof c === "object" && "text" in c) {
                    return String((c as { text?: unknown }).text ?? "");
                  }

                  return "";
                })
                .join(" ")
            : JSON.stringify(m.content);

      return `${m.role}: ${content}`;
    })
    .join("\n");

  try {
    const { text } = await generateText({
      model,
      prompt: `Summarize the essential context, user goals, and facts from this conversation history in 2-3 concise bullet points:\n\n${historyText}`,
      temperature: 0.1,
      maxOutputTokens: 250,
    });

    return text.trim();
  } catch (err) {
    console.error("[Summarizer error]:", err);
    return "Summary unavailable.";
  }
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  let modelMessages = await convertToModelMessages(messages);

  let systemPrompt = "You are a helpful, clear, and concise AI assistant.";

  if (modelMessages.length > MAX_MESSAGES) {
    const olderSlice = modelMessages.slice(0, -RECENT_TO_KEEP);
    const recentSlice = modelMessages.slice(-RECENT_TO_KEEP);

    const summary = await summarizeOlderMessages(olderSlice);

    systemPrompt += `\n\n[Context Summary of Earlier Conversation]:\n${summary}`;

    // Discard older messages after summarizing.
    modelMessages = recentSlice;
  }

  const result = streamText({
    model,
    system: systemPrompt,
    messages: modelMessages,
    temperature: 0.7,
    maxOutputTokens: 1024,
    abortSignal: req.signal,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      messageMetadata: ({ part }) => {
        if (part.type === "finish" && part.totalUsage) {
          const input = part.totalUsage.inputTokens ?? 0;
          const output = part.totalUsage.outputTokens ?? 0;
          const total = part.totalUsage.totalTokens ?? input + output;

          return {
            tokens: { input, output, total },
            costUsd: calculateCost(input, output),
          };
        }
      },
    }),
  });
}
