import express from "express";

import {
    register,
    login,
    getMe,
    updateMe,
    changePassword,
} from "./auth.controller.js";

import { authenticate } from "../../middleware/authenticate.js";
import { authLimiter } from "../../middleware/rateLimiter.js";
import { authorize } from "../../middleware/authorize.js";

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

// Protected account routes
router.get("/me", authenticate, getMe);
router.patch("/me", authenticate, updateMe);
router.patch("/change-password", authenticate, changePassword);

router.get(
    "/admin-test",
    authenticate,
    authorize("admin"),
    (req, res) => {
        return res.status(200).json({
            success: true,
            message: "Welcome, Admin!",
            user: req.user,
        });
    }
);

export default router;