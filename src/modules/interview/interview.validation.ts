import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

export const createInterviewSchema = z.object({
  guest_id: z.string().uuid("Invalid guest ID"),
  host_id: z.string().uuid("Invalid host ID"),
  studio_id: z.string().uuid("Invalid studio ID"),

  interview_date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid interview date",
    }),

  start_time: z.string().regex(timeRegex, "Invalid start time format"),

  end_time: z.string().regex(timeRegex, "Invalid end time format").optional(),

  interview_status: z.enum(["scheduled", "completed", "cancelled"]).optional(),

  live_status: z.enum(["live", "recorded", "not_live"]).optional(),

  google_drive_link: z.string().url().optional().nullable(),
  youtube_link: z.string().url().optional().nullable(),
});

export const updateInterviewSchema = createInterviewSchema.partial();
