
import { ChatGroq } from "@langchain/groq";

export const model = new ChatGroq({
  model: "openai/gpt-oss-20b",
  temperature: 0.7,
  maxTokens: 1024,
  apiKey: process.env.GROQ_API_KEY,
});
