import express from "express";

import { authenticate } from "../../middleware/authenticate.js";

import {
    createTeam,
    getTeams,
    getTeamById,
    updateTeam,
    addTeamMember,
    updateTeamMemberRole,
    removeTeamMember,
    deleteTeam,
} from "./team.controller.js";

const router = express.Router();

// All team endpoints require authentication.
router.use(authenticate);

router.post("/", createTeam);
router.get("/", getTeams);
router.get("/:teamId", getTeamById);
router.patch("/:teamId", updateTeam);

router.post("/:teamId/members", addTeamMember);

router.patch(
    "/:teamId/members/:userId/role",
    updateTeamMemberRole
);

router.delete(
    "/:teamId/members/:userId",
    removeTeamMember
);

router.delete("/:teamId", deleteTeam);

export default router;