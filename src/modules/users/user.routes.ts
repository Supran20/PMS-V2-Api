import { Router } from "express";
import { UserController } from "./user.controller";
import { authorize } from "../../middleware/authorize.middleware";
import { authenticate } from "../../middleware/authenticate.middleware";
import { uploadMedia } from "../../middleware/upload.media.middleware";

const router = Router();
router.use(authenticate);

router.post("/", authorize("users.create"), uploadMedia, UserController.create);

router.get("/", authorize("users.view"), UserController.getAll);

router.get("/hosts", authorize("users.view"), UserController.getHosts);
router.get("/admins", authorize("users.view"), UserController.getAdmins);

router.get("/:id", authorize("users.view"), UserController.getById);

router.put("/:id", uploadMedia, authorize("users.edit"), UserController.update);

router.delete("/:id", authorize("users.delete"), UserController.delete);

export default router;
