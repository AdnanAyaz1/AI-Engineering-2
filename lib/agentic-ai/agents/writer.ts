import { model } from "../model";
import { WorkflowState } from "../state";

export async function writerAgent(state: typeof WorkflowState.State) {
  const response = await model.invoke([
    [
      "system",
      `You are an expert landing-page copywriter.

You write compelling, professional, conversion-focused website content.

The company is 10xDevs, a software development services company.

Your task is to produce high-quality landing-page content based on the user's requirements.

Return:
- A compelling headline
- A supporting description
- A clear call to action

Avoid generic marketing language.`,
    ],
    ["human", state.task],
  ]);

  return {
    draft: response.content.toString(),
  };
}
