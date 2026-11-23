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
      const merged: TokenUsageState = { ...current };

      for (const agent of ["writer", "review"] as const) {
        const usage = update[agent];

        if (!usage) continue;

        const previous = merged[agent] ?? {
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          costUSD: 0,
        };

        merged[agent] = {
          inputTokens: previous.inputTokens + usage.inputTokens,
          outputTokens: previous.outputTokens + usage.outputTokens,
          totalTokens: previous.totalTokens + usage.totalTokens,
          costUSD: previous.costUSD + usage.costUSD,
        };
      }

      return merged;
    },
    default: () => ({}),
  }),

  // Iteration tracking
  iteration: Annotation<number>({
    reducer: (current, update) => current + update,
    default: () => 0,
  }),

  // Best generated content
  bestDraft: Annotation<z.infer<typeof writerSchema> | null>({
    reducer: (_, update) => update,
    default: () => null,
  }),

  bestReview: Annotation<z.infer<typeof reviewerSchema> | null>({
    reducer: (_, update) => update,
    default: () => null,
  }),

  bestScore: Annotation<number>({
    reducer: (_, update) => update,
    default: () => 0,
  }),

  // Workflow decision
  decision: Annotation<"stop" | "improve" | "human_review">({
    reducer: (_, update) => update,
    default: () => "improve",
  }),

  decisionReason: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "",
  }),

  // Human-in-the-loop
  humanAction: Annotation<"approve" | "improve" | null>({
    reducer: (_, update) => update,
    default: () => null,
  }),

  humanFeedback: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "",
  }),

  humanRevisionUsed: Annotation<boolean>({
    reducer: (_, update) => update,
    default: () => false,
  }),

  // Store every draft-review pair
  history: Annotation<IterationRecord[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => [],
  }),
});

export type WorkflowStateType = typeof WorkflowState.State;
