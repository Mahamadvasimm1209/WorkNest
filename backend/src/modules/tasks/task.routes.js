import express from "express";

import {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
} from "./task.controller.js";

import { authenticate } from "../../middleware/authenticate.js";

const router = express.Router();

// Every task route requires authentication.
router.use(authenticate);

router.post("/", createTask);
router.get("/", getTasks);
router.get("/:taskId", getTaskById);
router.patch("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);

export default router;