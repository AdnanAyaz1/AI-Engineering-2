# MediVoice Architecture Refactor Design: RAG Chat & Semantic Search

## 1. Intent & Context
Refactor the **RAG Document Chat** (`/rag-chat`) and **Semantic Search** (`/sementic-search`) pages in accordance with the MediVoice clean architecture standards:
- Pure Route Isolation (thin `page.tsx` orchestrators ~30–50 lines).
- Logic exclusively isolated in custom hooks (`useRagChat`, `useSemanticSearch`).
- Pure UI composition with single-responsibility sub-components in dedicated folders.
- Strong types in `types/` and static configurations in `constants/`.

## 2. Goals, Non-Goals & Anti-Goals
- **Goals**:
  - Extract all business logic, API communication (`fetch`), and state handling into `hooks/useRagChat.ts` and `hooks/useSemanticSearch.ts`.
  - Extract interfaces into `types/ragChat.ts` and `types/semanticSearch.ts`.
  - Extract static sample prompts, options, and limits into `constants/ragChat.ts` and `constants/semanticSearch.ts`.
  - Decompose `app/rag-chat/page.tsx` from 460+ lines into ~35–50 lines orchestrator with sub-components under `components/rag-chat/`.
  - Decompose `app/sementic-search/page.tsx` from 200+ lines into ~30–45 lines orchestrator with sub-components under `components/semantic-search/`.
  - Preserve 100% of existing behavior and visual fidelity (Markdown rendering, source drawer, score bars, copy buttons, dark/light themes).
  - Pass `npm run build` and TypeScript checks without errors.
- **Non-Goals**:
  - Modifying backend API routes (`/api/retrieve`, `/api/search`).
  - Refactoring unrelated pages (`/chatbot`, `/sentiment`) in this phase.
- **Anti-Goals**:
  - Leaving raw `fetch`, inline state, or complex event handlers inside visual JSX components.
  - Exporting multiple components from a single file.
  - Introducing behavioral regressions or broken styles.

## 3. Approaches Considered
- **Approach 1: RAG Chat & Semantic Search Refactor (Chosen)**:
  - Focus surgical refactoring on the two search & retrieval pages recently enhanced with chunk formatting.
  - Established, isolated scope delivering clean architecture without touching unrelated routes.
- **Approach 2: Full-Repo Refactor**:
  - Refactor all 4 pages simultaneously.
  - *Deferred:* User explicitly selected Approach 1.

## 4. Architectural Structure

```
types/
├── ragChat.ts              # RetrievedSource, MessageUsage, MessageCost, ChatMessage
└── semanticSearch.ts       # SearchResult, UseSemanticSearchReturn

constants/
├── ragChat.ts              # SAMPLE_PROMPTS, TOP_K_OPTIONS, DEFAULT_TOP_K
└── semanticSearch.ts       # SEARCH_TOP_K_OPTIONS, DEFAULT_SEARCH_TOP_K

hooks/
├── useRagChat.ts           # State (messages, input, topK, loading, error, expandedSources),
│                           # handleSend, handleKeyDown, toggleSources, dismissError
└── useSemanticSearch.ts    # State (query, topK, results, loading, error, searched),
                            # handleSearch, setQuery, setTopK

components/
├── rag-chat/
│   ├── RagChatHeader.tsx       # Header navigation and top-K selector
│   ├── RagChatEmptyState.tsx   # Empty state icon, description, and sample prompt buttons
│   ├── RagChatMessageItem.tsx  # Single user / assistant message card with ReactMarkdown
│   ├── RagChatSources.tsx      # Expandable sources accordion + telemetry + FormattedChunk
│   ├── RagChatInputBar.tsx     # Sticky footer textarea and send button
│   ├── RagChatErrorBanner.tsx  # Dismissible error banner
│   └── index.ts                # Public exports
│
└── semantic-search/
    ├── SemanticSearchHeader.tsx    # Header & experiment badge
    ├── SemanticSearchForm.tsx      # Query textarea, top-K dropdown, search button
    ├── SemanticSearchResultCard.tsx # Result card with title, score bar, FormattedChunk
    ├── SemanticSearchResultsList.tsx # List container & empty/loading states
    └── index.ts                    # Public exports

app/
├── rag-chat/page.tsx       # Clean orchestrator (~35-50 lines)
└── sementic-search/page.tsx # Clean orchestrator (~30-40 lines)
```

## 5. Verification Plan
- `npm run build`: Verify Turbopack build, TypeScript compiler, and static generation of all 15 routes pass cleanly.
- Visual & functional parity check of `/rag-chat` and `/sementic-search`.
