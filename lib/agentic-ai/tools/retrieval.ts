import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { retrieveChunks } from "@/lib/rag/retrieval";

export const retrieveCompanyData = tool(
  async ({ query }) => {
    const chunks = await retrieveChunks(query, 3);

    if (!chunks.length) {
      return "No relevant information was found in the knowledge base.";
    }

    return chunks.map((chunk) => ({
      source: chunk.documentId,
      chunkIndex: chunk.chunkIndex,
      similarity: chunk.similarity,
      content: chunk.content,
    }));
  },
  {
    name: "retrieve_company_data",
    description: `
      Search the knowledge base for factual information,
      statistics, numerical figures, company information,
      dates, and supporting evidence.

      Use this tool when human feedback requires factual
      information that is not available in the existing draft
      or conversation context.

      Never invent missing figures. If the knowledge base
      does not contain the requested information, explain
      that the information could not be verified.
    `,
    schema: z.object({
      query: z
        .string()
        .min(3)
        .describe("A specific search query describing the information needed."),
    }),
  },
);
