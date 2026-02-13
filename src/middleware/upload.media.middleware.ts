// src/middleware/upload.media.middleware.ts

import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// -----------------------------
// Upload Directory
// -----------------------------
const uploadDir = path.join(process.cwd(), "uploads", "media");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// -----------------------------
// Allowed MIME Types
// -----------------------------
const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "video/mp4",
  "video/mpeg",
  "video/quicktime",
];

// -----------------------------
// Storage Configuration
// -----------------------------
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// -----------------------------
// File Filter (Security Critical)
// -----------------------------
const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new Error(
        "Invalid file type. Only images (jpeg, png, webp) and videos (mp4, mpeg, mov) are allowed.",
      ),
    );
  }

  cb(null, true);
};

// -----------------------------
// Multer Instance
// -----------------------------
export const uploadMedia = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
}).single("file");
