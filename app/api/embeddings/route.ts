
import { NextResponse } from "next/server";
import { embedTexts } from "@/lib/rag/embeddings";

export async function GET() {
  try {
    const [vector] = await embedTexts([
      "A doctor appointment booking application",
    ]);

    return NextResponse.json({
      success: true,
      dimensions: vector?.length ?? 0,
      sample: vector?.slice(0, 10) ?? [],
    });
  } catch (error) {
    console.error("Embedding error:", error);

    return NextResponse.json(
      { error: "Failed to generate embedding" },
      { status: 500 }
    );
  }
}
