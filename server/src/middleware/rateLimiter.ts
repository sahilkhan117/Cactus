import rateLimit from "express-rate-limit";

// Global API rate limiting: 100 requests per 15 minutes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { message: "Too many requests from this IP, please try again in 15 minutes." },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// Auth endpoints rate limiting: 5 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: { message: "Too many login/registration attempts from this IP, please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});
