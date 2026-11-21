
import { documents } from "./documents";
import { generateEmbedding } from "./embeddings";
import { cosineSimilarity } from "./similarity";

interface IndexedDocument {
  id: number;
  title: string;
  content: string;
  embedding: number[];
}

let indexedDocumentsPromise: Promise<IndexedDocument[]> | null = null;

async function getIndexedDocuments(): Promise<IndexedDocument[]> {
  if (!indexedDocumentsPromise) {
    indexedDocumentsPromise = Promise.all(
      documents.map(async (doc) => {
        const embedding = await generateEmbedding(
          `${doc.title}. ${doc.content}`
        );

        return {
          ...doc,
          embedding,
        };
      })
    ).catch((error) => {
      // Allow a retry if model initialization or indexing fails
      indexedDocumentsPromise = null;
      throw error;
    });
  }

  return indexedDocumentsPromise;
}

export async function semanticSearch(
  query: string,
  topK: number = 3
) {
  if (!query.trim()) {
    throw new Error("Search query cannot be empty");
  }

  // Generate embedding for the user's query
  const queryEmbedding = await generateEmbedding(query);

  // Get documents with their cached embeddings
  const indexedDocuments = await getIndexedDocuments();

  // Calculate similarity against every document
  const results = indexedDocuments.map((doc) => {
    const score = cosineSimilarity(
      queryEmbedding,
      doc.embedding
    );

    return {
      id: doc.id,
      title: doc.title,
      content: doc.content,
      score,
    };
  });

  // Highest similarity first
  results.sort((a, b) => b.score - a.score);

  // Return the top matching documents
  return results.slice(0, topK);
}
