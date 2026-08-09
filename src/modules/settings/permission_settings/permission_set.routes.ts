import { Router } from "express";
import { PermissionSettingsController } from "./permission_set.controller";
import { authenticate } from "../../../middleware/authenticate.middleware";
import { authorize } from "../../../middleware/authorize.middleware";

const router = Router();

// CREATE
router.post("/", authenticate, PermissionSettingsController.create);

// GET ALL
router.get(
  "/",
  authenticate,
  // authorize("user.manage"),
  PermissionSettingsController.getAll,
);

// GET BY ID
router.get(
  "/:id",
  authenticate,
  authorize("user.manage"),
  PermissionSettingsController.getById,
);

// UPDATE
router.put("/:id", authenticate, PermissionSettingsController.update);

// DELETE
router.delete(
  "/:id",
  authenticate,
  authorize("user.manage"),
  PermissionSettingsController.delete,
);

export default router;
