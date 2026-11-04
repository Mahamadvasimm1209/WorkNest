import { randomBytes, createHash } from "node:crypto";

// Generate a cryptographically secure opaque refresh token
export const generateRefreshToken = () => {
    return randomBytes(64).toString("base64url");
};

// Create a SHA-256 hash of the refresh token
export const hashRefreshToken = (token) => {
    return createHash("sha256")
        .update(token)
        .digest("hex");
};

// Calculate refresh-token expiration
export const getRefreshTokenExpiry = () => {
    const ttlDays = Number(
        process.env.REFRESH_TOKEN_TTL_DAYS || 7
    );

    if (!Number.isSafeInteger(ttlDays) || ttlDays <= 0) {
        throw new Error("Invalid refresh token lifetime configuration");
    }

    return new Date(
        Date.now() + ttlDays * 24 * 60 * 60 * 1000
    );
};