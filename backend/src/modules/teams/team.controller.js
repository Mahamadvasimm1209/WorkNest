import mongoose from "mongoose";
import Team from "./team.model.js";
import User from "../auth/auth.model.js";

import {
    createTeamSchema,
    updateTeamSchema,
    addMemberSchema,
    updateMemberRoleSchema,
} from "./team.validation.js";

const isValidId = (id) => mongoose.isValidObjectId(id);

const getTeamForMember = async (teamId, userId) => {
    if (!isValidId(teamId)) return null;

    return Team.findOne({
        _id: teamId,
        "members.user": userId,
    });
};

const getMemberRole = (team, userId) => {
    const member = team.members.find(
        (item) => item.user.toString() === userId.toString()
    );

    return member?.role || null;
};

const canManageMembers = (role) => {
    return role === "owner" || role === "manager";
};

// CREATE TEAM
export const createTeam = async (req, res) => {
    try {
        const validation = createTeamSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: validation.error.issues[0].message,
            });
        }

        const team = await Team.create({
            ...validation.data,
            owner: req.user.id,
            members: [
                {
                    user: req.user.id,
                    role: "owner",
                },
            ],
        });

        await team.populate("members.user", "name email");

        return res.status(201).json({
            success: true,
            message: "Team created successfully",
            data: { team },
        });
    } catch (error) {
        console.error("Create team error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// GET ALL TEAMS FOR LOGGED-IN USER
export const getTeams = async (req, res) => {
    try {
        const teams = await Team.find({
            "members.user": req.user.id,
        })
            .populate("members.user", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: teams.length,
            data: { teams },
        });
    } catch (error) {
        console.error("Get teams error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// GET SINGLE TEAM
export const getTeamById = async (req, res) => {
    try {
        const team = await getTeamForMember(
            req.params.teamId,
            req.user.id
        );

        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found",
            });
        }

        await team.populate("members.user", "name email");

        return res.status(200).json({
            success: true,
            data: { team },
        });
    } catch (error) {
        console.error("Get team error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// UPDATE TEAM DETAILS
export const updateTeam = async (req, res) => {
    try {
        const validation = updateTeamSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: validation.error.issues[0].message,
            });
        }

        const team = await getTeamForMember(
            req.params.teamId,
            req.user.id
        );

        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found",
            });
        }

        const role = getMemberRole(team, req.user.id);

        if (!canManageMembers(role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to update this team",
            });
        }

        Object.assign(team, validation.data);
        await team.save();
        await team.populate("members.user", "name email");

        return res.status(200).json({
            success: true,
            message: "Team updated successfully",
            data: { team },
        });
    } catch (error) {
        console.error("Update team error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ADD REGISTERED USER BY EMAIL
export const addTeamMember = async (req, res) => {
    try {
        const validation = addMemberSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: validation.error.issues[0].message,
            });
        }

        const team = await getTeamForMember(
            req.params.teamId,
            req.user.id
        );

        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found",
            });
        }

        const currentRole = getMemberRole(team, req.user.id);

        if (!canManageMembers(currentRole)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to add members",
            });
        }

        const email = validation.data.email.toLowerCase();

        const user = await User.findOne({
            email,
            isActive: true,
        }).select("_id name email");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No active TaskFlow account found with this email",
            });
        }

        if (user._id.toString() === req.user.id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You are already a member of this team",
            });
        }

        const alreadyMember = team.members.some(
            (member) => member.user.toString() === user._id.toString()
        );

        if (alreadyMember) {
            return res.status(409).json({
                success: false,
                message: "This user is already a team member",
            });
        }

        team.members.push({
            user: user._id,
            role: "member",
        });

        await team.save();
        await team.populate("members.user", "name email");

        return res.status(201).json({
            success: true,
            message: "Member added successfully",
            data: { team },
        });
    } catch (error) {
        console.error("Add team member error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// CHANGE MEMBER ROLE — OWNER ONLY
export const updateTeamMemberRole = async (req, res) => {
    try {
        const validation = updateMemberRoleSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: validation.error.issues[0].message,
            });
        }

        const { teamId, userId } = req.params;

        if (!isValidId(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        const team = await getTeamForMember(teamId, req.user.id);

        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found",
            });
        }

        if (getMemberRole(team, req.user.id) !== "owner") {
            return res.status(403).json({
                success: false,
                message: "Only the team owner can change member roles",
            });
        }

        const member = team.members.find(
            (item) => item.user.toString() === userId
        );

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Team member not found",
            });
        }

        if (member.role === "owner") {
            return res.status(400).json({
                success: false,
                message: "The owner role cannot be changed",
            });
        }

        member.role = validation.data.role;

        await team.save();
        await team.populate("members.user", "name email");

        return res.status(200).json({
            success: true,
            message: "Member role updated successfully",
            data: { team },
        });
    } catch (error) {
        console.error("Update member role error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// REMOVE TEAM MEMBER
export const removeTeamMember = async (req, res) => {
    try {
        const { teamId, userId } = req.params;

        if (!isValidId(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        const team = await getTeamForMember(teamId, req.user.id);

        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found",
            });
        }

        const currentRole = getMemberRole(team, req.user.id);

        if (!canManageMembers(currentRole)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to remove members",
            });
        }

        const member = team.members.find(
            (item) => item.user.toString() === userId
        );

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Team member not found",
            });
        }

        if (member.role === "owner") {
            return res.status(400).json({
                success: false,
                message: "The team owner cannot be removed",
            });
        }

        if (currentRole === "manager" && member.role !== "member") {
            return res.status(403).json({
                success: false,
                message: "Managers can only remove regular members",
            });
        }

        team.members = team.members.filter(
            (item) => item.user.toString() !== userId
        );

        await team.save();

        return res.status(200).json({
            success: true,
            message: "Member removed successfully",
        });
    } catch (error) {
        console.error("Remove team member error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// DELETE TEAM — OWNER ONLY
export const deleteTeam = async (req, res) => {
    try {
        const team = await getTeamForMember(
            req.params.teamId,
            req.user.id
        );

        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found",
            });
        }

        if (getMemberRole(team, req.user.id) !== "owner") {
            return res.status(403).json({
                success: false,
                message: "Only the team owner can delete this team",
            });
        }

        await Team.findByIdAndDelete(team._id);

        return res.status(200).json({
            success: true,
            message: "Team deleted successfully",
        });
    } catch (error) {
        console.error("Delete team error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};