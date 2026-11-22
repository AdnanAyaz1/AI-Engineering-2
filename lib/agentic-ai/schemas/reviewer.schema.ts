import { z } from "zod";

export const reviewerSchema = z.object({
  score: z
    .number()
    .min(0)
    .max(10)
    .describe("Overall content quality score from 0 to 10"),

  strengths: z
    .array(z.string())
    .describe("Genuine strengths identified in the content"),

  feedback: z
    .array(z.string())
    .describe("Actionable improvements required in the content"),
});
