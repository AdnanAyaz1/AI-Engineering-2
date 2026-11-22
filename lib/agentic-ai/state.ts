import { Annotation } from "@langchain/langgraph";
import { z } from "zod";

import { writerSchema } from "./schemas/writer.schema";
import { reviewerSchema } from "./schemas/reviewer.schema";
import { IterationRecord, TokenUsageState } from "./types";

export const WorkflowState = Annotation.Root({
  task: Annotation<string>(),

  draft: Annotation<z.infer<typeof writerSchema>>(),

  review: Annotation<z.infer<typeof reviewerSchema>>(),

  tokenUsage: Annotation<TokenUsageState>({
    reducer: (current, update) => {
      const merged = { ...current };

      for (const [agent, usage] of Object.entries(update)) {
        const previous = merged[agent] ?? {
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          costUSD: 0,
        };

        merged[agent] = {
          inputTokens: previous.inputTokens + (usage?.inputTokens ?? 0),
          outputTokens: previous.outputTokens + (usage?.outputTokens ?? 0),
          totalTokens: previous.totalTokens + (usage?.totalTokens ?? 0),
          costUSD: previous.costUSD + (usage?.costUSD ?? 0),
        };
      }

      return merged;
    },
    default: () => ({}),
  }),

  // Iteration tracking
  iteration: Annotation<number>({
    value: (current, update) => current + update,
    default: () => 0,
  }),

  // Best generated content
  bestDraft: Annotation<z.infer<typeof writerSchema> | null>({
    value: (_, update) => update,
    default: () => null,
  }),

  bestScore: Annotation<number>({
    value: (_, update) => update,
    default: () => 0,
  }),

  // Decider output
  decision: Annotation<"stop" | "improve">({
    value: (_, update) => update,
    default: () => "improve",
  }),

  decisionReason: Annotation<string>({
    value: (_, update) => update,
    default: () => "",
  }),

  // Store every draft-review pair
  history: Annotation<IterationRecord[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => [],
  }),
});

export type WorkflowStateType = typeof WorkflowState.State;
