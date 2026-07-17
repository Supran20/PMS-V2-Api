import { Router } from "express";
import authRouter from "./auth/auth.routes";
import tagsRouter from "./tags/tags.routes";
import mediaRoutes from "./media/media.routes";
import userRoutes from "./users/user.routes";
import guestRoutes from "./guest/guest.routes";
import studioRoutes from "./studio/studio.routes";
import interviewRoutes from "./interview/interview.routes";
import guestNoteRoutes from "./guest_note/guest_note.routes";
import settingsRoutes from "./settings/settings.routes";
import permissionSettingsRoutes from "./settings/permission_settings/permission_set.routes";
import GuestReapprovalRoutes from "./guest_reapproval_request/guest_reapproval_request.routes";
import logRoutes from "./log/log.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/tags", tagsRouter);
router.use("/media", mediaRoutes);
router.use("/users", userRoutes);
router.use("/guests", guestRoutes);
router.use("/studios", studioRoutes);
router.use("/interviews", interviewRoutes);
router.use("/guest_notes", guestNoteRoutes);
router.use("/settings", settingsRoutes);
router.use("/permission-sett", permissionSettingsRoutes);
router.use("/guest-reapproval-requests", GuestReapprovalRoutes);
router.use("/logs", logRoutes);

export default router;
