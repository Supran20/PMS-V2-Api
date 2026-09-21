import { Router } from "express";

import channelRouter from "./channel/channel.routes";
import platformAdminRouter from "./platform_admin/platform_admin.routes";
import subscriptionPlanRouter from "./subscription_plan/subscription_plan.routes";

const router = Router();

router.use("/channels", channelRouter);
router.use("/platform-admins", platformAdminRouter);
router.use("/subscription-plans", subscriptionPlanRouter);

export default router;
