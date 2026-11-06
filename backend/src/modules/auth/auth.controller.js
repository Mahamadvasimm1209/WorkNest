import {
    registerSchema,
    loginSchema,
    updateProfileSchema,
    changePasswordSchema,
} from "./auth.validation.js";

import {
    registerUser,
    loginUser,
    getCurrentUser,
    updateCurrentUser,
    changeCurrentPassword,
} from "./auth.service.js";

const formatUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

const sendValidationError = (res, validation) => {
    return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
        })),
    });
};

export const register = async (req, res) => {
    try {
        const validation = registerSchema.safeParse(req.body);

        if (!validation.success) {
            return sendValidationError(res, validation);
        }

        const user = await registerUser(validation.data);

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            data: {
                user: formatUser(user),
            },
        });

    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        }

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
        const validation = loginSchema.safeParse(req.body);

        if (!validation.success) {
            return sendValidationError(res, validation);
        }

        const { user, accessToken, refreshToken, expiresAt } =
            await loginUser(validation.data);

        res.cookie("taskflow_refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/api/v1/auth",
            expires: expiresAt,
        });

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
                user: formatUser(user),
            },
        });

    } catch (error) {
        if (error.statusCode) {
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

// Update profile
export const updateMe = async (req, res) => {
    try {
        const validation = updateProfileSchema.safeParse(req.body);

        if (!validation.success) {
            return sendValidationError(res, validation);
        }

        const user = await updateCurrentUser(
            req.user.id,
            validation.data
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                user: formatUser(user),
            },
        });

    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        }

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered",
            });
        }

        console.error("Update profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Change password
export const changePassword = async (req, res) => {
    try {
        const validation = changePasswordSchema.safeParse(req.body);

        if (!validation.success) {
            return sendValidationError(res, validation);
        }

        const { currentPassword, newPassword } = validation.data;

        await changeCurrentPassword(
            req.user.id,
            currentPassword,
            newPassword
        );

        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });

    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        }

        console.error("Change password error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};