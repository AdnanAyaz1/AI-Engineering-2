import { z } from "zod";

export const assistantResponseSchema = z.object({
  category: z.enum([
    "services",
    "pricing",
    "technical",
    "consultation",
    "general",
  ]),

  isLead: z.boolean(),

  requiresConsultation: z.boolean(),

  response: z.string(),
});
