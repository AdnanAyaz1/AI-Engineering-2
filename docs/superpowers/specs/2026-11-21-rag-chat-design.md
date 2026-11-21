# RAG Chat Bot Page Design

## 1. Intent & Context
The user wants a dedicated chat page to talk with an AI assistant powered by the existing RAG pipeline (`/api/retrieve`). The page should provide a clean chat experience where the assistant's answers are rendered in formatted Markdown and users can optionally inspect retrieved context sources.

## 2. Goals, Non-Goals & Anti-Goals
- **Goals**:
  - Provide a chat interface at `/rag-chat` to converse with indexed documents.
  - Send user questions to `/api/retrieve` (with configurable or default `topK=5`).
  - Render assistant responses in rich Markdown (headings, tables, lists, bold text, code blocks) using `react-markdown` and `remark-gfm`.
  - Display an expandable sources badge under each assistant message (`Sources (N) • $X.XXXX`) showing the exact retrieved document passages and similarity scores.
  - Responsive, dark/light theme compatible with existing pages in the repository.
  - Graceful handling of loading states, network errors, and empty states.
- **Non-Goals**:
  - In-page document uploading / indexing (the user specifically asked for "just a chat area").
  - Persistent multi-session database chat history (session is maintained in component state for interactive testing).
- **Anti-Goals**:
  - Cluttering the chat stream with raw unformatted text or overwhelming debug panels.
  - Breaking or modifying the existing `/api/retrieve` or `/chatbot` routes.

## 3. Approaches Considered
1. **Approach 1: Clean Chat Area with Collapsible Sources (Chosen)**
   - Header, scrollable message list, sticky prompt input.
   - Assistant messages render full Markdown.
   - Expandable dropdown below each assistant message shows retrieved source chunks and similarity scores without visual clutter.
   - *Why chosen:* Directly matches user's preferred experience.
2. **Approach 2: Pure Minimalist Chat**
   - Strictly user & assistant messages, completely omitting source chunks and telemetry.
   - *Rejected:* Misses the key benefit of RAG (verifiable citations).
3. **Approach 3: Two-Pane Chat & Inspector**
   - Left side chat, right side permanent retrieved chunks inspector.
   - *Rejected:* Too cluttered; user requested "just a chat area".

## 4. Architecture & Implementation Details
- **Page Location**: `app/rag-chat/page.tsx`
- **Navigation**: Add a link from `app/chatbot/page.tsx` and header navigation for quick switching.
- **API Endpoint**: `POST /api/retrieve`
  - Request: `{ question: string, topK: number }`
  - Response: `{ success: boolean, answer: string, sources: Array<{ id, content, chunkIndex, documentId, similarity }>, usage: { totalTokens }, cost: { totalCost, currency } }`
- **Markdown Rendering**:
  - `ReactMarkdown` with `remarkGfm`
  - Custom styled components for tables, code blocks, lists, blockquotes, and links.
- **UI State**:
  - `messages`: Array of `{ id, role: 'user' | 'assistant', content: string, sources?: RetrievedChunk[], cost?: Cost, usage?: Usage, createdAt: Date }`
  - `input`: Current query string
  - `topK`: Number of chunks to retrieve (default: 5)
  - `loading`: Boolean during retrieval and generation
  - `error`: Nullable error message
  - `expandedSources`: Map of message ID to boolean for toggling source views

## 5. What's Left to the Builder
- Precise Tailwind styling matching the repo's existing dark/light theme (zinc-50 / zinc-950).
- Smooth auto-scroll to latest message on new responses.
- Sample prompt chips on empty state to let the user start talking right away.
