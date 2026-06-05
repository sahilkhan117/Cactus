import { Router } from "express";
import { createPost, getPosts, getPostById, deletePost, toggleLike } from "../controllers/post.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { z } from "zod";

const router = Router();

// Zod schemas
const createPostSchema = z.object({
  body: z.object({
    content: z.string().min(1, "Content is required").max(1000, "Content exceeds 1000 characters"),
    mediaUrls: z.array(z.string().url()).optional(),
    tags: z.array(z.string()).optional()
  }),
});

router.post("/", requireAuth, validate(createPostSchema), createPost);
router.get("/", requireAuth, getPosts);
router.get("/:id", requireAuth, getPostById);
router.delete("/:id", requireAuth, deletePost);
router.post("/:id/like", requireAuth, toggleLike);

export default router;
