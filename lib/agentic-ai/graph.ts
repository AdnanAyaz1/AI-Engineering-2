import { END, START, StateGraph } from "@langchain/langgraph";

import { WorkflowState } from "./state";
import { writerAgent } from "./agents/writer";
import { criticAgent } from "./agents/critic";

const workflow = new StateGraph(WorkflowState)
  .addNode("writer", writerAgent)
  .addNode("critic", criticAgent)

  .addEdge(START, "writer")
  .addEdge("writer", "critic")
  .addEdge("critic", END);

export const writerGraph = workflow.compile();
