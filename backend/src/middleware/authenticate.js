import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
    try {
        // Get Authorization header
        const authHeader = req.headers.authorization;

        // Check whether Bearer token exists
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET,
            {
                algorithms: ["HS256"],
                issuer: "taskflow-api",
                audience: "taskflow-client",
            }
        );

        // Ensure this is an access token
        if (
            typeof decoded === "string" ||
            !decoded.sub ||
            decoded.type !== "access"
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token",
            });
        }

        // Attach authenticated user information
        req.user = {
            id: decoded.sub,
            role: decoded.role,
        };

        // Continue to the next middleware/controller
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};