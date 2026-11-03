import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

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

// HTTP request logging
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// Health check API
app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "TaskFlow API is running",
        environment: process.env.NODE_ENV,
    });
});

export default app;