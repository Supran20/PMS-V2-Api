import { Router } from "express";
import { SubscriptionPlanController } from "./subscription_plan.controller";
import {
  createSubscriptionPlanSchema,
  updateSubscriptionPlanSchema,
} from "./subscription_plan.validation";
import validate from "../../../middleware/validate.middleware";
import { authenticate } from "../../../middleware/authenticate.middleware";
import { authorizePlatformAdmin } from "../../../middleware/authorizePlatformAdmin.middleware";

const router = Router();

router.use(authenticate);
router.use(authorizePlatformAdmin);

router.post(
  "/",
  validate(createSubscriptionPlanSchema),
  SubscriptionPlanController.create,
);

router.get("/", SubscriptionPlanController.getAll);

router.get("/:id", SubscriptionPlanController.getById);

router.put(
  "/:id",
  validate(updateSubscriptionPlanSchema),
  SubscriptionPlanController.update,
);

router.delete("/:id", SubscriptionPlanController.delete);

export default router;
