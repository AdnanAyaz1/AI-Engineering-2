
import { NextResponse } from "next/server";
import { embeddings } from "@/lib/rag/embeddings";

export async function GET() {
  try {
    const vector = await embeddings.embedQuery(
      "A doctor appointment booking application"
    );

    console.log("vectotr",vector)

    return NextResponse.json({
      success: true,
      dimensions: vector.length,
      sample: vector.slice(0, 10),
    });
  } catch (error) {
    console.error("Embedding error:", error);

    return NextResponse.json(
      { error: "Failed to generate embedding" },
      { status: 500 }
    );
  }
}
