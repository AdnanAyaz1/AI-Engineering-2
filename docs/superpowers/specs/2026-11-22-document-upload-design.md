# MediVoice Architecture Design: Document Upload Page

## 1. Intent & Context
Build a dedicated document upload page at `/upload` that ingests documents (`.pdf`, `.docx`, `.txt`) using the backend pipeline at `POST /api/loader`. The page strictly follows the MediVoice architectural standard:
- Pure Route Isolation (thin `page.tsx` orchestrator ~40 lines).
- Logic exclusively in a custom hook (`useDocumentUpload`).
- Sub-components with single responsibility in `components/upload/`.
- Centralized types and constants in `types/upload.ts` and `constants/upload.ts`.

## 2. Goals & Non-Goals
- **Goals**:
  - Drag-and-drop & file picker supporting `.pdf`, `.docx`, `.txt` up to 25MB.
  - Client-side validation for file types and sizes with immediate error feedback.
  - Multi-step loading feedback while chunking and computing embeddings.
  - Ingestion summary card showing document ID, chunk count, character count, and embedding dimensions.
  - Seamless navigation to `/rag-chat` to query the uploaded document right away.
  - Clean responsive UI matching existing dark/light zinc design system.
  - Pass `npm run build` with zero errors.
- **Non-Goals**:
  - Modifying backend `/api/loader` behavior.
  - Deleting existing documents from the database.

## 3. Architecture Overview

```
types/
└── upload.ts               # UploadResult, UploadStatus, UseDocumentUploadReturn

constants/
└── upload.ts               # ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES, etc.

hooks/
└── useDocumentUpload.ts    # File selection, drag-and-drop, validation,
                            # FormData upload, status, error handling

components/upload/
├── UploadHeader.tsx        # Title, subtitle, navigation links
├── UploadDropzone.tsx      # Drag & drop box with file input trigger
├── UploadSelectedFile.tsx  # Selected file preview + upload button
├── UploadSuccessCard.tsx   # Metrics summary + "Chat with Document" button
├── UploadErrorBanner.tsx   # Dismissible error alert
└── index.ts                # Unified public export

app/
├── upload/page.tsx         # Pure orchestrator (~40 lines)
└── page.tsx                # Added upload card to home dashboard
```
