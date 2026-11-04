import User from "./auth.model.js";
import { generateAccessToken } from "../../utils/generateTokens.js";

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
    // Find user and explicitly include password hash
    const user = await User.findOne({ email }).select("+password");

    // Use the same error for invalid email and password
    if (!user) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    // Check account status
    if (!user.isActive) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    // Compare entered password with stored hash
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    // Generate access token
    const accessToken = generateAccessToken(user);

    return {
        user,
        accessToken,
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