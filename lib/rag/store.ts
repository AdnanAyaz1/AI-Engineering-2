
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";

type EmbeddedChunk = {
  content: string;
  metadata: {
    fileName: string;
    chunkIndex: number;
    totalChunks: number;
  };
  embedding: number[];
};



export async function storeDocument(
  fileName: string,
  chunks: EmbeddedChunk[],
) {
  if (!chunks.length) {
    throw new Error("No chunks to store");
  }

  // 1. Validate all embeddings before database insertion
  for (const chunk of chunks) {
    if (!chunk.embedding || chunk.embedding.length !== 768) {
      throw new Error(
        `Invalid embedding at chunk ${chunk.metadata.chunkIndex}: expected 768 dimensions, received ${chunk.embedding?.length ?? 0}`,
      );
    }
  }

  // 2. Debug embedding dimensions
  console.log("Total chunks:", chunks.length);
  console.log("Embedding dimensions:", [
    ...new Set(chunks.map((chunk) => chunk.embedding.length)),
  ]);
  console.log("First embedding:", chunks[0].embedding.slice(0, 5));

  // 3. Prepare parameterized SQL values
  const rows = chunks.map((chunk) => {
    const vector = `[${chunk.embedding.join(",")}]`;

    return Prisma.sql`(
      ${randomUUID()},
      ${chunk.content},
      ${chunk.metadata.chunkIndex},
      ${null as string | null},
      NOW(),
      ${vector}::vector
    )`;
  });

  // 4. Create document and insert chunks atomically
  return prisma.$transaction(async (tx) => {
    const document = await tx.document.create({
      data: {
        fileName,
      },
    });

    // Insert chunks with the newly created document ID
    const chunkRows = chunks.map((chunk) => {
      const vector = `[${chunk.embedding.join(",")}]`;

      return Prisma.sql`(
        ${randomUUID()},
        ${chunk.content},
        ${chunk.metadata.chunkIndex},
        ${document.id},
        NOW(),
        ${vector}::vector
      )`;
    });

    await tx.$executeRaw(Prisma.sql`
      INSERT INTO "DocumentChunk"
        ("id", "content", "chunkIndex", "documentId", "createdAt", "embedding")
      VALUES ${Prisma.join(chunkRows)}
    `);

    return {
      documentId: document.id,
      totalChunks: chunks.length,
    };
  });
}
