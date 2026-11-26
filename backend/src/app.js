import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import authRoutes from "./modules/auth/auth.routes.js";
import projectRoutes from "./modules/projects/project.routes.js";
import taskRoutes from "./modules/tasks/task.routes.js";
import teamRoutes from "./modules/teams/team.routes.js";

import { authenticate } from "./middleware/authenticate.js";

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/teams", teamRoutes);

// Protected route for authentication testing
app.get("/api/v1/protected-test", authenticate, (req, res) => {
    return res.status(200).json({
        success: true,
        message: "You are authenticated",
        user: req.user,
    });
});

// Health check
app.get("/api/v1/health", (req, res) => {
    const databaseConnected = mongoose.connection.readyState === 1;

    return res.status(databaseConnected ? 200 : 503).json({
        success: databaseConnected,
        message: databaseConnected
            ? "WorkNest API is healthy"
            : "Database connection unavailable",
        database: databaseConnected ? "connected" : "disconnected",
    });
});

export default app;