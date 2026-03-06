import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";

const validate =
  (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
      // 🔥 Auto-parse JSON fields if they are strings
      ["notes", "social_media"].forEach((field) => {
        if (req.body[field] && typeof req.body[field] === "string") {
          try {
            req.body[field] = JSON.parse(req.body[field]);
          } catch (err) {
            throw new Error(`Invalid ${field} JSON format`);
          }
        }
      });
      const parsed = schema.parse(req.body);

      // ✅ MERGE instead of overwrite
      req.body = { ...req.body, ...parsed };

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: err.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
      }
      next(err);
    }
  };

export default validate;
