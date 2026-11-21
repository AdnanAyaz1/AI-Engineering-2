# RAG Chat Bot Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a clean, interactive RAG Chat page at `/rag-chat` that queries the `/api/retrieve` endpoint, renders assistant responses in formatted Markdown, and displays collapsible source context and cost telemetry.

**Architecture:** Client-side Next.js App Router page (`app/rag-chat/page.tsx`) interacting with `POST /api/retrieve`. Rich Markdown rendering powered by `react-markdown` and `remark-gfm`, with interactive disclosure widgets for retrieved document chunks.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, `react-markdown`, `remark-gfm`.

**Spec:** `docs/superpowers/specs/2026-11-21-rag-chat-design.md`

## Global Constraints
- Target page path: `app/rag-chat/page.tsx`.
- Must talk to the existing `POST /api/retrieve` endpoint with `{ question: string, topK: number }`.
- Must render assistant responses formatted as Markdown (tables, headings, lists, code blocks).
- Must include collapsible source drawer per assistant message displaying chunk text, chunk index, and similarity score.
- Must not break existing pages (`/chatbot`, `/sementic-search`, `/sentiment`).

## Review Focus
- Empty input submission must be prevented.
- API error responses (e.g. 500 or network failure) must display a clear, non-crashing error banner or message.
- Multi-line markdown (especially tables, code fences, and bullet points) must render with proper styling without overflow.
- Sources accordion toggle must isolate state per message so expanding one does not expand all.
- Telemetry display ($0.0000 and token count) must handle zero or missing usage values safely.

---

### Task 1: Navigation Integration
**Files:**
- Modify: `app/chatbot/page.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Links pointing to `/rag-chat` with label "📚 RAG Chat" or "RAG Assistant".

- [ ] **Step 1: Add RAG Chat link to `app/chatbot/page.tsx` header**
- [ ] **Step 2: Add RAG Chat card / navigation link to `app/page.tsx`**
- [ ] **Step 3: Verify navigation links render without TypeScript errors**

---

### Task 2: Implement the RAG Chat Page
**Files:**
- Create: `app/rag-chat/page.tsx`

**Interfaces:**
- Consumes: `POST /api/retrieve` with `{ question: string, topK?: number }`
- Receives:
  ```ts
  {
    success: boolean;
    question: string;
    answer: string;
    sources: Array<{
      id: string;
      content: string;
      chunkIndex: number;
      documentId: string;
      similarity: number;
    }>;
    totalResults: number;
    usage?: {
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
    };
    cost?: {
      inputCost: number;
      outputCost: number;
      totalCost: number;
      currency: string;
    };
  }
  ```
- Produces: Complete interactive page at `/rag-chat`.

- [ ] **Step 1: Define types and initial state**
  - Message model: `id`, `role: 'user' | 'assistant'`, `content`, `sources`, `usage`, `cost`, `createdAt`.
  - State: `messages`, `input`, `isLoading`, `error`, `topK`, `expandedSources` (record of message id -> boolean).
- [ ] **Step 2: Implement message submission handler**
  - Sends query to `/api/retrieve`.
  - Appends user message immediately.
  - Appends assistant message with answer, sources, and telemetry on success.
  - Catches errors and displays error alert.
- [ ] **Step 3: Implement rich Markdown styling**
  - Setup `ReactMarkdown` with `remarkGfm` and custom renderers for `h1-h4`, `p`, `ul`, `ol`, `code`, `table`, `thead`, `th`, `td`, `blockquote`.
- [ ] **Step 4: Implement collapsible Sources drawer**
  - Badge button: `Sources ({sources.length}) • ${cost}`
  - Accordion body with styled source cards showing similarity percentage, chunk index, and snippet.
- [ ] **Step 5: Implement UI shell, presets, and sticky input**
  - Header with topK control slider / badge and navigation link back to standard chat.
  - Empty state with preset sample prompt pills (e.g. "What are the test levels in microservices?", "Explain mutation testing and Stryker").
  - Auto-scrolling message list.
  - Sticky bottom input with Enter key handling and disabled state during loading.

---

### Task 3: Verification & Polish
**Files:**
- Verify: `app/rag-chat/page.tsx`
- Run: `npx tsc --noEmit`
- Run: HTTP verification against `/rag-chat` and `/api/retrieve`

- [ ] **Step 1: Run TypeScript check (`npx tsc --noEmit`) to verify zero type errors**
- [ ] **Step 2: Verify page loads successfully via HTTP GET to `http://localhost:3000/rag-chat`**
- [ ] **Step 3: Send a test question through `/api/retrieve` and verify Markdown output and sources accordion**
