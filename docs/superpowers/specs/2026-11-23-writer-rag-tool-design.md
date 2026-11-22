# Writer Agent RAG Tool Design Spec

## Goal
Enable the Writer Agent to autonomously query the company RAG knowledge base via a LangChain tool to cite verified facts, metrics, and services in landing-page copy.

## Architecture
1. **Tool Definition (`lib/agentic-ai/tools/rag-retriever.ts`)**:
   - Define `searchCompanyKnowledge` using `@langchain/core/tools` (`tool` function).
   - Parameters: `{ query: string, topK?: number }` validated with Zod.
   - Execution: Invokes `retrieveChunks(query, topK)` from `@/lib/rag/retrieval`. Returns formatted string excerpts with similarity scores and content.
2. **Writer Agent Enhancement (`lib/agentic-ai/agents/writer.ts`)**:
   - Bind `searchCompanyKnowledge` to the Groq Chat model (`model.bindTools([searchCompanyKnowledge])`).
   - If the model emits tool calls, execute the tool, feed the tool observation back as a `ToolMessage`, and have the model generate the final structured output matching `writerSchema`.
   - Update writer system prompt to instruct the agent to use `searchCompanyKnowledge` whenever real metrics, client case studies, tech stack details, or company facts can strengthen the pitch.
3. **Telemetry & State**:
   - Aggregate tokens used during the tool-calling step into `state.tokenUsage.writer`.
4. **Non-Goals**:
   - Modifying reviewer, decider, or resume endpoints (their contracts remain unchanged).
