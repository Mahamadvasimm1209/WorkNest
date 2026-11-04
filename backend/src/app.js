import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes.js";

const app = express();

// Security middleware

app.use(helmet());

// Cross-origin configuration
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

app.use("/api/v1/auth", authRoutes);


// HTTP request logging
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// Health check API
app.get("/api/v1/health", (req, res) => {
    const databaseConnected =
        mongoose.connection.readyState === 1;

    res.status(databaseConnected ? 200 : 503).json({
        success: databaseConnected,
        message: "TaskFlow API health status",
        services: {
            api: "running",
            database: databaseConnected
                ? "connected"
                : "disconnected",
        },
    });
});

export default app;