import z from "zod";
import { writerSchema } from "./schemas/writer.schema";
import { reviewerSchema } from "./schemas/reviewer.schema";

export type AgentUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUSD: number;
};

export type TokenUsageState = {
  writer?: AgentUsage;
  review?: AgentUsage;
  [agent: string]: AgentUsage | undefined;
};

export type IterationRecord = {
  iteration: number;
  draft: z.infer<typeof writerSchema>;
  review: z.infer<typeof reviewerSchema>;
};
