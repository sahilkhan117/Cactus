import { Router } from "express";
import { getNotifications, markAsRead } from "../controllers/notification.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getNotifications);
router.put("/read", requireAuth, markAsRead);

export default router;
