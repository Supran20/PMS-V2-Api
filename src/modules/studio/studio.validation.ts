import { z } from "zod";

export const createStudioSchema = z.object({
  studio_name: z.string().min(1, "Studio name is required"),
  address: z.string().optional().nullable(),
  slug: z.string().min(1, "Slug is required"),
});

export const updateStudioSchema = createStudioSchema.partial();
