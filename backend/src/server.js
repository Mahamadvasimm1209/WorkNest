import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`TaskFlow API running on port ${PORT}`);
});

server.on("error", (error) => {
    console.error("Server error:", error.message);
    process.exit(1);
});