import { z } from "zod";

export const writerSchema = z.object({
  headline: z.string().describe("A compelling headline for the landing page"),

  description: z
    .string()
    .describe("A supporting description explaining the company's value"),

  callToAction: z
    .string()
    .describe("A clear and action-oriented call to action"),
});

export type WriterOutput = z.infer<typeof writerSchema>;
