import { z } from "zod";

export const createDocumentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  fileUrl: z.string().url(),
  fileType: z.string(),
  fileSize: z.number().int().positive(),
  tags: z.array(z.string()).default([]),
  workItemId: z.string().optional().nullable(),
});

export const updateDocumentSchema = createDocumentSchema.partial();

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
