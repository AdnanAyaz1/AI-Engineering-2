# Chapter 10: Document Ingestion, Embeddings, and Vector Databases

## 10.1 Multi-Modal Document Parsing: Layout Analysis, Table Reconstruction, and Text Extraction Pitfalls

The foundational bottleneck of any enterprise RAG pipeline is the document ingestion layer. While engineering teams spend significant resources optimizing embedding models and LLM prompts, **retrieval quality is strictly bounded by the fidelity of document parsing.** If text extraction yields scrambled words, missing table columns, or merged multi-column paragraphs, the downstream embedding model will encode noise, resulting in inevitable hallucination.

### The Realities of PDF Parsing

Portable Document Format (PDF) was engineered as a digital printing canvas, not a semantic data format. Internally, a PDF contains arbitrary drawing commands (`BT /F1 12 Tf 72 712 Td (Hello) Tj ET`) indicating where glyphs should be placed on a 2D coordinate plane. PDFs do not natively preserve:
- Sentences, paragraphs, or word spaces.
- Tabular structures, rows, or headers.
- Reading order in multi-column layouts (e.g. academic papers or corporate annual reports).

### Critical Extraction Failure Modes

1. **Multi-Column Reading Order Collisions:** A naive coordinate extractor reading top-to-bottom across the entire page geometry merges Column 1 Line 1 with Column 2 Line 1, completely scrambling narrative syntax.
2. **Table Flattening:** A financial balance sheet with 8 columns flattened into raw text turns into an incomprehensible sequence of floating numbers stripped of header context.
3. **Hyphenation and Line-Wrap Splitting:** Words split across line breaks (`archi-` on line 1, `tecture` on line 2) must be de-hyphenated; otherwise, the vocabulary token becomes the invalid token `archi-`.
4. **Header and Footer Pollution:** Repeating running headers ("Confidential - Acme Internal") and page numbers ("Page 42 of 98") inject repetitive semantic noise into every single chunk if not stripped by layout heuristics.

---

## 10.2 Chunking Topologies: Recursive Character, Markdown-Aware, and Semantic Boundary Splitting

Chunking is the process of partitioning large documents into coherent, contextually contained text segments suitable for embedding model vectorization and LLM context window injection.

### Chunking Strategies Comparison Matrix

| Chunking Strategy | Splitting Logic | Pros | Cons / Vulnerabilities |
| :--- | :--- | :--- | :--- |
| **Fixed-Size Chunking** | Splits strictly every $N$ characters or tokens (e.g., 500 tokens). | Trivial implementation; predictable vector dimensions and token counts. | Severely fragments sentences and thoughts; splits words in half; destroys tables. |
| **Recursive Character Chunking** | Attempts split by hierarchical delimiters: `\n\n` (paragraphs), `\n` (lines), `. ` (sentences), ` ` (words). | Preserves semantic paragraph and sentence coherence; prevents fragmented syntax. | May produce irregular chunk sizes; requires careful overlap configuration. |
| **Markdown / Structure-Aware** | Splits based on structural heading tags (`#`, `##`, `###`), table boundaries, and code fences. | Preserves document hierarchy; keeps code blocks and tables intact as complete units. | Requires source documents to possess clean structural markup (e.g. Markdown or HTML). |
| **Semantic Boundary Splitting** | Computes embedding vectors for adjacent sliding sentences; splits when cosine distance shifts significantly. | Creates intellectually pure topic chunks based on thematic transitions. | Computationally expensive; requires $N$ embedding model calls per document prior to indexing. |

### Recursive Character Text Splitter Implementation

The following TypeScript implementation exemplifies recursive character splitting with configurable sliding-window overlap:

