import { Router } from "express";
import { UserController } from "./user.controller";
import { authorize } from "../../middleware/authorize.middleware";
import { authenticate } from "../../middleware/authenticate.middleware";
import { uploadMedia } from "../../middleware/upload.media.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("users.create"),
  uploadMedia,
  UserController.create,
);

router.get("/", authenticate, authorize("users.view"), UserController.getAll);

router.get(
  "/hosts",
  authenticate,
  authorize("users.view"),
  UserController.getHosts,
);
router.get(
  "/admins",
  authenticate,
  authorize("users.view"),
  UserController.getAdmins,
);

router.get(
  "/:id",
  authenticate,
  authorize("users.view"),
  UserController.getById,
);

router.put(
  "/:id",
  authenticate,
  uploadMedia,
  authorize("users.edit"),
  UserController.update,
);

router.delete(
  "/:id",
  authenticate,
  authorize("users.delete"),
  UserController.delete,
);

export default router;
