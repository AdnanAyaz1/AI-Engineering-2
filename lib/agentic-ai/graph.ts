import { END, START, StateGraph } from "@langchain/langgraph";

import { WorkflowState } from "./state";
import { writerAgent } from "./agents/writer";
import { reviewAgent } from "./agents/review";
import { deciderAgent } from "./agents/decider";

const workflow = new StateGraph(WorkflowState)
  .addNode("writer", writerAgent)
  .addNode("critic", reviewAgent)
  .addNode("decider", deciderAgent)

  // Initial generation
  .addEdge(START, "writer")

  // Evaluate generated content
  .addEdge("writer", "critic")
  .addEdge("critic", "decider")

  // Decide whether to improve or finish
  .addConditionalEdges("decider", (state) => state.decision, {
    improve: "writer",
    stop: END,
  });

export const writerGraph = workflow.compile();
