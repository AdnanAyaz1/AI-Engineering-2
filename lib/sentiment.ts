
import { pipeline } from "@huggingface/transformers";

// Initialize once and reuse across requests
const classifierPromise = pipeline(
  "sentiment-analysis",
  "Xenova/distilbert-base-uncased-finetuned-sst-2-english"
);

export async function analyzeSentiment(text: string) {
  const classifier = await classifierPromise;

  const results = await classifier(text);

  const prediction = results[0];

  return {
    label: prediction.label,
    confidence: prediction.score,
  };
}
