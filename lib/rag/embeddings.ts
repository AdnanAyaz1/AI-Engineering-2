import {
  pipeline,
  type FeatureExtractionPipeline,
} from "@huggingface/transformers";

const model = "onnx-community/all-MiniLM-L6-v2-ONNX";

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

async function getExtractor(): Promise<FeatureExtractionPipeline> {
  if (!extractorPromise) {
    extractorPromise = pipeline(
      "feature-extraction",
      model,
    ) as Promise<FeatureExtractionPipeline>;
  }

  return extractorPromise;
}

export async function embedTexts(texts: string[]) {
  if (!texts.length) return [];

  const extractor = await getExtractor();

  const output = await extractor(texts, {
    pooling: "mean",
    normalize: true,
  });

  return output.tolist() as number[][];
}
