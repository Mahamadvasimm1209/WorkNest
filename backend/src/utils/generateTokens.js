import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
    return jwt.sign(
        {
            sub: user._id.toString(),
            role: user.role,
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
            issuer: "taskflow-api",
            audience: "taskflow-client",
        }
    );
};

export const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            sub: user._id.toString(),
            type: "refresh",
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
            issuer: "taskflow-api",
            audience: "taskflow-client",
        }
    );
};