```typescript
export interface TextSplitterOptions {
  chunkSize: number;
  chunkOverlap: number;
  separators?: string[];
}

export class RecursiveCharacterTextSplitter {
  private readonly chunkSize: number;
  private readonly chunkOverlap: number;
  private readonly separators: string[];

  constructor(options: TextSplitterOptions) {
    this.chunkSize = options.chunkSize;
    this.chunkOverlap = options.chunkOverlap;
    this.separators = options.separators ?? ['\n\n', '\n', '. ', '! ', '? ', '; ', ' ', ''];
  }

  public splitText(text: string): string[] {
    return this.recursiveSplit(text, this.separators);
  }

  private recursiveSplit(text: string, separators: string[]): string[] {
    const finalChunks: string[] = [];
    let separator = separators[separators.length - 1];
    let newSeparators: string[] = [];

    // Find the highest-priority separator present in text
    for (let i = 0; i < separators.length; i++) {
      const s = separators[i];
      if (s === '' || text.includes(s)) {
        separator = s;
        newSeparators = separators.slice(i + 1);
        break;
      }
    }

    const splits = separator === '' ? Array.from(text) : text.split(separator);
    const goodSplits: string[] = [];

    for (const piece of splits) {
      if (piece.length < this.chunkSize) {
        goodSplits.push(piece);
      } else {
        if (goodSplits.length > 0) {
          finalChunks.push(...this.mergeSplits(goodSplits, separator));
          goodSplits.length = 0;
        }
        if (newSeparators.length === 0) {
          finalChunks.push(piece);
        } else {
          finalChunks.push(...this.recursiveSplit(piece, newSeparators));
        }
      }
    }

    if (goodSplits.length > 0) {
      finalChunks.push(...this.mergeSplits(goodSplits, separator));
    }

    return finalChunks;
  }

  private mergeSplits(splits: string[], separator: string): string[] {
    const docs: string[] = [];
    const currentDoc: string[] = [];
    let totalLength = 0;

    for (const split of splits) {
      const splitLength = split.length;
      if (totalLength + splitLength + (currentDoc.length > 0 ? separator.length : 0) > this.chunkSize) {
        if (currentDoc.length > 0) {
          const doc = currentDoc.join(separator);
          docs.push(doc);
          
          // Apply sliding window overlap
          while (
            totalLength > this.chunkOverlap ||
            (totalLength + splitLength + separator.length > this.chunkSize && totalLength > 0)
          ) {
            const popped = currentDoc.shift()!;
            totalLength -= popped.length + (currentDoc.length > 0 ? separator.length : 0);
          }
        }
      }
      currentDoc.push(split);
      totalLength += splitLength + (currentDoc.length > 1 ? separator.length : 0);
    }

    if (currentDoc.length > 0) {
      docs.push(currentDoc.join(separator));
    }

    return docs;
  }
}
```

> [!TIP]
> **Chunk Size Guidelines:** For technical engineering documentation containing code blocks and tables, optimal empirical chunk sizes range from **500 to 1,000 tokens** (approx. 2,000–4,000 characters) with a **10% to 15% sliding overlap** (e.g., 100 tokens). Overlaps smaller than 10% cause contextual dropouts at boundaries; overlaps larger than 25% waste storage and duplicate context in retrieval results.

---

## 10.3 Vector Embedding Models: Dimensionality Trade-offs, Normalization, and Similarity Metrics

An embedding model is a neural network (typically a transformer encoder such as BERT or dedicated modern architectures) that projects text strings into a continuous, high-dimensional vector space:

$$\vec{v} = f(\text{text}) \in \mathbb{R}^D$$

Where $D$ is the embedding dimensionality (e.g., 768, 1536, or 3072).

### Vector Similarity Metrics

The similarity between two normalized embedding vectors $\vec{u}$ and $\vec{v}$ is evaluated using geometric metrics:

1. **Cosine Similarity:** Measures the cosine of the angle between two vectors, invariant to vector magnitude:
   $$\cos(\theta) = \frac{\vec{u} \cdot \vec{v}}{\|\vec{u}\| \|\vec{v}\|} = \frac{\sum_{i=1}^D u_i v_i}{\sqrt{\sum_{i=1}^D u_i^2} \sqrt{\sum_{i=1}^D v_i^2}}$$
   - Cosine distance is defined as: $1 - \cos(\theta)$. Range: $[0, 2]$.
2. **Inner Product (Dot Product):** $\vec{u} \cdot \vec{v} = \sum_{i=1}^D u_i v_i$.
   - When vectors are **L2-normalized** ($\|\vec{u}\| = 1$), Cosine Similarity is mathematically identical to Dot Product, enabling ultra-fast hardware SIMD calculation.
