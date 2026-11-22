import { NextRequest, NextResponse } from "next/server";
import { HumanMessage } from "@langchain/core/messages";
import { chatGraph } from "@/lib/ai/chat-graph";

export async function POST(req: NextRequest) {
  try {
    const { message, threadId } = await req.json();

    if (
      typeof message !== "string" ||
      !message.trim() ||
      typeof threadId !== "string" ||
      !threadId.trim()
    ) {
      return NextResponse.json(
        { error: "Message and threadId are required" },
        { status: 400 },
      );
    }

    const result = await chatGraph.invoke(
      {
        messages: [new HumanMessage(message)],
      },
      {
        configurable: {
          thread_id: threadId,
        },
      },
    );

    const lastMessage = result.messages[result.messages.length - 1];

    return NextResponse.json({
      success: true,
      response: lastMessage.content,
      threadId,
    });
  } catch (error) {
    console.error("Chat error:", error);

    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 },
    );
  }
}
