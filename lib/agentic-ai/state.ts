import { Annotation } from "@langchain/langgraph";

export const WorkflowState = Annotation.Root({
  task: Annotation<string>(),
  draft: Annotation<string>(),
  score: Annotation<number>(),
  feedback: Annotation<string[]>(),
  strengths: Annotation<string[]>(),
  iteration: Annotation<number>(),
  maxIterations: Annotation<number>(),
  bestDraft: Annotation<string>(),
  bestScore: Annotation<number>(),
});
