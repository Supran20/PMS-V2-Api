import { z } from "zod";

const dateField = z.preprocess((value) => {
  if (value === "" || value === undefined) return undefined;
  return value;
}, z.coerce.date());

const booleanFromString = z.preprocess((val) => {
  if (val === "true") return true;
  if (val === "false") return false;
  return val;
}, z.boolean());

export const createUserSchema = z
  .object({
    full_name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
    status: z.enum(["active", "inactive"]).optional(),

    mobile_number: z
      .string()
      .regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number")
      .optional(),

    enable_otp_login: booleanFromString.optional(),
    otp_in_mail: booleanFromString.optional(),
    otp_in_sms: booleanFromString.optional(),

    visibility_start_date: dateField.optional(),
    visibility_end_date: dateField.optional(),

    role_name: z.enum(["Admin", "Host", "Staff"]),
  })
  .superRefine((data, ctx) => {
    const start = data.visibility_start_date;
    const end = data.visibility_end_date;

    if (data.role_name === "Admin" && (start || end)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["visibility_start_date"],
        message: "Visibility dates are not allowed for Admin users.",
      });
      return;
    }

    if ((start && !end) || (!start && end)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["visibility_start_date"],
        message:
          "Both visibility_start_date and visibility_end_date are required together.",
      });
    }

    if (start && end) {
      if (end < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["visibility_end_date"],
          message:
            "visibility_end_date must be greater than or equal to visibility_start_date.",
        });
      }

      if (end > new Date()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["visibility_end_date"],
          message: "visibility_end_date cannot be in the future.",
        });
      }
    }
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z
  .object({
    full_name: z.string().min(3).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    status: z.enum(["active", "inactive"]).optional(),

    mobile_number: z.string().optional(),
    enable_otp_login: booleanFromString.optional(),
    otp_in_mail: booleanFromString.optional(),
    otp_in_sms: booleanFromString.optional(),

    visibility_start_date: dateField.nullable().optional(),
    visibility_end_date: dateField.nullable().optional(),

    role_name: z.enum(["Admin", "Host", "Staff"]).optional(),
  })
  .superRefine((data, ctx) => {
    const start = data.visibility_start_date;
    const end = data.visibility_end_date;

    if (
      data.role_name === "Admin" &&
      (start !== undefined || end !== undefined)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["visibility_start_date"],
        message: "Visibility dates are not allowed for Admin users.",
      });
      return;
    }

    const provided =
      data.visibility_start_date !== undefined ||
      data.visibility_end_date !== undefined;

    if (!provided) return;

    if ((start === null) !== (end === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["visibility_start_date"],
        message:
          "Both visibility_start_date and visibility_end_date must be null together.",
      });
      return;
    }

    if ((start && !end) || (!start && end)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["visibility_start_date"],
        message:
          "Both visibility_start_date and visibility_end_date are required together.",
      });
      return;
    }

    if (start instanceof Date && end instanceof Date) {
      if (end < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["visibility_end_date"],
          message:
            "visibility_end_date must be greater than or equal to visibility_start_date.",
        });
      }

      if (end > new Date()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["visibility_end_date"],
          message: "visibility_end_date cannot be in the future.",
        });
      }
    }
  });
