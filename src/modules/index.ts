import { Router } from "express";
import authRouter from "./auth/auth.routes";
import tagsRouter from "./tags/tags.routes";
import mediaRoutes from "./media/media.routes";
import userRoutes from "./users/user.routes";
import guestRoutes from "./guest/guest.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/tags", tagsRouter);
router.use("/media", mediaRoutes);
router.use("/users", userRoutes);
router.use("/guests", guestRoutes);

export default router;
