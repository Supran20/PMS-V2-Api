import { Router } from "express";
import { PlatformAdminController } from "./platform_admin.controller";
import { createPlatformAdminSchema } from "./platform_admin.validation";
import validate from "../../../middleware/validate.middleware";
import { authenticate } from "../../../middleware/authenticate.middleware";
import { authorizePlatformAdmin } from "../../../middleware/authorizePlatformAdmin.middleware";

const router = Router();

router.use(authenticate, authorizePlatformAdmin);

router.post(
  "/",
  validate(createPlatformAdminSchema),
  PlatformAdminController.create,
);

router.get("/", PlatformAdminController.getAll);

router.get("/:id", PlatformAdminController.getById);

router.delete("/:id", PlatformAdminController.delete);

export default router;
