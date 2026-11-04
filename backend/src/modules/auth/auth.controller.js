import {
    registerSchema,
    loginSchema,
} from "./auth.validation.js";

import {
    registerUser,
    loginUser,
} from "./auth.service.js";
import { getCurrentUser } from "./auth.service.js";


export const register = async (req, res) => {
    try {
        // Validate incoming request
        const validation = registerSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
        }

        // Create user
        const user = await registerUser(validation.data);

        // Return safe user information
        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt,
                },
            },
        });

    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        }

        // Handle duplicate email race conditions
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered",
            });
        }

        console.error("Registration error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


export const login = async (req, res) => {
    try {
        // Validate request
        const validation = loginSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
        }

        // Authenticate user
        const { user, accessToken } = await loginUser(
            validation.data
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                accessToken,
            },
        });

    } catch (error) {
        if (error.statusCode === 401) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await getCurrentUser(req.user.id);

        return res.status(200).json({
            success: true,
            message: "Current user retrieved successfully",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                    createdAt: user.createdAt,
                },
            },
        });

    } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 401) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        }

        console.error("Get current user error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};