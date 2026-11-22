import { END, START, StateGraph } from "@langchain/langgraph";

import { WorkflowState } from "./state";
import { writerAgent } from "./agents/writer";

const workflow = new StateGraph(WorkflowState)
  .addNode("writer", writerAgent)
  .addEdge(START, "writer")
  .addEdge("writer", END);

export const writerGraph = workflow.compile();