3. **Euclidean Distance (L2 Distance):** $\|\vec{u} - \vec{v}\| = \sqrt{\sum_{i=1}^D (u_i - v_i)^2}$.

### Dimensionality Reduction (Matryoshka Embeddings)

Modern frontier models (e.g. OpenAI `text-embedding-3-large`, Google `text-embedding-004`) support **Matryoshka Representation Learning (MRL)**. MRL allows truncation of vectors from 3072 dimensions down to 1024 or 512 dimensions while retaining over 97% of semantic retrieval accuracy. Truncating vector dimensions reduces vector index RAM consumption and NVMe disk storage by up to 83%.

---

## 10.4 Approximate Nearest Neighbor (ANN) Indexing: IVFFlat vs. Hierarchical Navigable Small World (HNSW)

Exact nearest neighbor search requires a brute-force exhaustive scan ($O(N)$) calculating cosine distances across every vector in the database. When a corpus reaches 10,000,000 chunks, exhaustive search takes multiple seconds per query, violating interactive latency budgets.

**Approximate Nearest Neighbor (ANN)** algorithms trade off a fractional margin of recall (e.g. 98% recall instead of 100%) to achieve sub-10 millisecond query latency in $O(\log N)$ time.

### IVFFlat vs. HNSW Comparison

| Dimension | IVFFlat (Inverted File Flat) | HNSW (Hierarchical Navigable Small World) |
| :--- | :--- | :--- |
| **Internal Data Structure** | Voronoi cells clustering vector centroids using $K$-means. | Multi-layer graph hierarchy where nodes represent vectors and edges represent proximity. |
| **Build / Training Time** | Requires explicit training step; fast build time. | Slow build time; builds complex multi-layer graph structures incrementally. |
| **Query Latency** | Moderate (scans all vectors inside `probes` nearest Voronoi cells). | **Blazing fast** ($< 5\text{ms}$ at 10M vectors); logarithmic graph traversal. |
| **Memory Footprint** | Extremely low (stores raw vectors and cluster mappings). | High (requires 1.5x to 2x raw vector memory to store graph edge lists). |
| **Incremental Updates** | Poor; adding new data skews centroid accuracy, requiring full index re-training. | **Exceptional**; supports real-time concurrent vector inserts without full rebuilds. |

```
HNSW Multi-Layer Graph Structure:
Layer 2 (Expressway - Long-range jumps):
[ Node A ] ───────────────────────────────────────────────► [ Node Z ]
    │                                                           │
Layer 1 (Regional - Medium-range hops):                         │
[ Node A ] ──────────► [ Node M ] ────────────────────────► [ Node Z ]
    │                      │                                    │
Layer 0 (Local - Dense short-range nearest neighbors):          │
[ Node A ] ──► [ B ] ──► [ C ] ──► [ M ] ──► [ X ] ──► [ Y ] ──► [ Node Z ]
```

---

## 10.5 Vector Storage Evaluation: pgvector, Dedicated Engines, and Operational Footprint

Selecting a vector storage engine requires evaluating architectural complexity, tenancy boundaries, and backup operations:

```sql
-- Production Vector Storage using PostgreSQL pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Document Chunks Table with Vector Column
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  token_count INT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding vector(1536) NOT NULL, -- 1536-dimensional OpenAI / BGE embedding
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Build High-Performance HNSW Index on Cosine Distance
-- m = 16 (max connections per layer), ef_construction = 64 (search depth during build)
CREATE INDEX idx_document_chunks_embedding_hnsw 
ON document_chunks 
USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);

-- Cosine Distance Similarity Query with Metadata Filtering
-- <=> represents cosine distance operator in pgvector
SELECT 
  id, 
  document_id, 
  content, 
  1 - (embedding <=> $1) AS cosine_similarity
FROM document_chunks
WHERE metadata @> '{"tenant_id": "org_9921", "classification": "PUBLIC"}'
ORDER BY embedding <=> $1 ASC
LIMIT 5;
```

> [!NOTE]
> For organizations already operating PostgreSQL, **pgvector** is the recommended default choice: it eliminates the need to maintain, secure, and synchronize a separate third-party vector database cluster, allowing atomic transactional joins between relational business data and vector embeddings within a single ACID transaction [See Section 6.1].

---
