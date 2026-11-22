
import type { WorkflowStateType } from "../state";

const PASSING_SCORE = 8.5;
const MAX_ITERATIONS = 2;

export function deciderAgent(state: WorkflowStateType) {
  const currentScore = state.review.score;

  // Determine whether the current draft is the best one.
  const isBetter =
    currentScore > state.bestScore ||
    state.bestDraft === null;

  const bestDraft = isBetter
    ? state.draft
    : state.bestDraft;

  const bestScore = isBetter
    ? currentScore
    : state.bestScore;

  // Stop when the passing score is achieved.
  if (bestScore >= PASSING_SCORE) {
    return {
      bestDraft,
      bestScore,
      decision: "stop" as const,
      decisionReason: `Passing score achieved: ${bestScore}/10.`,
    };
  }

  // Stop when no more improvement iterations are allowed.
  if (state.iteration >= MAX_ITERATIONS) {
    return {
      bestDraft,
      bestScore,
      decision: "stop" as const,
      decisionReason: `Maximum iterations reached. Returning best draft with score ${bestScore}/10.`,
    };
  }

  // Allow another improvement iteration.
  return {
    bestDraft,
    bestScore,
    iteration: 1,
    decision: "improve" as const,
    decisionReason: `Score ${currentScore}/10 is below ${PASSING_SCORE}. Another improvement iteration is allowed.`,
  };
}
