import { z } from "zod";

export const createGuestSchema = z.object({
  full_name: z.string().min(1, "Guest name is required"),
  designation: z.string().optional().nullable(),
  slug: z.string().min(1, "Slug is required"),
  bio: z.string().optional().nullable(),

  social_media: z.any().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  tag_id: z.string().uuid().optional().nullable(),

  referred_by: z.string().uuid().optional().nullable(),
});

export const updateGuestSchema = createGuestSchema.partial();
