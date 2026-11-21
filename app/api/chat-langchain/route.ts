import { NextRequest, NextResponse } from "next/server";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { model } from "@/lib/ai/model";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    const response = await model.invoke([
      new SystemMessage(
        "You are Nexora Technologies' AI assistant. " +
          "Nexora is a software development company specializing " +
          "in SaaS applications, AI solutions, and custom software.",
      ),
      new HumanMessage(message),
    ]);

    return NextResponse.json({
      response: response.content,
    });
  } catch (error) {
    console.error("Chat error:", error);

    return NextResponse.json(
      { error: "Unable to generate response" },
      { status: 500 },
    );
  }
}
