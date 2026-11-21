
import { NextResponse } from "next/server";
import { semanticSearch } from "@/lib/search";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { query, topK = 3 } = body;

    // Validate query
    if (typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { error: "A valid search query is required" },
        { status: 400 }
      );
    }

    // Validate and limit topK
    const limit = Math.min(
      10,
      Math.max(1, Number.isInteger(topK) ? topK : 3)
    );

    // Perform semantic search
    const results = await semanticSearch(
      query.trim(),
      limit
    );

    return NextResponse.json({
      success: true,
      query,
      totalResults: results.length,
      results,
    });

  } catch (error) {
    console.error("Semantic search error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to perform semantic search",
      },
      { status: 500 }
    );
  }
}
