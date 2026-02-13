import { Router } from "express";
import TagController from "./tags.controller";
import { createTagSchema, updateTagSchema } from "./tags.validation";
import { authorize } from "../../middleware/authorize.middleware";
import { authenticate } from "../../middleware/authenticate.middleware";
import validate from "../../middleware/validate.middleware";

const router = Router();

// Create a tag
router.post("/", authenticate, validate(createTagSchema), TagController.create);

// Get all tags
router.get("/", TagController.getAll);

// Get tag by ID
router.get("/:id", TagController.getById);

//Get tag by slug
router.get("/slug/:slug", authenticate, TagController.getTagBySlug);

// Update tag by ID
router.put(
  "/:id",
  authenticate,
  validate(updateTagSchema),
  TagController.update
);

// Delete tag by ID
router.delete("/:id", TagController.delete);

export default router;
