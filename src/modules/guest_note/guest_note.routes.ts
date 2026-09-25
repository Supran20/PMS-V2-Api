import { Router } from "express";
import { GuestNoteController } from "./guest_note.controller";
import {
  createGuestNoteSchema,
  updateGuestNoteSchema,
} from "./guest_note.validation";
import { authorize } from "../../middleware/authorize.middleware";
import { authenticate } from "../../middleware/authenticate.middleware";
import { resolveTenant } from "../../middleware/resolveTenant.middleware";
import validate from "../../middleware/validate.middleware";

const router = Router();
router.use(authenticate);
router.use(resolveTenant);

router.post(
  "/",
  authorize("guests.create"),
  validate(createGuestNoteSchema),
  GuestNoteController.create,
);

router.get(
  "/guest/:guestId",
  authorize("guests.view"),
  GuestNoteController.getByGuest,
);

router.patch(
  "/:id",
  authorize("guests.edit"),
  validate(updateGuestNoteSchema),
  GuestNoteController.update,
);

router.delete("/:id", authorize("guests.delete"), GuestNoteController.delete);

export default router;
