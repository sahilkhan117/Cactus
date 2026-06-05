import { Router } from "express";
import { createStory, getStories } from "../controllers/story.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, createStory);
router.get("/", requireAuth, getStories);

export default router;
