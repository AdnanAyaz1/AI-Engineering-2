import { NextResponse } from "next/server";
import { writerGraph } from "@/lib/agentic-ai/graph";

export async function POST(req: Request) {
  try {
    const { task } = await req.json();

    if (!task || typeof task !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "A valid task is required.",
        },
        { status: 400 },
      );
    }

    const result = await writerGraph.invoke({
      task,
    });

    const usage = result.tokenUsage;

    const pipelineTotal = {
      inputTokens:
        (usage.writer?.inputTokens ?? 0) + (usage.review?.inputTokens ?? 0),

      outputTokens:
        (usage.writer?.outputTokens ?? 0) + (usage.review?.outputTokens ?? 0),

      totalTokens:
        (usage.writer?.totalTokens ?? 0) + (usage.review?.totalTokens ?? 0),

      costUSD: (usage.writer?.costUSD ?? 0) + (usage.review?.costUSD ?? 0),
    };

    return NextResponse.json({
      success: true,

      draft: result.bestDraft,
      review: result.review,

      evaluation: {
        bestScore: result.bestScore,
        iterations: result.iteration,
        decision: result.decision,
        reason: result.decisionReason,
      },

      history: result.history,

      tokenUsage: {
        agents: usage,
        pipelineTotal,
      },
    });
  } catch (error) {
    console.error("Workflow execution failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Workflow execution failed.",
      },
      { status: 500 },
    );
  }
}
