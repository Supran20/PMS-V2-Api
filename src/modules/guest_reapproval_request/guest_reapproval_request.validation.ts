import { z } from "zod";

export const createGuestReapprovalRequestSchema = z.object({
  guest_id: z.string().uuid(),

  proposed_host_id: z.string().uuid().optional().nullable(),

  interview_id: z.string().uuid().optional().nullable(),

  trigger_source: z.enum(["duplicate_guest_attempt", "repeat_booking"]),
});

export const reviewGuestReapprovalRequestSchema = z.object({
  review_note: z.string().optional().nullable(),
});

export const updateGuestReapprovalRequestSchema =
  createGuestReapprovalRequestSchema
    .extend({
      status: z.enum(["pending", "approved", "rejected"]).optional(),

      reviewed_by: z.string().uuid().optional().nullable(),

      reviewed_at: z.coerce.date().optional().nullable(),

      review_note: z.string().optional().nullable(),
    })
    .partial();
