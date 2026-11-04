import { z } from "zod";

const objectIdSchema = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid project ID");

const dueDateSchema = z.union([
    z.string().datetime(),
    z.literal(""),
    z.null(),
]);

export const createTaskSchema = z
    .object({
        title: z
            .string()
            .trim()
            .min(2, "Task title must contain at least 2 characters")
            .max(120, "Task title cannot exceed 120 characters"),

        description: z
            .string()
            .trim()
            .max(2000, "Description cannot exceed 2000 characters")
            .optional()
            .default(""),

        projectId: objectIdSchema,

        status: z
            .enum(["todo", "in-progress", "review", "completed"])
            .optional()
            .default("todo"),

        priority: z
            .enum(["low", "medium", "high"])
            .optional()
            .default("medium"),

        dueDate: dueDateSchema.optional(),
    })
    .strict();

export const updateTaskSchema = z
    .object({
        title: z
            .string()
            .trim()
            .min(2, "Task title must contain at least 2 characters")
            .max(120, "Task title cannot exceed 120 characters")
            .optional(),

        description: z
            .string()
            .trim()
            .max(2000, "Description cannot exceed 2000 characters")
            .optional(),

        projectId: objectIdSchema.optional(),

        status: z
            .enum(["todo", "in-progress", "review", "completed"])
            .optional(),

        priority: z
            .enum(["low", "medium", "high"])
            .optional(),

        dueDate: dueDateSchema.optional(),
    })
    .strict()
    .refine(
        (data) => Object.keys(data).length > 0,
        "At least one field is required to update a task"
    );