import { Router } from "express";
import { searchPosts } from "../controllers/search.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Secure search route using auth middleware
router.get("/posts", requireAuth, searchPosts);

export default router;
