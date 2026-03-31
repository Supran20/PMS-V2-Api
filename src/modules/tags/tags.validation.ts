import { z } from "zod";

export const createTagSchema = z.object({
  tag_name: z.string().min(1, "Tag name is required"),
  slug: z.string().optional(),
});

export const updateTagSchema = z.object({
  tag_name: z.string().optional(),
  slug: z.string().optional(),
});
