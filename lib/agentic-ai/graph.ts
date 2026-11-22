import { END, START, StateGraph, MemorySaver } from "@langchain/langgraph";

import { WorkflowState } from "./state";
import { writerAgent } from "./agents/writer";
import { reviewAgent } from "./agents/review";
import { deciderAgent } from "./agents/decider";
import { humanReviewAgent } from "./agents/humanReview";

const workflow = new StateGraph(WorkflowState)
  .addNode("writer", writerAgent)
  .addNode("critic", reviewAgent)
  .addNode("decider", deciderAgent)
  .addNode("human_review", humanReviewAgent)

  .addEdge(START, "writer")
  .addEdge("writer", "critic")
  .addEdge("critic", "decider")

  .addConditionalEdges("decider", (state) => state.decision, {
    improve: "writer",
    human_review: "human_review",
    stop: END,
  })

  .addConditionalEdges("human_review", (state) => state.humanAction!, {
    approve: END,
    improve: "writer",
  });

const globalForLangGraph = globalThis as unknown as {
  writerCheckpointer?: MemorySaver;
};

const checkpointer =
  globalForLangGraph.writerCheckpointer ?? new MemorySaver();

if (process.env.NODE_ENV !== "production") {
  globalForLangGraph.writerCheckpointer = checkpointer;
}

export const writerGraph = workflow.compile({
  checkpointer,
});
