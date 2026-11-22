# Writer Agent RAG Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Equip the Writer Agent in the agentic copywriting pipeline with an autonomous LangChain tool that queries the pgvector RAG database to ground marketing copy in verified company facts.

**Architecture:** Implement a LangChain tool `searchCompanyKnowledge` wrapping `retrieveChunks` in `lib/agentic-ai/tools/rag-retriever.ts`. Update `writerAgent` in `lib/agentic-ai/agents/writer.ts` to bind this tool, execute any requested tool calls, feed observations back, and produce structured `writerSchema` output with accumulated token telemetry.

**Tech Stack:** Next.js 16, LangChain Core (`tool`, `AIMessage`, `ToolMessage`), pgvector / Prisma, Zod, Groq.

**Spec:** [docs/superpowers/specs/2026-11-23-writer-rag-tool-design.md](file:///c:/REPOS/AI_ENGINEERING/ai-engineer/docs/superpowers/specs/2026-11-23-writer-rag-tool-design.md)

## Global Constraints
- Do not break existing `writerSchema` output shape (`headline`, `description`, `callToAction`).
- Handle database/embedding lookup failures gracefully inside the tool so the writer can fall back gracefully.
- Sum token usage across both tool-calling and structured-generation steps for accurate billing telemetry.
- Zero TypeScript errors (`npx tsc --noEmit`).

## Review Focus
1. Graceful tool error handling if pgvector table is empty or embedding fails.
2. Proper `ToolMessage` structure matching LangChain specification with `tool_call_id`.
3. Combined token usage calculation (`inputTokens`, `outputTokens`, `totalTokens`, `costUSD`).
4. Support for direct structured output if the model decides no tool calls are needed.
5. Preservation of human feedback and previous critique in iterative cycles.

---

### Task 1: Create `searchCompanyKnowledge` Tool
**Files:**
- Create: `lib/agentic-ai/tools/rag-retriever.ts`

**Interfaces:**
- Consumes: `retrieveChunks` from `@/lib/rag/retrieval`
- Produces: `searchCompanyKnowledge` LangChain tool with Zod schema `{ query: string, topK?: number }`

- [ ] **Step 1: Write `lib/agentic-ai/tools/rag-retriever.ts`**
  Implement the tool using `tool` from `@langchain/core/tools` with Zod validation. Catch errors and return helpful formatted string representations of retrieved chunks.

- [ ] **Step 2: Type check**
  Run `npx tsc --noEmit`.

---

### Task 2: Enhance `writerAgent` with Autonomous Tool Calling
**Files:**
- Modify: `lib/agentic-ai/agents/writer.ts`

**Interfaces:**
- Consumes: `searchCompanyKnowledge` from `../tools/rag-retriever`, `model` from `../model`, `extractTokenUsage` from `../helpers/token-usage`
- Produces: `writerAgent(state: typeof WorkflowState.State)` returning `{ draft, tokenUsage: { writer } }`

- [ ] **Step 1: Update `writerAgent` in `lib/agentic-ai/agents/writer.ts`**
  - Bind `searchCompanyKnowledge` to `model`.
  - Invoke `modelWithTools`. If tool calls are present, execute them, format `ToolMessage` objects, and provide observations.
  - Invoke structured generation with `structuredModel`.
  - Sum token usages from both passes.

- [ ] **Step 2: Type check**
  Run `npx tsc --noEmit`.

---

### Task 3: Build Verification & Validation
**Files:**
- Verification only

- [ ] **Step 1: Run TypeScript check**
  Run `npx tsc --noEmit`.

- [ ] **Step 2: Run Next.js build**
  Run `npm run build`.
