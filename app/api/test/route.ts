import { NextResponse } from "next/server";
import { writerGraph } from "@/lib/agentic-ai/graph";

export async function POST(req: Request) {
  const { task } = await req.json();

  const result = await writerGraph.invoke({
    task,
    draft: "",
    score: 0,
    feedback: "",
    iteration: 0,
  });

  return NextResponse.json({
    success: true,
    draft: result.draft,
  });
}
