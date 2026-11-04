import Project from "./project.model.js";
import { createProjectSchema } from "./project.validation.js";

// CREATE PROJECT
export const createProject = async (req, res) => {
    try {
        // Validate request body
        const validation = createProjectSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
        }

        // Create project using authenticated user's ID
        const project = await Project.create({
            ...validation.data,
            owner: req.user.id,
        });

        return res.status(201).json({
            success: true,
            message: "Project created successfully",
            data: {
                project,
            },
        });

    } catch (error) {
        console.error("Create project error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


// GET ALL PROJECTS FOR LOGGED-IN USER
export const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({
            owner: req.user.id,
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Projects retrieved successfully",
            data: {
                projects,
                count: projects.length,
            },
        });

    } catch (error) {
        console.error("Get projects error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        // Validate MongoDB ObjectId
        if (!/^[0-9a-fA-F]{24}$/.test(projectId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID",
            });
        }

        // Delete only if the project belongs to the logged-in user
        const project = await Project.findOneAndDelete({
            _id: projectId,
            owner: req.user.id,
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Project deleted successfully",
        });
    } catch (error) {
        console.error("Delete project error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};