import { Router } from "express";
import TagController from "./tags.controller";
import { createTagSchema, updateTagSchema } from "./tags.validation";
import { authorize } from "../../middleware/authorize.middleware";
import { authenticate } from "../../middleware/authenticate.middleware";
import validate from "../../middleware/validate.middleware";

const router = Router();

router.use(authenticate);

// Create a tag
router.post(
  "/",
  authorize("tags.create"),
  validate(createTagSchema),
  TagController.create,
);

// Get all tags
router.get("/", authorize("tags.view"), TagController.getAll);

// Get tag by ID
router.get("/:id", authorize("tags.view"), TagController.getById);

//Get tag by slug
router.get("/slug/:slug", authorize("tags.view"), TagController.getTagBySlug);

// Update tag by ID
router.put(
  "/:id",
  authorize("tags.update"),
  validate(updateTagSchema),
  TagController.update,
);

// Delete tag by ID
router.delete("/:id", authorize("tags.delete"), TagController.delete);

export default router;
