import express from "express";

import {
    createProject,
    getProjects,
    deleteProject,
} from "./project.controller.js";

import { authenticate } from "../../middleware/authenticate.js";

const router = express.Router();

router.use(authenticate);

router.post("/", createProject);
router.get("/", getProjects);
router.delete("/:projectId", deleteProject);

export default router;