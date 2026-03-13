import { z } from "zod";
import { InterviewStatus } from "../../constants/interviewStatus";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

export const createInterviewSchema = z.object({
  guest_id: z.string().uuid("Invalid guest ID"),
  host_id: z.string().uuid("Invalid host ID").optional(),
  studio_id: z.string().uuid("Invalid studio ID"),

  episode: z.coerce.number().int().min(1),

  interview_date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid interview date",
    })
    .optional()
    .nullable(),

  start_time: z
    .string()
    .regex(timeRegex, "Invalid start time format")
    .optional()
    .nullable(),

  end_time: z
    .string()
    .regex(timeRegex, "Invalid end time format")
    .optional()
    .nullable(),

  interview_status: z
    .enum(["scheduled", "completed", "cancelled", "postponed"])
    .optional(),

  live_status: z.enum(["live", "recorded", "not_live"]).optional(),

  status: z.nativeEnum(InterviewStatus).optional(),

  priority: z.number().int().min(0).optional(),

  google_drive_link: z.string().url().optional().nullable(),
  youtube_link: z.string().url().optional().nullable(),
  youtube_title: z.string().optional().nullable(),
});

export const updateInterviewSchema = z.object({
  guest_id: z.string().uuid("Invalid guest ID").optional(),
  host_id: z.string().uuid("Invalid host ID").optional(),
  studio_id: z.string().uuid("Invalid studio ID").optional(),

  episode: z.coerce.number().int().min(1).optional(),

  interview_date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid interview date",
    })
    .optional()
    .nullable(),

  start_time: z
    .string()
    .regex(timeRegex, "Invalid start time format")
    .optional()
    .nullable(),

  end_time: z
    .string()
    .regex(timeRegex, "Invalid end time format")
    .optional()
    .nullable(),

  interview_status: z
    .enum(["scheduled", "completed", "cancelled", "postponed"])
    .optional(),

  live_status: z.enum(["live", "recorded", "not_live"]).optional(),

  status: z.nativeEnum(InterviewStatus).optional(),

  priority: z.number().int().min(0).optional(),

  google_drive_link: z.string().url().optional().nullable(),
  youtube_link: z.string().url().optional().nullable(),
  youtube_title: z.string().optional().nullable(),
});
