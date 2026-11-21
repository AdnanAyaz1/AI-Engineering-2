export interface ChatMetadata {
  tokens?: {
    input: number;
    output: number;
    reasoning?: number;
    total: number;
  };
  costUsd?: number;
}
