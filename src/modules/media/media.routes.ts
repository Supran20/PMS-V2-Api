import { Router } from "express";
import { MediaController } from "./media.controller";
import { createMediaSchema, updateMediaSchema } from "./media.validation";
import validate from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/authenticate.middleware";
import { uploadMedia } from "../../middleware/upload.media.middleware";

const router = Router();

// Get all media
router.get("/", authenticate, MediaController.getAllMedia);

// Get media by ID
router.get("/:id", authenticate, MediaController.getMediaById);

// Create new media
router.post(
  "/",
  authenticate,
  uploadMedia,
  validate(createMediaSchema),
  MediaController.createMedia,
);

// Update media
router.put(
  "/:id",
  authenticate,
  uploadMedia,
  validate(updateMediaSchema),
  MediaController.updateMedia,
);

// Delete media
router.delete("/:id", authenticate, MediaController.deleteMedia);

export default router;
