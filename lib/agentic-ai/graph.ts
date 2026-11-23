import { END, START, StateGraph, MemorySaver } from "@langchain/langgraph";

import { WorkflowState } from "./state";
import { writerAgent } from "./agents/writer";
import { reviewAgent } from "./agents/review";
import { deciderAgent } from "./agents/decider";
import { humanReviewAgent } from "./agents/humanReview";

const workflow = new StateGraph(WorkflowState)
  .addNode("writer", writerAgent)
  .addNode("critic", reviewAgent)
  .addNode("decider", deciderAgent, {
    ends: ["writer", "human_review", END],
  })
  .addNode("human_review", humanReviewAgent, {
    ends: ["writer", END],
  })

  .addEdge(START, "writer")
  .addEdge("writer", "critic")
  .addEdge("critic", "decider");

// Preserve checkpointer singleton across Next.js bundles and hot-reloads
const globalForLangGraph = globalThis as unknown as {
  writerCheckpointer?: MemorySaver;
};

const checkpointer =
  globalForLangGraph.writerCheckpointer ?? new MemorySaver();

globalForLangGraph.writerCheckpointer = checkpointer;

export const writerGraph = workflow.compile({
  checkpointer,
});
