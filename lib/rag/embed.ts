
import { embedTexts } from "./embeddings";

type DocumentChunk = {
  content: string;
  metadata: {
    fileName: string;
    chunkIndex: number;
    totalChunks: number;
  };
};

export async function embedChunks(chunks: DocumentChunk[]) {
  if (!chunks.length) return [];

  const texts = chunks.map((chunk) => chunk.content);

  const vectors = await embedTexts(texts);

  return chunks.map((chunk, index) => ({
    ...chunk,
    embedding: vectors[index],
  }));
}
