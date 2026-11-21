import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { embedTexts } from "./embeddings";


export type RetrievedChunk = {
  id: string;
  content: string;
  chunkIndex: number;
  documentId: string;
  similarity: number;
};

export async function retrieveChunks(
  question: string,
  topK: number = 5
): Promise<RetrievedChunk[]> {
  // 1. Validate input
  if (!question.trim()) {
    throw new Error("Question cannot be empty");
  }

  if (!Number.isInteger(topK) || topK < 1 || topK > 20) {
    throw new Error("topK must be an integer between 1 and 20");
  }

  // 2. Generate embedding for the user's question
  const [queryEmbedding] = await embedTexts([question]);

  if (!queryEmbedding || queryEmbedding.length !== 384) {
    throw new Error("Invalid query embedding: expected 384 dimensions");
  }

  // 3. Convert embedding array into pgvector format
  const vector = `[${queryEmbedding.join(",")}]`;

  // 4. Find the most similar document chunks
  const chunks = await prisma.$queryRaw<RetrievedChunk[]>(
    Prisma.sql`
      SELECT
        "id",
        "content",
        "chunkIndex",
        "documentId",
        1 - ("embedding" <=> ${vector}::vector) AS "similarity"
      FROM "DocumentChunk"
      WHERE "embedding" IS NOT NULL
      ORDER BY "embedding" <=> ${vector}::vector ASC
      LIMIT ${topK}
    `
  );

  // 5. Return matching chunks
  return chunks;
}