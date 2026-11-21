# Sentiment Analysis with Pre-trained Hugging Face Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a clean, interactive sentiment analysis page and API endpoint using a pre-trained Hugging Face model (`distilbert/distilbert-base-uncased-finetuned-sst-2-english`) via the Hugging Face Inference API.

**Architecture:** Next.js App Router with an API endpoint (`app/api/sentiment/route.ts`) calling `@huggingface/inference` and a modern visual client page (`app/sentiment/page.tsx`) with preset buttons, sentiment meters, and error handling for missing `HF_TOKEN`.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, `@huggingface/inference`.

## Global Constraints
- Clean, simple, non-over-engineered flow.
- Graceful error handling if `HF_TOKEN` is missing or invalid.
- Return structured sentiment classifications: `POSITIVE`, `NEGATIVE`, confidence percentage, and full breakdown.

---

### Task 1: Backend Sentiment API Route
**Files:**
- Create: `app/api/sentiment/route.ts`

**Interfaces:**
- Input: `POST` with JSON `{ text: string, hfToken?: string }`
- Output: `200 OK` with JSON `{ label: 'POSITIVE' | 'NEGATIVE', score: number, breakdown: Array<{ label: string, score: number }> }` or `400/401` with error message.

- [ ] **Step 1: Implement `app/api/sentiment/route.ts` using `@huggingface/inference`**
- [ ] **Step 2: Add validation, token fallback (from request or `.env`), and error formatting**
- [ ] **Step 3: Test endpoint with simulated request and verify JSON response**

---

### Task 2: Sentiment Analysis Frontend Page
**Files:**
- Create: `app/sentiment/page.tsx`

**Interfaces:**
- Interactive UI containing:
  - Header with model tag (`distilbert-base-uncased-finetuned-sst-2-english`)
  - Text input area
  - Quick preset buttons (Positive, Negative, Mixed/Neutral)
  - Submit button with loading spinner
  - Visual sentiment result card with score progress bars and emoji
  - Token input helper if `HF_TOKEN` is not configured in `.env`

- [ ] **Step 1: Implement `app/sentiment/page.tsx`**
- [ ] **Step 2: Add presets, submit handler, and visual score breakdown**
- [ ] **Step 3: Test UI in browser via `http://localhost:3000/sentiment`**

---

### Task 3: Verification & Documentation
- [ ] **Step 1: Run TypeScript typecheck (`npx tsc --noEmit`)**
- [ ] **Step 2: Verify both success and token-missing paths**
