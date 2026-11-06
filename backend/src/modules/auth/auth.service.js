import User from "./auth.model.js";
import { generateAccessToken } from "../../utils/generateTokens.js";
import Session from "../sessions/session.model.js";

import {
    generateRefreshToken,
    hashRefreshToken,
    getRefreshTokenExpiry,
} from "../../utils/refreshToken.js";

export const registerUser = async ({ name, email, password }) => {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        const error = new Error("Email is already registered");
        error.statusCode = 409;
        throw error;
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    return user;
};

export const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.isActive) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const expiresAt = getRefreshTokenExpiry();

    await Session.create({
        user: user._id,
        refreshTokenHash,
        expiresAt,
    });

    return {
        user,
        accessToken,
        refreshToken,
        expiresAt,
    };
};

export const getCurrentUser = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        const error = new Error("User account not found");
        error.statusCode = 404;
        throw error;
    }

    if (!user.isActive) {
        const error = new Error("Account is inactive");
        error.statusCode = 401;
        throw error;
    }

    return user;
};

// Update profile
export const updateCurrentUser = async (userId, updates) => {
    const user = await getCurrentUser(userId);

    if (updates.email && updates.email !== user.email) {
        const existingUser = await User.findOne({
            email: updates.email,
            _id: { $ne: userId },
        });

        if (existingUser) {
            const error = new Error("Email is already registered");
            error.statusCode = 409;
            throw error;
        }
    }

    if (updates.name !== undefined) {
        user.name = updates.name;
    }

    if (updates.email !== undefined) {
        user.email = updates.email;
    }

    await user.save();

    return user;
};

// Change password
export const changeCurrentPassword = async (
    userId,
    currentPassword,
    newPassword
) => {
    const user = await User.findById(userId).select("+password");

    if (!user || !user.isActive) {
        const error = new Error("User account not found or inactive");
        error.statusCode = 404;
        throw error;
    }

    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
        const error = new Error("Current password is incorrect");
        error.statusCode = 400;
        throw error;
    }

    user.password = newPassword;

    // The existing Mongoose pre-save hook hashes this password.
    await user.save();

    return true;
};