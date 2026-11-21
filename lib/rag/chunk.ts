import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

export async function chunkText(text: string, fileName: string) {
  if (!text.trim()) {
    return [];
  }

  const chunks = await splitter.splitText(text);

  return chunks.map((content, index) => ({
    content,
    metadata: {
      fileName,
      chunkIndex: index,
      totalChunks: chunks.length,
    },
  }));
}