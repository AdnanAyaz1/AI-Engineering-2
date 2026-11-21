
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

  // 1. Validate embeddings
  for (const chunk of chunks) {
    if (!chunk.embedding || chunk.embedding.length !== 384) {
      throw new Error(
        `Invalid embedding at chunk ${chunk.metadata.chunkIndex}: expected 384 dimensions, received ${chunk.embedding?.length ?? 0}`,
      );
    }
  }

  // 2. Prepare SQL values
  return prisma.$transaction(async (tx) => {
    const document = await tx.document.create({
      data: {
        fileName,
      },
    });

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
