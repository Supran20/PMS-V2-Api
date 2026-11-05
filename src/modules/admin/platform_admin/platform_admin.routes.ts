import { Router } from "express";
import { PlatformAdminController } from "./platform_admin.controller";
import {
  createPlatformAdminSchema,
  updatePlatformAdminSchema,
} from "./platform_admin.validation";
import validate from "../../../middleware/validate.middleware";
import { authenticate } from "../../../middleware/authenticate.middleware";
import { authorizePlatformAdmin } from "../../../middleware/authorizePlatformAdmin.middleware";
import { uploadMedia } from "../../../middleware/upload.media.middleware";
import { adminLimiter, uploadLimiter } from "../../../middleware/rateLimit.middleware";

const router = Router();

router.use(authenticate, adminLimiter, authorizePlatformAdmin);

router.post(
  "/",
  uploadLimiter,
  uploadMedia,
  validate(createPlatformAdminSchema),
  PlatformAdminController.create,
);

router.get("/", PlatformAdminController.getAll);

router.get("/:id", PlatformAdminController.getById);

router.put(
  "/:id",
  uploadLimiter,
  uploadMedia,
  validate(updatePlatformAdminSchema),
  PlatformAdminController.update,
);

router.delete("/:id", PlatformAdminController.delete);

export default router;
