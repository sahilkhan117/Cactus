import { Router } from "express";
import { getComments, createComment } from "../controllers/comment.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { z } from "zod";

// Merge params to allow access to /api/posts/:id/comments params
const router = Router({ mergeParams: true });

const createCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, "Content is required"),
  }),
});

router.get("/", requireAuth, getComments);
router.post("/", requireAuth, validate(createCommentSchema), createComment);

export default router;
