import z from "zod";

export const deciderSchema = z.object({
  action: z.enum(["stop", "improve"]),
  reason: z.string(),
});
