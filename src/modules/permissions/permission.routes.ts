import { Router } from "express";
import { PermissionController } from "./permission.controller";
import { authenticate } from "../../middleware/authenticate.middleware";

const router = Router();

router.get("/", authenticate, PermissionController.getAll);

export default router;
