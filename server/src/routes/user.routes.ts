import { Router } from "express";
import { getMe, updateMe, getUserById } from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { z } from "zod";

const router = Router();

const updateMeSchema = z.object({
  body: z.object({
    bio: z.string().max(160, "Bio cannot exceed 160 characters").optional(),
    avatarUrl: z.string().url("Must be a valid URL").optional(),
  }),
});

router.get("/me", requireAuth, getMe);
router.patch("/me", requireAuth, validate(updateMeSchema), updateMe);
router.get("/:id", requireAuth, getUserById);

export default router;
