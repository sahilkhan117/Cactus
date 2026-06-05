import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { uploadMiddleware, uploadImage } from "../controllers/upload.controller.js";

const router = Router();

router.post("/", requireAuth, uploadMiddleware.single("image"), uploadImage);

export default router;
