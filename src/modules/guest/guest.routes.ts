import { Router } from "express";
import { GuestController } from "./guest.controller";
import { createGuestSchema, updateGuestSchema } from "./guest.validation";
import { authorize } from "../../middleware/authorize.middleware";
import { authenticate } from "../../middleware/authenticate.middleware";
import validate from "../../middleware/validate.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(createGuestSchema),
  GuestController.create,
);

router.get("/", GuestController.getAll);

router.get("/:id", GuestController.getById);

router.get("/slug/:slug", GuestController.getBySlug);

router.put(
  "/slug/:slug",
  authenticate,
  validate(updateGuestSchema),
  GuestController.updateBySlug,
);

router.delete(
  "/:id",
  authenticate,
  authorize("guest.manage"),
  GuestController.delete,
);

export default router;
