import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/database.js";

const startServer = async () => {
    try {
        // Connect database first
        await connectDB();

        // Load Express app after environment setup
        const { default: app } = await import("./app.js");

        const PORT = process.env.PORT || 5000;

        const server = app.listen(PORT, () => {
            console.log(`TaskFlow API running on port ${PORT}`);
        });

        server.on("error", (error) => {
            console.error("Server error:", error.message);
            process.exit(1);
        });

    } catch (error) {
        console.error("Application startup failed:", error.message);
        process.exit(1);
    }
};

startServer();