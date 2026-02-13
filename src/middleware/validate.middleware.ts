import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";

const validate =
  (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
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
