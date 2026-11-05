import { Router } from "express";
import { UserController } from "./user.controller";
import { authorize } from "../../middleware/authorize.middleware";
import { authenticate } from "../../middleware/authenticate.middleware";
import { resolveTenant } from "../../middleware/resolveTenant.middleware";
import { uploadMedia } from "../../middleware/upload.media.middleware";
import { uploadLimiter } from "../../middleware/rateLimit.middleware";

const router = Router();
router.use(authenticate);
router.use(resolveTenant);

router.post("/", uploadLimiter, authorize("users.create"), uploadMedia, UserController.create);

router.get("/", authorize("users.view"), UserController.getAll);

router.get("/hosts", authorize("users.view"), UserController.getHosts);
router.get("/admins", authorize("users.view"), UserController.getAdmins);

router.get("/:id", authorize("users.view"), UserController.getById);

router.put("/:id", uploadLimiter, uploadMedia, authorize("users.edit"), UserController.update);

router.delete("/:id", authorize("users.delete"), UserController.delete);

export default router;
