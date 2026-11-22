
import { NextResponse } from "next/server";
import { writerGraph } from "@/lib/agentic-ai/graph";

export async function POST(req: Request) {
  try {
    const { task } = await req.json();

    const result = await writerGraph.invoke({
      task,
      draft: "",
      score: 0,
      feedback: [],
      strengths: [],
      iteration: 0,
    });

    return NextResponse.json({
      success: true,
      draft: result.draft,
      evaluation: {
        score: result.score,
        feedback: result.feedback,
        strengths: result.strengths,
      },
    });
  } catch (error) {
    console.error("Agent workflow error:", error);

    return NextResponse.json(
      { success: false, error: "Workflow execution failed." },
      { status: 500 }
    );
  }
}
