import { END, START, StateGraph } from "@langchain/langgraph";

import { WorkflowState } from "./state";

import { writerAgent } from "./agents/writer";
import { criticAgent } from "./agents/critic";
import { improverAgent } from "./agents/improve";
import { trackerAgent } from "./tracker";

function shouldImprove(state: typeof WorkflowState.State) {
  if (state.score >= 8.5) {
    return "end";
  }

  if (state.iteration >= state.maxIterations) {
    return "end";
  }

  return "improve";
}

const workflow = new StateGraph(WorkflowState)
  .addNode("writer", writerAgent)
  .addNode("critic", criticAgent)
  .addNode("improver", improverAgent)
  .addNode("tracker", trackerAgent)

  .addEdge(START, "writer")
  .addEdge("writer", "critic")
  .addEdge("critic", "tracker")

  .addConditionalEdges("tracker", shouldImprove, {
    improve: "improver",
    end: END,
  })

  .addEdge("improver", "critic");

export const writerGraph = workflow.compile();
