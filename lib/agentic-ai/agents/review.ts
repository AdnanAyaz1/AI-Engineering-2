import { model } from "../model";
import { WorkflowState } from "../state";
import { reviewerSchema } from "../schemas/reviewer.schema";
import { extractTokenUsage } from "../helpers/token-usage";

const reviewerModel = model.withStructuredOutput(reviewerSchema, {
  includeRaw: true,
});

export async function reviewAgent(state: typeof WorkflowState.State) {
  const response = await reviewerModel.invoke([
    [
      "system",
      `You are a critical SEO and conversion copywriting reviewer for 10xDevs.

Evaluate the landing-page draft on:
- Clarity and specificity
- Conversion potential
- Professional quality
- Relevance to the original task

Return an honest score (0-10), genuine strengths, and actionable improvements.

Rules:
- Evaluate ONLY the provided draft.
- Never invent or assume claims, metrics, or clients.
- Flag unsupported claims and generic language.
- Always provide all required fields.
- Keep feedback specific and concise.`,
    ],
    [
      "human",
      JSON.stringify({
        task: state.task,
        draft: state.draft,
      }),
    ],
  ]);

  const review = response.parsed;

  if (!review) {
    throw new Error("Reviewer failed to generate a valid review.");
  }

  return {
    review,

    history: [
      {
        iteration: state.history.length + 1,
        draft: state.draft,
        review,
      },
    ],

    tokenUsage: {
      review: extractTokenUsage(response.raw),
    },
  };
}
