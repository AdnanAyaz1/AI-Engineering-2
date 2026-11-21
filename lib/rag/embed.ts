import PQueue from "p-queue";
import { embeddings } from "./embeddings";

type DocumentChunk = {
  content: string;
  metadata: {
    fileName: string;
    chunkIndex: number;
    totalChunks: number;
  };
};

const queue = new PQueue({
  concurrency: 10,
  intervalCap: 90,
  interval: 60_000,
});

export async function embedChunks(chunks: DocumentChunk[]) {
  if (!chunks.length) return [];

  const vectors = await Promise.all(
    chunks.map((chunk) =>
      queue.add(() => embeddings.embedQuery(chunk.content)),
    ),
  );

  

  return chunks.map((chunk, index) => ({
    ...chunk,
    embedding: vectors[index],
  }));
}
