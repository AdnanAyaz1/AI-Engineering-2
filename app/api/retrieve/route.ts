import { NextRequest, NextResponse } from "next/server";
import { retrieveChunks } from "@/lib/rag/retrieval";
import { generateAnswer } from "@/lib/rag/generate";

export async function POST(req: NextRequest) {
  try {
    // 1. Read request body
    const body = await req.json();
    const { question, topK = 5 } = body;

    // 2. Validate question
    if (typeof question !== "string" || !question.trim()) {
      return NextResponse.json(
        { error: "A valid question is required" },
        { status: 400 },
      );
    }

    // 3. Validate topK
    if (!Number.isInteger(topK) || topK < 1 || topK > 20) {
      return NextResponse.json(
        { error: "topK must be between 1 and 20" },
        { status: 400 },
      );
    }

    // 4. Retrieve relevant chunks
    const chunks = await retrieveChunks(question, topK);

    // 5. Generate answer using Groq
    const result = await generateAnswer(question, chunks);

    // 6. Return answer, sources, token usage and cost
    return NextResponse.json({
      success: true,
      question,

      answer: result.answer,

      sources: chunks,
      totalResults: chunks.length,

      usage: result.usage,
      cost: result.cost,
    });
  } catch (error) {
    console.error("RAG chat error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to process RAG request",
      },
      { status: 500 },
    );
  }
}
