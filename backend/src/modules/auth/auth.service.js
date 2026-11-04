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

    // Generate access token
    const accessToken = generateAccessToken(user);

    // Generate opaque refresh token
    const refreshToken = generateRefreshToken();

    // Hash refresh token before database storage
    const refreshTokenHash = hashRefreshToken(refreshToken);

    // Calculate session expiration
    const expiresAt = getRefreshTokenExpiry();

    // Create persistent session
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