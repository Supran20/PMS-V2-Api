import { Router } from "express";
import { SettingsController } from "./settings.controller";
import { authenticate } from "../../middleware/authenticate.middleware";
import { authorize } from "../../middleware/authorize.middleware";

const router = Router();

// CREATE
router.post(
  "/",
  authenticate,
  // authorize("user.manage"),
  SettingsController.create,
);

// GET ALL
router.get(
  "/",
  authenticate,
  // authorize("user.manage"),
  SettingsController.getAll,
);

// GET BY ID
router.get(
  "/:id",
  authenticate,
  // authorize("user.manage"),
  SettingsController.getById,
);

// GET BY TYPE
router.get(
  "/type/:type",
  authenticate,
  // authorize("user.manage"),
  SettingsController.getByType,
);

// UPDATE
router.put(
  "/:id",
  authenticate,
  // authorize("user.manage"),
  SettingsController.update,
);

// DELETE
router.delete(
  "/:id",
  authenticate,
  // authorize("user.manage"),
  SettingsController.delete,
);

export default router;
