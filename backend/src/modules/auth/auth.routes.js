import express from "express";
import { register, login, getMe } from "./auth.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authLimiter } from "../../middleware/rateLimiter.js";

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

// Protected route
router.get("/me", authenticate, getMe);

export default router;