import { z } from "zod";

export const createMediaSchema = z.object({
  media_name: z.string().min(1, "Media name is required"),

  tag_id: z.string().uuid().optional().nullable(),
});

export const updateMediaSchema = z.object({
  media_name: z.string().optional().nullable(),
  tag_id: z.string().uuid().optional().nullable(),
});
