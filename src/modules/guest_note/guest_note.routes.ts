import { Router } from "express";
import { GuestNoteController } from "./guest_note.controller";
import {
  createGuestNoteSchema,
  updateGuestNoteSchema,
} from "./guest_note.validation";
import { authorize } from "../../middleware/authorize.middleware";
import { authenticate } from "../../middleware/authenticate.middleware";
import validate from "../../middleware/validate.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  // authorize("guest.create"),
  validate(createGuestNoteSchema),
  GuestNoteController.create,
);

router.get(
  "/guest/:guestId",
  authenticate,
  // authorize("guest.view"),
  GuestNoteController.getByGuest,
);

router.patch(
  "/:id",
  authenticate,
  // authorize("guest.update"),
  validate(updateGuestNoteSchema),
  GuestNoteController.update,
);

router.delete(
  "/:id",
  authenticate,
  // authorize("guest.delete"),
  GuestNoteController.delete,
);

export default router;
