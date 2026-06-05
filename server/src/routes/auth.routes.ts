import { Router } from "express";
import { register, login, verify } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { z } from "zod";

const router = Router();

const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    fullName: z.string().min(2, "Full name is required"),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/verify", requireAuth, verify);

export default router;
