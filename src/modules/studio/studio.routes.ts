import { Router } from "express";
import { StudioController } from "./studio.controller";
import { createStudioSchema, updateStudioSchema } from "./studio.validation";
import validate from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/authenticate.middleware";
import { authorize } from "../../middleware/authorize.middleware";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize("studio.create"),
  validate(createStudioSchema),
  StudioController.create,
);

router.get("/", authorize("studio.view"), StudioController.getAll);

router.get("/:id", authorize("studio.view"), StudioController.getById);

router.get("/slug/:slug", authorize("studio.view"), StudioController.getBySlug);
router.put(
  "/slug/:slug",
  authorize("studio.edit"),
  validate(updateStudioSchema),
  StudioController.updateBySlug,
);

router.put(
  "/:id",
  authorize("studio.edit"),
  validate(updateStudioSchema),
  StudioController.update,
);

router.delete("/:id", authorize("studio.delete"), StudioController.delete);

export default router;
