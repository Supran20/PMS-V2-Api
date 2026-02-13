import { Router } from "express";
import { createUserController } from "./user.controller";
import { authorize } from "../../middleware/authorize.middleware";
import { authenticate } from "../../middleware/authenticate.middleware";

const router = Router();

router.post("/", authenticate, authorize("user.manage"), createUserController);

export default router;
