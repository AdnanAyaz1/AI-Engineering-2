import { NextRequest, NextResponse } from "next/server";
import { structuredModel } from "@/lib/ai/model";
import { companyAssistantPrompt } from "@/lib/ai/prompt";
import { companyDetails } from "@/constants/ai/systemPrompt";

// Compose prompt and model into one chain
const chatChain = companyAssistantPrompt.pipe(structuredModel);

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    const response = await chatChain.invoke({
      ...companyDetails,
      question: message,
    });

    return NextResponse.json({
      response: response,
    });
  } catch (error) {
    console.error("Chat error:", error);

    return NextResponse.json(
      { error: "Unable to generate response" },
      { status: 500 },
    );
  }
}
