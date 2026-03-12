import { z } from "zod";

export const notesSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
});

export const createGuestSchema = z.object({
  full_name: z.string().min(1, "Guest name is required"),
  designation: z.string().optional().nullable(),
  slug: z.string().min(1, "Slug is required"),
  bio: z.string().optional().nullable(),

  social_media: z.any().optional().nullable(),
  notes: z.array(notesSchema).optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),

  status: z
    .enum(["not_started", "contacted", "follow_up", "confirmed"])
    .optional(),

  record: z.coerce.boolean().optional(),
  rejected: z.coerce.boolean().optional().default(false),

  tag_id: z.string().uuid().optional().nullable(),

  referred_by: z.string().uuid().optional().nullable(),
  host_id: z.string().uuid().optional().nullable(),
});

export const updateGuestSchema = createGuestSchema
  .extend({
    host_id: z.string().uuid().optional().nullable(),
  })
  .partial();
