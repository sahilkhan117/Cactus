import { Router } from "express";
import { createPoll, getPolls, votePoll } from "../controllers/poll.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, createPoll);
router.get("/", requireAuth, getPolls);
router.post("/:id/vote", requireAuth, votePoll);

export default router;
