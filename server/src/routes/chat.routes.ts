import { Router } from "express";
import { getConversations, getMessages } from "../controllers/chat.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/conversations", requireAuth, getConversations);
router.get("/conversations/:id/messages", requireAuth, getMessages);

export default router;
