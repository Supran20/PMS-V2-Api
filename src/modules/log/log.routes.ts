import { Router } from "express";
import { LogController } from "./log.controller";
import { authenticate } from "../../middleware/authenticate.middleware";

const router = Router();

router.get("/", authenticate, LogController.getAll);
router.get("/:id", authenticate, LogController.getById);

export default router;
