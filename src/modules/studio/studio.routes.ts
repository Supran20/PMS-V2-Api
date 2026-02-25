import { Router } from "express";
import { StudioController } from "./studio.controller";
import { createStudioSchema, updateStudioSchema } from "./studio.validation";
import validate from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/authenticate.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(createStudioSchema),
  StudioController.create,
);

router.get("/", StudioController.getAll);

router.get("/:id", StudioController.getById);

router.get("/slug/:slug", StudioController.getBySlug);
router.put(
  "/slug/:slug",
  authenticate,
  validate(updateStudioSchema),
  StudioController.updateBySlug,
);

router.put(
  "/:id",
  authenticate,
  validate(updateStudioSchema),
  StudioController.update,
);

router.delete("/:id", authenticate, StudioController.delete);

export default router;
