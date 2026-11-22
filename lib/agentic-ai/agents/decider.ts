import type { WorkflowStateType } from "../state";

const PASSING_SCORE = 8.5;
const MAX_ITERATIONS = 2;
const TOKEN_LIMIT = 7500;

export function deciderAgent(state: WorkflowStateType) {
  const currentScore = state.review.score;

  const isBetter = state.bestDraft === null || currentScore > state.bestScore;

  const bestDraft = isBetter ? state.draft : state.bestDraft;
  const bestReview = isBetter ? state.review : state.bestReview;
  const bestScore = isBetter ? currentScore : state.bestScore;

  const totalTokens =
    (state.tokenUsage.writer?.totalTokens ?? 0) +
    (state.tokenUsage.review?.totalTokens ?? 0);

  // Human-requested revision has already been completed.
  const isHumanRevision = state.humanRevisionUsed;

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
    return {
      ...bestResult,
      decision: "stop" as const,
      decisionReason: `Passing score achieved: ${bestScore}/10.`,
    };
  }

  // Human-directed revision has been reviewed.
  if (isHumanRevision) {
    return {
      ...bestResult,
      decision: "stop" as const,
      decisionReason: "Human-requested improvement completed and reviewed.",
    };
  }

  // Maximum iterations reached.
  if (completedIterations >= MAX_ITERATIONS) {
    if (totalTokens < TOKEN_LIMIT) {
      return {
        ...bestResult,
        decision: "human_review" as const,
        decisionReason: `Maximum iterations reached. Token usage: ${totalTokens}/7500. Requesting human review.`,
      };
    }

    return {
      ...bestResult,
      decision: "stop" as const,
      decisionReason: `Maximum iterations and token budget reached. Total tokens: ${totalTokens}.`,
    };
  }

  return {
    ...bestResult,
    decision: "improve" as const,
    decisionReason: `Score ${currentScore}/10 is below ${PASSING_SCORE}. Another iteration is allowed.`,
  };
}
