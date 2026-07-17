import { Router } from "express";
import { GuestReapprovalRequestController } from "./guest_reapproval_request.controller";
import { authenticate } from "../../middleware/authenticate.middleware";
import validate from "../../middleware/validate.middleware";
import {
  createGuestReapprovalRequestSchema,
  reviewGuestReapprovalRequestSchema,
} from "./guest_reapproval_request.validation";

const router = Router();
router.post(
  "/",
  authenticate,
  validate(createGuestReapprovalRequestSchema),
  GuestReapprovalRequestController.create,
);

router.get("/", authenticate, GuestReapprovalRequestController.getAll);

router.get("/:id", authenticate, GuestReapprovalRequestController.getById);

router.patch(
  "/:id/approve",
  authenticate,
  validate(reviewGuestReapprovalRequestSchema),
  GuestReapprovalRequestController.approve,
);

router.patch(
  "/:id/reject",
  authenticate,
  validate(reviewGuestReapprovalRequestSchema),
  GuestReapprovalRequestController.reject,
);

export default router;
