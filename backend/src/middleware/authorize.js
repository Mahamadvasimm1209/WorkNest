import User from "../modules/auth/auth.model.js";

export const authorize = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            // Authentication must run before authorization
            if (!req.user?.id) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required",
                });
            }

            // Fetch the latest user information from MongoDB
            const user = await User.findById(req.user.id);

            if (!user || !user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: "User is not authorized to access this resource",
                });
            }

            // Check the user's current role
            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({
                    success: false,
                    message: "You do not have permission to perform this action",
                });
            }

            // Update role with the current database value
            req.user.role = user.role;

            next();

        } catch (error) {
            console.error("Authorization error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    };
};