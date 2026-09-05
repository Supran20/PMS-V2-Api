import { Router } from "express";
import { RoleController } from "./role.controller";
import { authenticate } from "../../middleware/authenticate.middleware";

const router = Router();

router.get("/", authenticate, RoleController.getAll);
router.get("/:id/permissions", authenticate, RoleController.getPermissions);

export default router;
