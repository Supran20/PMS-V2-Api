import { Router } from "express";
import { GuestController } from "./guest.controller";
import { createGuestSchema, updateGuestSchema } from "./guest.validation";
import { authorize } from "../../middleware/authorize.middleware";
import { authenticate } from "../../middleware/authenticate.middleware";
import validate from "../../middleware/validate.middleware";
import { uploadMedia } from "../../middleware/upload.media.middleware";

const router = Router();
router.use(authenticate);

router.post(
  "/",
  authorize("guests.create"),
  uploadMedia,
  validate(createGuestSchema),
  GuestController.create,
);

router.get("/", authorize("guests.view"), GuestController.getAll);

router.get("/slug/:slug", authorize("guests.view"), GuestController.getBySlug);
router.get("/:id", authorize("guests.view"), GuestController.getById);

router.patch(
  "/:id/approve",
  authorize("guests.approve"),
  GuestController.approve,
);

router.patch(
  "/:id/reject",
  authorize("guests.approve"),
  GuestController.reject,
);

router.put(
  "/slug/:slug",
  authorize("guests.edit"),
  uploadMedia,
  validate(updateGuestSchema),
  GuestController.updateBySlug,
);

router.delete("/:id", authorize("guests.delete"), GuestController.delete);

export default router;
