
import { analyzeSentiment } from "@/lib/sentiment";



export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = body.text;

    if (typeof text !== "string" || !text.trim()) {
      return Response.json(
        { error: "Please provide some text." },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return Response.json(
        { error: "Text cannot exceed 5000 characters." },
        { status: 400 }
      );
    }

    const result = await analyzeSentiment(text.trim());

    return Response.json({
      success: true,
      text,
      sentiment: result.label,
      confidence: result.confidence,
      confidencePercentage: Number(
        (result.confidence * 100).toFixed(2)
      ),
    });

  } catch (error) {
    console.error("Sentiment analysis error:", error);

    return Response.json(
      { error: "Failed to analyze sentiment." },
      { status: 500 }
    );
  }
}
