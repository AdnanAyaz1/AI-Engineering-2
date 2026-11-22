import { WorkflowState } from "./state";

export async function trackerAgent(state: typeof WorkflowState.State) {
  if (state.score > state.bestScore) {
    return {
      bestDraft: state.draft,
      bestScore: state.score,
    };
  }

  return {};
}
