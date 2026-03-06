import { z } from "zod";

/**
 * --------------------------------
 * CREATE NOTE
 * --------------------------------
 */

export const createGuestNoteSchema = z.object({
  guest_id: z.string().uuid(),

  title: z.string().min(1, "Title is required").max(200, "Title too long"),

  description: z
    .string()
    .max(2000, "Description too long")
    .optional()
    .nullable(),
});

/**
 * --------------------------------
 * UPDATE NOTE
 * --------------------------------
 */

export const updateGuestNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200).optional(),

  description: z.string().max(2000).optional().nullable(),
});

/**
 * --------------------------------
 * NOTE PARAM
 * --------------------------------
 */

export const guestNoteParamSchema = z.object({
  id: z.string().uuid("Invalid note id"),
});
