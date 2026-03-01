import { Router } from "express";
import { GuestController } from "./guest.controller";
import { createGuestSchema, updateGuestSchema } from "./guest.validation";
import { authorize } from "../../middleware/authorize.middleware";
import { authenticate } from "../../middleware/authenticate.middleware";
import validate from "../../middleware/validate.middleware";
import { uploadMedia } from "../../middleware/upload.media.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("guest.create"),
  uploadMedia,
  validate(createGuestSchema),
  GuestController.create,
);

router.get("/", authenticate, authorize("guest.view"), GuestController.getAll);

router.get(
  "/slug/:slug",
  authenticate,
  authorize("guest.view"),
  GuestController.getBySlug,
);
router.get("/:id", GuestController.getById);

router.patch(
  "/:id/approve",
  authenticate,
  authorize("guest.update"),
  GuestController.approve,
);

router.put(
  "/slug/:slug",
  authenticate,
  authorize("guest.update"),
  uploadMedia,
  validate(updateGuestSchema),
  GuestController.updateBySlug,
);

router.delete(
  "/:id",
  authenticate,
  authorize("guest.delete"),
  GuestController.delete,
);

export default router;
