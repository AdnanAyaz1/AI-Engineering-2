export interface SentimentResult {
  success: boolean;
  text: string;
  sentiment: string;
  confidence: number;
  confidencePercentage: number;
}
