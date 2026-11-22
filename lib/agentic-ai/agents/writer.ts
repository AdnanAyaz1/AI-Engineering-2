import { model } from "../model";
import { writerSchema } from "../schemas/writer.schema";
import { WorkflowState } from "../state";
import { extractTokenUsage } from "../helpers/token-usage";

const structuredModel = model.withStructuredOutput(writerSchema, {
  includeRaw: true,
});

export async function writerAgent(state: typeof WorkflowState.State) {
  const isImprovement = state.iteration > 0;

  const response = await structuredModel.invoke([
    [
      "system",
      `You are a conversion-focused landing-page copywriter for 10xDevs, a software development company.

Create a compelling headline, supporting description, and CTA.

Rules:
- Be concise, specific, and professional.
- Avoid generic marketing language.
- Preserve the original task and company positioning.
- Never invent statistics, clients, testimonials, or achievements.
- Return only content matching the provided schema.

${
  isImprovement
    ? `IMPROVEMENT:
Revise the previous draft using reviewer feedback.
Preserve strengths, fix weaknesses, and avoid unnecessary rewrites.`
    : `INITIAL GENERATION:
Create an original draft based on the user's requirements.`
}`,
    ],
    [
      "human",
      JSON.stringify({
        task: state.task,
        ...(isImprovement && {
          currentDraft: state.draft,
          feedback: state.review.feedback,
          previousScore: state.review.score,
        }),
      }),
    ],
  ]);

  if (!response.parsed) {
    throw new Error("Writer failed to generate valid structured content.");
  }

  return {
    draft: response.parsed,
    tokenUsage: {
      writer: extractTokenUsage(response.raw),
    },
  };
}
