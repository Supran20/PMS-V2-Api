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
router.use(authenticate);

router.post(
  "/",
  authorize("interviews.create"),
  validate(createInterviewSchema),
  InterviewController.create,
);

router.get("/", authorize("interviews.view"), InterviewController.getAll);

router.get(
  "/episode-meta",
  authorize("interviews.view"),
  InterviewController.getEpisodeMeta,
);

router.get("/:id", authorize("interviews.view"), InterviewController.getById);

router.patch(
  "/reorder",
  authorize("interviews.edit"),
  InterviewController.reorder,
);
router.patch(
  "/assign-episode",
  authorize("interviews.edit"),
  InterviewController.assignEpisode,
);

router.put(
  "/:id",
  authorize("interviews.edit"),
  validate(updateInterviewSchema),
  InterviewController.update,
);

router.delete(
  "/:id",
  authorize("interviews.delete"),
  InterviewController.delete,
);

router.patch(
  "/reshuffle",
  authorize("interviews.edit"),
  InterviewController.reshuffle,
);

export default router;
