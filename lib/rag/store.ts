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

const BATCH_SIZE = 25;

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

  // 2. Create the document record
  const document = await prisma.document.create({
    data: {
      fileName,
    },
  });

  try {
    // 3. Prepare chunk rows with pgvector
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

    // 4. Batch insert all chunks in atomic batches
    for (let i = 0; i < chunkRows.length; i += BATCH_SIZE) {
      const batch = chunkRows.slice(i, i + BATCH_SIZE);
      await prisma.$executeRaw(Prisma.sql`
        INSERT INTO "DocumentChunk"
          ("id", "content", "chunkIndex", "documentId", "createdAt", "embedding")
        VALUES ${Prisma.join(batch)}
      `);
    }

    return {
      documentId: document.id,
      totalChunks: chunks.length,
    };
  } catch (err) {
    // Clean up document on failure so no partial/orphaned record remains
    await prisma.document.delete({ where: { id: document.id } }).catch(() => {});
    throw err;
  }
}
