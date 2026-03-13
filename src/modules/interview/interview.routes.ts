import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { InterviewController } from "./interview.controller";
import {
  createInterviewSchema,
  updateInterviewSchema,
} from "./interview.validation";
import validate from "../../middleware/validate.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(createInterviewSchema),
  InterviewController.create,
);

router.get("/", authenticate, InterviewController.getAll);

router.get("/:id", authenticate, InterviewController.getById);

router.patch("/reorder", authenticate, InterviewController.reorder);
router.patch(
  "/assign-episode",
  authenticate,
  InterviewController.assignEpisode,
);

router.put(
  "/:id",
  authenticate,
  validate(updateInterviewSchema),
  InterviewController.update,
);

router.delete("/:id", authenticate, InterviewController.delete);

export default router;
