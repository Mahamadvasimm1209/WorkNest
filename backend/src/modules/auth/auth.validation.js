import { z } from "zod";

export const registerSchema = z.object({
    name: z.string()
        .trim()
        .min(2, "Name must contain at least 2 characters")
        .max(60, "Name cannot exceed 60 characters"),

    email: z.string()
        .trim()
        .toLowerCase()
        .email("Please enter a valid email address"),

    password: z.string()
        .min(8, "Password must contain at least 8 characters")
        .refine(
            (password) => Buffer.byteLength(password, "utf8") <= 72,
            "Password cannot exceed 72 bytes"
        ),
}).strict();

export const loginSchema = z.object({
    email: z.string()
        .trim()
        .toLowerCase()
        .email("Please enter a valid email address"),

    password: z.string()
        .min(1, "Password is required")
        .refine(
            (password) => Buffer.byteLength(password, "utf8") <= 72,
            "Password cannot exceed 72 bytes"
        ),
}).strict();

// Update profile
export const updateProfileSchema = z.object({
    name: z.string()
        .trim()
        .min(2, "Name must contain at least 2 characters")
        .max(60, "Name cannot exceed 60 characters")
        .optional(),

    email: z.string()
        .trim()
        .toLowerCase()
        .email("Please enter a valid email address")
        .optional(),
})
    .strict()
    .refine(
        (data) => data.name !== undefined || data.email !== undefined,
        "Provide at least one field to update"
    );

// Change password
export const changePasswordSchema = z.object({
    currentPassword: z.string()
        .min(1, "Current password is required")
        .refine(
            (password) => Buffer.byteLength(password, "utf8") <= 72,
            "Password cannot exceed 72 bytes"
        ),

    newPassword: z.string()
        .min(8, "New password must contain at least 8 characters")
        .refine(
            (password) => Buffer.byteLength(password, "utf8") <= 72,
            "Password cannot exceed 72 bytes"
        ),
})
    .strict()
    .refine(
        (data) => data.currentPassword !== data.newPassword,
        {
            message: "New password must be different from current password",
            path: ["newPassword"],
        }
    );