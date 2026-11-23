import { Command, END, interrupt } from "@langchain/langgraph";
import type { WorkflowStateType } from "../state";

type HumanResponse =
  | { action: "approve" }
  | { action: "improve"; feedback: string };

export function humanReviewAgent(state: WorkflowStateType) {
  const response = interrupt({
    message: "Review the best generated draft.",
    draft: state.bestDraft,
    review: state.bestReview,
    bestScore: state.bestScore,
    tokenUsage: state.tokenUsage,
    options: ["approve", "improve"],
  }) as HumanResponse;

  if (response?.action === "approve") {
    return new Command({
      goto: END,
      update: {
        humanAction: "approve" as const,
        decision: "stop" as const,
      },
    });
  }

  if (
    response?.action === "improve" &&
    typeof response.feedback === "string" &&
    response.feedback.trim()
  ) {
    return new Command({
      goto: "writer",
      update: {
        humanAction: "improve" as const,
        humanFeedback: response.feedback.trim(),
        humanRevisionUsed: true,

        // Start the human-guided revision from the best draft.
        draft: state.bestDraft!,
        review: state.bestReview!,
      },
    });
  }

  throw new Error("Invalid human review response.");
}
