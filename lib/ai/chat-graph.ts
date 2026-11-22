import {
  END,
  MemorySaver,
  MessagesAnnotation,
  START,
  StateGraph,
} from "@langchain/langgraph";


import { model } from "./model";
import { chatPrompt } from "./prompt";
import { companyDetails } from "@/constants/ai/company";

const workflow = new StateGraph(MessagesAnnotation)
  .addNode("chat", async (state) => {
    const history = state.messages.slice(0, -1);

    const currentMessage =
      state.messages[state.messages.length - 1];

    const prompt = await chatPrompt.invoke({
      companyName: companyDetails.companyName,

      companyDescription: companyDetails.services,

      context: "No additional company documents retrieved yet.",

      history,

      question: currentMessage.content,
    });

    const response = await model.invoke(prompt);

    return {
      messages: [response],
    };
  })
  .addEdge(START, "chat")
  .addEdge("chat", END);

const checkpointer = new MemorySaver();

export const chatGraph = workflow.compile({
  checkpointer,
});