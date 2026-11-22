import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { writerGraph } from "@/lib/agentic-ai/graph";

export async function POST(req: Request) {
  try {
    const { task } = await req.json();

    if (!task || typeof task !== "string" || !task.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid task is required.",
        },
        { status: 400 },
      );
    }

    const threadId = randomUUID();

    const result = await writerGraph.invoke(
      {
        task: task.trim(),
      },
      {
        configurable: {
          thread_id: threadId,
        },
      },
    );

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

    // Workflow paused and is waiting for human input.
    const interruptData = (
      result as typeof result & { __interrupt__?: { value: unknown }[] }
    ).__interrupt__?.[0]?.value;

    if (interruptData) {
      return NextResponse.json({
        success: true,
        status: "awaiting_human",
        threadId,
        humanReview: interruptData,
        history: result.history,
        tokenUsage: {
          agents: usage,
          pipelineTotal,
        },
      });
    }

    return NextResponse.json({
      success: true,
      status: "completed",

      draft: result.bestDraft,
      review: result.bestReview,

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
