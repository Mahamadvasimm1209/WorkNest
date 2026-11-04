import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Task title is required"],
            trim: true,
            minlength: 2,
            maxlength: 120,
        },

        description: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: "",
        },

        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },

        status: {
            type: String,
            enum: ["todo", "in-progress", "review", "completed"],
            default: "todo",
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },

        dueDate: {
            type: Date,
            default: null,
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

taskSchema.index({ owner: 1, createdAt: -1 });
taskSchema.index({ owner: 1, project: 1 });
taskSchema.index({ owner: 1, status: 1 });
taskSchema.index({ owner: 1, dueDate: 1 });

const Task = mongoose.model("Task", taskSchema);

export default Task;