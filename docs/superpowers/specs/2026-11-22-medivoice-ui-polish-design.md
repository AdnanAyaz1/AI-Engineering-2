# MediVoice UI & Design Polish Specification

## 1. Intent & Context
Upgrade the user interface across the application to reflect the refined visual language of MediVoice (teal `#0d9488`, slate surfaces, glassmorphism headers, elevated cards, and subtle glow accents) while strictly enforcing MediVoice clean-code standards (thin orchestrators, custom hooks, single component per file, no raw logic in JSX).

## 2. Visual System (MediVoice Standard)
- **Palette**:
  - Primary Teal: `#0d9488` (Teal 600), `#0f766e` (Teal 700), `#14b8a6` (Teal 500)
  - Surfaces: `bg-slate-50 dark:bg-slate-950`
  - Cards: `bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.06)]`
  - Tints & Glows: `bg-[#0d9488]/5`, `border-[#0d9488]/20`, `shadow-[0_4px_14px_-3px_rgba(13,148,136,0.35)]`
  - Focus Ring: `focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20`
- **Glassmorphism**:
  - `bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80`
- **Typography & Details**:
  - Rounded corners: `rounded-2xl`, `rounded-xl`
  - Crisp metadata badges and KPI metric tiles.

## 3. Scope of Upgrades
1. **Home Page (`app/page.tsx`)**:
   - Modern MediVoice Studio Dashboard layout with ambient gradient glow.
   - Status badge, capabilities pills (pgvector, Groq, HuggingFace).
   - Elevated interactive feature cards with hover animations.
2. **RAG Chat (`components/rag-chat/`)**:
   - Glassmorphism header with active route pill and top-K selector.
   - User message bubble with teal-gradient and glow shadow.
   - Assistant card with refined markdown typography.
   - Sources drawer with glowing match badges and clean code chunk styling.
   - Floating input dock with smooth focus glow.
3. **Document Ingestion (`components/upload/`)**:
   - Matching glassmorphism header.
   - Dropzone with teal dashed border and drag animation.
   - File preview card and KPI metrics summary card.
4. **Semantic Search (`components/semantic-search/`)**:
   - Harmonized slate/teal styling and similarity score bars.
5. **Formatted Chunk (`components/FormattedChunk.tsx`)**:
   - Polished typography, code block styling, and copy button.

## 4. Verification Plan
- `npm run lint`: 0 errors or warnings.
- `npx tsc --noEmit`: 0 type errors.
- `npm run build`: All 16 routes build successfully.
