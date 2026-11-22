import { createAgent, toolStrategy } from "langchain";
import { AIMessage } from "@langchain/core/messages";

import { model } from "../model";
import { writerSchema } from "../schemas/writer.schema";
import { WorkflowState } from "../state";
import { extractTokenUsage } from "../helpers/token-usage";
import { retrieveCompanyData } from "../tools/retrieval";

const writer = createAgent({
  model,
  tools: [retrieveCompanyData],
  responseFormat: toolStrategy(writerSchema),
});

export async function writerAgent(state: typeof WorkflowState.State) {
  const isImprovement = state.iteration > 0;

  const systemPrompt = `
You are a conversion-focused landing-page copywriter
for 10xDevs, a software development company.

Create a compelling headline, supporting description,
and CTA.

Rules:
- Be concise, specific, and professional.
- Avoid generic marketing language.
- Preserve the original task and company positioning.
- Never invent statistics, clients, testimonials, or achievements.
- Use tools when additional information would improve accuracy.
- You decide whether a tool is necessary.
- Do not call tools unnecessarily.

${
  isImprovement
    ? `
IMPROVEMENT:
Revise the previous draft using reviewer feedback.
Preserve strengths and fix weaknesses.
Prioritize human feedback when provided.
`
    : `
INITIAL GENERATION:
Create an original draft based on the user's requirements.
`
}
`;

  const result = await writer.invoke({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: JSON.stringify({
          task: state.task,
          ...(isImprovement && {
            currentDraft: state.draft,
            reviewerFeedback: state.review.feedback,
            humanFeedback: state.humanFeedback,
            previousScore: state.review.score,
          }),
        }),
      },
    ],
  });

  const draft = result.structuredResponse;

  if (!draft) {
    throw new Error("Writer failed to generate valid structured content.");
  }

  // Aggregate token usage from all LLM invocations.
  const usage = result.messages
    .filter((message) => message instanceof AIMessage)
    .map((message) => extractTokenUsage(message))
    .reduce(
      (total, current) => ({
        inputTokens: total.inputTokens + current.inputTokens,
        outputTokens: total.outputTokens + current.outputTokens,
        totalTokens: total.totalTokens + current.totalTokens,
        costUSD: total.costUSD + current.costUSD,
      }),
      {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        costUSD: 0,
      },
    );

  return {
    draft,
    tokenUsage: {
      writer: usage,
    },
  };
}
