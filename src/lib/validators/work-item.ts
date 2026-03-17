import { z } from "zod";

export const createWorkItemSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  type: z.enum(["CODE_PROJECT", "NOTE", "TASK", "DOCUMENT"]),
  status: z
    .enum(["IN_PROGRESS", "COMPLETE", "ARCHIVED", "IDEA"])
    .default("IN_PROGRESS"),
  visibility: z.enum(["PRIVATE", "PORTFOLIO"]).default("PRIVATE"),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateWorkItemSchema = createWorkItemSchema.partial();

export type CreateWorkItemInput = z.infer<typeof createWorkItemSchema>;
export type UpdateWorkItemInput = z.infer<typeof updateWorkItemSchema>;
