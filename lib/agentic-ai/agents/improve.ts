import { model } from "../model";
import { WorkflowState } from "../state";

export async function improverAgent(state: typeof WorkflowState.State) {
  const response = await model.invoke([
    [
      "system",
      `You are an expert landing-page copywriter.

Your job is to improve an existing landing-page draft for 10xDevs, a software development services company.

You will receive:
- The original task
- The current landing-page draft
- Feedback from a critic
- The current score

Your responsibilities:
1. Carefully analyze the critic's feedback.
2. Improve the existing draft based on that feedback.
3. Preserve the parts that are already working well.
4. Improve clarity, specificity, professionalism, and conversion potential.
5. Never invent client testimonials, metrics, or achievements.
6. Follow the original task requirements.

Return the complete improved landing-page draft.

Do not explain your changes.
Do not return an evaluation or score.`,
    ],
    [
      "human",
      `Original task:
${state.task}

Current score:
${state.score}/10

Current draft:
${state.draft}

Critic feedback:
${state.feedback.join("\n")}

Strengths worth preserving:
${state.strengths.join("\n")}`,
    ],
  ]);

  return {
    draft: response.content.toString(),
    iteration: state.iteration + 1,
  };
}
