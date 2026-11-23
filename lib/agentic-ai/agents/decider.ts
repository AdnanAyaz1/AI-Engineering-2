import { Command, END } from "@langchain/langgraph";
import type { WorkflowStateType } from "../state";

const PASSING_SCORE = 8.5;
const MAX_ITERATIONS = 2;
const TOKEN_LIMIT = 7500;

export function deciderAgent(state: WorkflowStateType) {
  const currentScore = state.review.score;
  const isHumanRevision = state.humanRevisionUsed;

  // A human-requested revision takes precedence over previous automated scores
  const isBetter =
    isHumanRevision ||
    state.bestDraft === null ||
    currentScore > state.bestScore;

  const bestDraft = isBetter ? state.draft : state.bestDraft;
  const bestReview = isBetter ? state.review : state.bestReview;
  const bestScore = isBetter ? currentScore : state.bestScore;

  const totalTokens =
    (state.tokenUsage.writer?.totalTokens ?? 0) +
    (state.tokenUsage.review?.totalTokens ?? 0);

  const iterationIncrement = isHumanRevision ? 0 : 1;
  const completedIterations = state.iteration + iterationIncrement;

  const bestResult = {
    bestDraft,
    bestReview,
    bestScore,
    iteration: iterationIncrement,
  };

  // Passing score achieved.
  if (bestScore >= PASSING_SCORE) {
    return new Command({
      goto: END,
      update: {
        ...bestResult,
        decision: "stop" as const,
        decisionReason: `Passing score achieved: ${bestScore}/10.`,
      },
    });
  }

  // Human-directed revision has been reviewed.
  if (isHumanRevision) {
    return new Command({
      goto: END,
      update: {
        ...bestResult,
        decision: "stop" as const,
        decisionReason: "Human-requested improvement completed and reviewed.",
      },
    });
  }

  // Maximum iterations reached.
  if (completedIterations >= MAX_ITERATIONS) {
    if (totalTokens < TOKEN_LIMIT) {
      return new Command({
        goto: "human_review",
        update: {
          ...bestResult,
          decision: "human_review" as const,
          decisionReason: `Maximum iterations reached. Token usage: ${totalTokens}/7500. Requesting human review.`,
        },
      });
    }

    return new Command({
      goto: END,
      update: {
        ...bestResult,
        decision: "stop" as const,
        decisionReason: `Maximum iterations and token budget reached. Total tokens: ${totalTokens}.`,
      },
    });
  }

  return new Command({
    goto: "writer",
    update: {
      ...bestResult,
      decision: "improve" as const,
      decisionReason: `Score ${currentScore}/10 is below ${PASSING_SCORE}. Another iteration is allowed.`,
    },
  });
}
