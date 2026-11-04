import mongoose from "mongoose";
import Task from "./task.model.js";
import Project from "../projects/project.model.js";
import {
    createTaskSchema,
    updateTaskSchema,
} from "./task.validation.js";

const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

// CREATE TASK
export const createTask = async (req, res) => {
    try {
        const validation = createTaskSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.flatten().fieldErrors,
            });
        }

        const {
            title,
            description,
            projectId,
            status,
            priority,
            dueDate,
        } = validation.data;

        // Verify that this project belongs to the logged-in user.
        const project = await Project.findOne({
            _id: projectId,
            owner: req.user.id,
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        const task = await Task.create({
            title,
            description,
            project: project._id,
            status,
            priority,
            dueDate: dueDate || null,
            owner: req.user.id,
        });

        const populatedTask = await Task.findById(task._id).populate(
            "project",
            "name status"
        );

        return res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: {
                task: populatedTask,
            },
        });
    } catch (error) {
        console.error("Create task error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// GET ALL TASKS BELONGING TO LOGGED-IN USER
export const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({
            owner: req.user.id,
        })
            .populate("project", "name status")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: tasks.length,
            data: {
                tasks,
            },
        });
    } catch (error) {
        console.error("Get tasks error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// GET SINGLE TASK
export const getTaskById = async (req, res) => {
    try {
        const { taskId } = req.params;

        if (!isValidObjectId(taskId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid task ID",
            });
        }

        const task = await Task.findOne({
            _id: taskId,
            owner: req.user.id,
        }).populate("project", "name status");

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                task,
            },
        });
    } catch (error) {
        console.error("Get task error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// UPDATE TASK
export const updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        if (!isValidObjectId(taskId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid task ID",
            });
        }

        const validation = updateTaskSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.flatten().fieldErrors,
            });
        }

        const updates = { ...validation.data };

        // If the project is changing, verify ownership of the new project.
        if (updates.projectId) {
            const project = await Project.findOne({
                _id: updates.projectId,
                owner: req.user.id,
            });

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: "Project not found",
                });
            }

            updates.project = project._id;
            delete updates.projectId;
        }

        // Empty or null dueDate clears the existing date.
        if (updates.dueDate === "" || updates.dueDate === null) {
            updates.dueDate = null;
        }

        const task = await Task.findOneAndUpdate(
            {
                _id: taskId,
                owner: req.user.id,
            },
            updates,
            {
                new: true,
                runValidators: true,
            }
        ).populate("project", "name status");

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Task updated successfully",
            data: {
                task,
            },
        });
    } catch (error) {
        console.error("Update task error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// DELETE TASK
export const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        if (!isValidObjectId(taskId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid task ID",
            });
        }

        const task = await Task.findOneAndDelete({
            _id: taskId,
            owner: req.user.id,
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Task deleted successfully",
        });
    } catch (error) {
        console.error("Delete task error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};