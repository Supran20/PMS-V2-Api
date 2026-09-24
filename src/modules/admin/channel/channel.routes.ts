import { Router } from "express";
import { ChannelController } from "./channel.controller";
import { createChannelSchema, updateChannelSchema } from "./channel.validation";
import validate from "../../../middleware/validate.middleware";
import { authenticate } from "../../../middleware/authenticate.middleware";
import { authorizePlatformAdmin } from "../../../middleware/authorizePlatformAdmin.middleware";

const router = Router();

router.use(authenticate);
router.use(authorizePlatformAdmin);

router.post("/", validate(createChannelSchema), ChannelController.create);

router.get("/", ChannelController.getAll);

router.get("/:id", ChannelController.getById);

router.get("/slug/:slug", ChannelController.getBySlug);
router.put(
  "/slug/:slug",
  validate(updateChannelSchema),
  ChannelController.updateBySlug,
);

router.put("/:id", validate(updateChannelSchema), ChannelController.update);

router.delete("/:id", ChannelController.delete);

export default router;
