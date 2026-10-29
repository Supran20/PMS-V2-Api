import { Router } from "express";
import { ChannelProfileController } from "./channel_profile.controller";
import { updateMyChannelSchema } from "./channel_profile.validation";
import validate from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/authenticate.middleware";
import { resolveTenant } from "../../middleware/resolveTenant.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { uploadLogo } from "../../middleware/upload.logo.middleware";

const router = Router();

router.use(authenticate);
router.use(resolveTenant);

router.get("/me", authorize("settings.view"), ChannelProfileController.get);

router.put(
  "/me",
  authorize("settings.edit"),
  validate(updateMyChannelSchema),
  ChannelProfileController.update,
);

router.put(
  "/me/logo",
  authorize("settings.edit"),
  uploadLogo,
  ChannelProfileController.uploadLogo,
);

router.delete(
  "/me/logo",
  authorize("settings.edit"),
  ChannelProfileController.removeLogo,
);

export default router;
