export interface DraftContent {
  headline: string;
  description: string;
  callToAction: string;
}

export interface ReviewContent {
  score: number;
  strengths: string[];
  feedback: string[];
}

export interface AgentUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUSD: number;
}

export interface TokenUsageMap {
  writer?: AgentUsage;
  review?: AgentUsage;
}

export interface TokenUsageBreakdown {
  agents?: TokenUsageMap;
  pipelineTotal?: AgentUsage;
}

export interface HumanReviewData {
  message?: string;
  draft?: DraftContent | null;
  review?: ReviewContent | null;
  bestScore?: number;
  tokenUsage?: TokenUsageMap;
  options?: string[];
}

export interface EvaluationData {
  bestScore?: number;
  iterations?: number;
  decision?: string;
  reason?: string;
}

export interface IterationRecord {
  iteration: number;
  draft: DraftContent;
  review: ReviewContent;
}

export interface HumanDecision {
  action: "approve" | "improve";
  feedback: string | null;
}

export interface PipelineApiResponse {
  success: boolean;
  status?: "awaiting_human" | "completed";
  threadId?: string;
  humanReview?: HumanReviewData;
  draft?: DraftContent | null;
  review?: ReviewContent | null;
  evaluation?: EvaluationData;
  history?: IterationRecord[];
  humanDecision?: HumanDecision;
  tokenUsage?: TokenUsageBreakdown;
  error?: string;
}

export type AgenticStatus =
  | "idle"
  | "starting"
  | "awaiting_human"
  | "resuming"
  | "completed"
  | "error";
