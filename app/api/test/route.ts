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
      maxIterations: 2,
      bestDraft: "",
      bestScore: 0,
    });

    return NextResponse.json({
      success: true,
      draft: result.bestDraft,
      evaluation: {
        score: result.bestScore,
        feedback: result.feedback,
        strengths: result.strengths,
      },
      iterations: result.iteration,
    });
  } catch (error) {
    console.error("Agent workflow error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Workflow execution failed.",
      },
      { status: 500 },
    );
  }
}
