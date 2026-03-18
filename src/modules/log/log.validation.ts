import { z } from "zod";

const uuidSchema = z.string().uuid("Invalid UUID");

export const createLogSchema = z.object({
  event_type: z.string().min(1),
  recipient_email: z.string().email(),
  status: z.enum(["pending", "sent", "failed"]),

  error_message: z.any().optional(),
  sent_at: z.date().optional(),

  created_by: uuidSchema.optional(),
  updated_by: uuidSchema.optional(),
});

export const updateLogSchema = z.object({
  status: z.enum(["pending", "sent", "failed"]).optional(),
  error_message: z.any().optional(),
  sent_at: z.date().optional(),
});
