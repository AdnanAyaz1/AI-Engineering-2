import { AIMessage } from "@langchain/core/messages";
import { pricing } from "../constant/pricing";

export function extractTokenUsage(message: unknown) {
  const usage =
    message instanceof AIMessage ? message.usage_metadata : undefined;

  const inputTokens = usage?.input_tokens ?? 0;
  const outputTokens = usage?.output_tokens ?? 0;

  const inputCost = (inputTokens / 1_000_000) * pricing.input;

  const outputCost = (outputTokens / 1_000_000) * pricing.output;

  return {
    inputTokens,
    outputTokens,
    totalTokens: usage?.total_tokens ?? inputTokens + outputTokens,
    costUSD: inputCost + outputCost,
  };
}
