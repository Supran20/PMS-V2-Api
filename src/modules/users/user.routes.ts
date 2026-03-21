import { Router } from "express";
import { UserController } from "./user.controller";
import { authorize } from "../../middleware/authorize.middleware";
import { authenticate } from "../../middleware/authenticate.middleware";
import { uploadMedia } from "../../middleware/upload.media.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("user.manage"),
  uploadMedia,
  UserController.create,
);

router.get(
  "/",
  authenticate,
  // authorize("user.manage"),

  UserController.getAll,
);

router.get("/hosts", authenticate, UserController.getHosts);
router.get("/admins", authenticate, UserController.getAdmins);

router.get(
  "/:id",
  authenticate,
  authorize("user.manage"),
  UserController.getById,
);

router.put(
  "/:id",
  authenticate,
  uploadMedia,
  authorize("user.manage"),
  UserController.update,
);

router.delete(
  "/:id",
  authenticate,
  authorize("user.manage"),
  UserController.delete,
);

export default router;
