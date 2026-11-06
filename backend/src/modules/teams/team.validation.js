import { z } from "zod";

export const createTeamSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(2, "Team name must contain at least 2 characters")
            .max(80, "Team name cannot exceed 80 characters"),

        description: z
            .string()
            .trim()
            .max(500, "Description cannot exceed 500 characters")
            .optional()
            .default(""),
    })
    .strict();

export const updateTeamSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(2)
            .max(80)
            .optional(),

        description: z
            .string()
            .trim()
            .max(500)
            .optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
        message: "Provide at least one field to update",
    });

export const addMemberSchema = z
    .object({
        email: z.string().trim().email("Enter a valid email address"),
    })
    .strict();

export const updateMemberRoleSchema = z
    .object({
        role: z.enum(["manager", "member"]),
    })
    .strict();