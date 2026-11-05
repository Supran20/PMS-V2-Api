import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

const LOGO_MAX_BYTES = 2 * 1024 * 1024; // 2 MB

// Same folder as other media so the /uploads static mount serves it.
const uploadDir = path.join(process.cwd(), "uploads", "media");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// No SVG on purpose: it can carry scripts.
const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: LOGO_MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          "Invalid file type. Only jpg, png or webp images are allowed.",
        ),
      );
    }
    cb(null, true);
  },
}).single("file");

export const uploadLogo = (req: Request, res: Response, next: NextFunction) => {
  upload(req, res, (err) => {
    if (!err) return next();

    const message =
      err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE"
        ? "Logo must be 2 MB or smaller"
        : err.message;

    return res.status(400).json({ success: false, message });
  });
};
