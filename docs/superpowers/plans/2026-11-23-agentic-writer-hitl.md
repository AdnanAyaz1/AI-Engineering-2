# Agentic Copywriting Pipeline & Human-in-the-Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the resume API endpoint and an interactive, modern frontend for the LangGraph agentic copywriting pipeline with human-in-the-loop review.

**Architecture:** A Next.js App Router API route at `/api/test/resume` resumes interrupted LangGraph threads using `Command({ resume })`. An interactive client dashboard at `/agentic-writer` manages workflow execution, displays agent evaluation telemetry, guides human review decisions, and renders final marketing assets.

**Tech Stack:** Next.js 16 (App Router), React 19, LangGraph.js, Tailwind CSS 4, Lucide React, TypeScript 5.

**Spec:** [docs/superpowers/specs/2026-11-23-agentic-writer-hitl-design.md](file:///c:/REPOS/AI_ENGINEERING/ai-engineer/docs/superpowers/specs/2026-11-23-agentic-writer-hitl-design.md)

## Global Constraints
- Must use existing `writerGraph` from `@/lib/agentic-ai/graph`.
- Endpoint validation must enforce non-empty `threadId`, action `"approve" | "improve"`, and non-empty `feedback` when action is `"improve"`.
- UI must follow existing design language (`AppHeader`, Lucide icons, Emil Kowalski transition timing, dark/light theme support).
- TypeScript strict checking must pass with zero errors (`npx tsc --noEmit`).

## Review Focus
1. Non-empty feedback validation when action is `"improve"`.
2. Interruption state handling when workflow requires human review vs when it runs to completion immediately.
3. Resilient error state handling on both start and resume network/agent errors.
4. Token usage calculation fallback for missing agent telemetry.
5. Preserving thread ID across review iterations.

---

### Task 1: Implement the Resume API Endpoint
**Files:**
- Create: `app/api/test/resume/route.ts`

**Interfaces:**
- Consumes: `POST` JSON body with `{ threadId: string, action: "approve" | "improve", feedback?: string }`
- Produces: JSON response with `{ success: boolean, status: "awaiting_human" | "completed", threadId, humanReview?, draft?, review?, evaluation?, history?, tokenUsage?, error? }`

- [ ] **Step 1: Create `app/api/test/resume/route.ts`**
  Implement the user's resume endpoint code with validation for `threadId`, `action`, and conditional `feedback`, invoking `writerGraph.invoke(new Command({ resume: ... }))`.

- [ ] **Step 2: Verify with TypeScript type check**
  Run `npx tsc --noEmit` to ensure proper LangGraph imports and types.

---

### Task 2: Define Agentic Writer Types and State Hook
**Files:**
- Create: `types/agenticWriter.ts`
- Create: `hooks/useAgenticWriter.ts`

**Interfaces:**
- Produces: Types for `AgenticStatus`, `DraftContent`, `ReviewContent`, `HumanReviewData`, `IterationRecord`, `PipelineResult`.
- Produces: `useAgenticWriter` hook providing `status`, `threadId`, `humanReviewData`, `completedData`, `error`, `startPipeline(task: string)`, `resumePipeline(action: "approve" | "improve", feedback?: string)`, `reset()`.

- [ ] **Step 1: Write `types/agenticWriter.ts`**
  Define TypeScript interfaces for draft, review, human review interruption, history items, token telemetry, and API responses.

- [ ] **Step 2: Write `hooks/useAgenticWriter.ts`**
  Implement state machine managing `idle` -> `starting` -> `awaiting_human` -> `resuming` -> `completed` / `error`, handling network requests to `/api/test` and `/api/test/resume`.

- [ ] **Step 3: Verify types**
  Run `npx tsc --noEmit`.

---

### Task 3: Build Agentic UI Components
**Files:**
- Create: `components/agentic/AgenticTaskInput.tsx`
- Create: `components/agentic/AgenticStatusTracker.tsx`
- Create: `components/agentic/HumanReviewConsole.tsx`
- Create: `components/agentic/CompletedDraftView.tsx`
- Create: `components/agentic/IterationHistoryDrawer.tsx`
- Create: `components/agentic/TokenTelemetryCard.tsx`
- Create: `components/agentic/index.ts`

**Interfaces:**
- Consumes: Hook state and actions from Task 2.
- Produces: Modular presentation components for the copywriting lifecycle.

- [ ] **Step 1: Create `AgenticTaskInput.tsx`**
  Input form with quick-fill prompt chips for common landing-page tasks, loading spinner, and validation.

- [ ] **Step 2: Create `AgenticStatusTracker.tsx`**
  Stepped pipeline progress badge bar: Writer -> Reviewer -> Quality Decider -> Human in the Loop -> Final Output.

- [ ] **Step 3: Create `HumanReviewConsole.tsx`**
  Card displaying the interrupted draft, current score, strengths, and feedback pills, with one-click "Approve" button and "Request Improvement" mode with feedback input.

- [ ] **Step 4: Create `CompletedDraftView.tsx` and `TokenTelemetryCard.tsx`**
  High-fidelity card previewing headline, description, CTA button, copy-to-clipboard, score summary, and agent token usage telemetry.

- [ ] **Step 5: Create `IterationHistoryDrawer.tsx`**
  Collapsible history component displaying chronological iterations with their scores and diffs.

- [ ] **Step 6: Create barrel export `components/agentic/index.ts`**

---

### Task 4: Assemble the `/agentic-writer` Page
**Files:**
- Create: `app/agentic-writer/page.tsx`

**Interfaces:**
- Consumes: `AppHeader`, `useAgenticWriter`, and components from `components/agentic`.
- Produces: Next.js page route at `/agentic-writer`.

- [ ] **Step 1: Write `app/agentic-writer/page.tsx`**
  Assemble the full dashboard with clean layout, responsive spacing, empty/loading/HITL/completed states.

- [ ] **Step 2: Type check**
  Run `npx tsc --noEmit`.

---

### Task 5: Integrate into Navigation and Dashboard
**Files:**
- Modify: `components/navigation/AppHeader.tsx`
- Modify: `components/home/HomeFeatureGrid.tsx`

- [ ] **Step 1: Add link to `AppHeader.tsx`**
  Add `{ href: '/agentic-writer', label: 'Agentic Writer', icon: Sparkles }` to `NAV_LINKS`.

- [ ] **Step 2: Add feature card to `HomeFeatureGrid.tsx`**
  Add a FeatureCard highlighting "Agentic Copywriter (HITL)" with badge "LangGraph + HITL".

- [ ] **Step 3: Type check**
  Run `npx tsc --noEmit`.

---

### Task 6: End-to-End Verification and Build Test
**Files:**
- Verification only

- [ ] **Step 1: Run TypeScript check**
  Run `npx tsc --noEmit`.

- [ ] **Step 2: Run Next.js build**
  Run `npm run build` to verify route resolution, server components, and client components.
