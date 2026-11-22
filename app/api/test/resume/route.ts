import { NextResponse } from "next/server";
import { Command } from "@langchain/langgraph";
import { writerGraph } from "@/lib/agentic-ai/graph";

export async function POST(req: Request) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON request body.",
        },
        { status: 400 },
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: "Request body must be a JSON object.",
        },
        { status: 400 },
      );
    }

    const { threadId, action, feedback } = body;

    // Validate thread ID
    if (!threadId || typeof threadId !== "string" || !threadId.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid threadId is required.",
        },
        { status: 400 },
      );
    }

    const trimmedThreadId = threadId.trim();

    // Validate human action
    if (action !== "approve" && action !== "improve") {
      return NextResponse.json(
        {
          success: false,
          error: "Action must be either approve or improve.",
        },
        { status: 400 },
      );
    }

    // Feedback is required when requesting improvements
    if (
      action === "improve" &&
      (typeof feedback !== "string" || !feedback.trim())
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Feedback is required when requesting improvements.",
        },
        { status: 400 },
      );
    }

    const config = {
      configurable: {
        thread_id: trimmedThreadId,
      },
    };

    // Verify thread exists and is actively awaiting human review
    const snapshot = await writerGraph.getState(config);
    const hasPendingInterrupt = snapshot.tasks?.some(
      (t) => (t.interrupts?.length ?? 0) > 0,
    );

    if (!hasPendingInterrupt) {
      return NextResponse.json(
        {
          success: false,
          error: "Workflow thread not found or is not currently awaiting human review.",
        },
        { status: 409 },
      );
    }

    // Resume the existing workflow
    const result = await writerGraph.invoke(
      new Command({
        resume: {
          action,
          feedback: action === "improve" ? (feedback as string).trim() : undefined,
        },
      }),
      config,
    );

    const usage = result.tokenUsage;

    const pipelineTotal = {
      inputTokens:
        (usage?.writer?.inputTokens ?? 0) +
        (usage?.review?.inputTokens ?? 0),

      outputTokens:
        (usage?.writer?.outputTokens ?? 0) +
        (usage?.review?.outputTokens ?? 0),

      totalTokens:
        (usage?.writer?.totalTokens ?? 0) +
        (usage?.review?.totalTokens ?? 0),

      costUSD:
        (usage?.writer?.costUSD ?? 0) +
        (usage?.review?.costUSD ?? 0),
    };

    // Workflow interrupted again
    const interruption = (
      result as typeof result & { __interrupt__?: { value: unknown }[] }
    ).__interrupt__?.[0];

    if (interruption) {
      return NextResponse.json({
        success: true,
        status: "awaiting_human",
        threadId: trimmedThreadId,
        humanReview: interruption.value,
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

      humanDecision: {
        action,
        feedback: action === "improve" ? (feedback as string).trim() : null,
      },

      tokenUsage: {
        agents: usage,
        pipelineTotal,
      },
    });
  } catch (error) {
    console.error("Workflow resume failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to resume workflow.",
      },
      { status: 500 },
    );
  }
}
