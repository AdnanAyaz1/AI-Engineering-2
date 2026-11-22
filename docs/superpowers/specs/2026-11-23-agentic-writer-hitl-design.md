# Agentic Copywriting Pipeline & Human-in-the-Loop (HITL) Frontend Design

## Overview
This specification details the frontend interface and resume API endpoint for the LangGraph-based agentic copywriting system. It enables users to submit copywriting tasks, observe multi-agent iterations between the copywriter and SEO/quality reviewer, handle human-in-the-loop review interrupts, and view comprehensive token telemetry and version history.

## Goals
1. Implement the resume API endpoint at `POST /api/test/resume` using LangGraph `Command({ resume: ... })`.
2. Provide a responsive, accessible, Emil Kowalski-polished UI at `/agentic-writer` supporting:
   - Starting a new workflow via `POST /api/test`.
   - Visualizing agent lifecycle status (`idle`, `running`, `awaiting_human`, `completed`, `error`).
   - Human-in-the-loop interaction (`approve` vs `improve` with required feedback).
   - Displaying final landing-page copy with one-click clipboard copy.
   - Revealing iteration history diffs and token/cost telemetry.
3. Integrate the new module into global navigation (`AppHeader`) and dashboard (`HomeFeatureGrid`).

## Architecture & Endpoints
- **Start Endpoint (`POST /api/test`)**:
  - Request: `{ task: string }`
  - Initializes LangGraph workflow with a unique `threadId`.
  - Returns `{ success: true, status: "awaiting_human", threadId, humanReview, ... }` or `{ success: true, status: "completed", ... }`.
- **Resume Endpoint (`POST /api/test/resume`)**:
  - Request: `{ threadId: string, action: "approve" | "improve", feedback?: string }`
  - Invokes `writerGraph.invoke(new Command({ resume: { action, feedback } }), { configurable: { thread_id: threadId } })`.
  - Returns resumed state (`awaiting_human` if re-interrupted, or `completed`).
- **Frontend Page (`/agentic-writer`)**:
  - Built with React 19 / Next.js 16 App Router client components.
  - State machine handles workflow progression and preserves thread context across human pauses.
