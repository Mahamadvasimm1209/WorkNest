
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
    getTeams,
    getTeam,
    createTeam,
    updateTeam,
    addTeamMember,
    updateTeamMemberRole,
    removeTeamMember,
    deleteTeam,
    type Team,
    type TeamMember,
    type TeamUser,
} from "@/lib/teams";

function getUserId(user: string | TeamUser | undefined) {
    if (!user) return "";
    return typeof user === "string" ? user : user._id;
}

function getUserName(user: string | TeamUser) {
    return typeof user === "string"
        ? "Team member"
        : user.name || user.email || "Team member";
}

function getUserEmail(user: string | TeamUser) {
    return typeof user === "string"
        ? ""
        : user.email || "";
}

function getCurrentUserId() {
    try {
        const token = sessionStorage.getItem("accessToken");

        if (!token) return "";

        const encoded = token.split(".")[1];
        const normalized = encoded
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const payload = JSON.parse(atob(normalized));

        return payload.sub || payload.id || payload.userId || "";
    } catch {
        return "";
    }
}

function getRoleStyle(role: string) {
    switch (role) {
        case "owner":
            return "bg-violet-100 text-violet-700";
        case "manager":
            return "bg-indigo-100 text-indigo-700";
        default:
            return "bg-slate-100 text-slate-600";
    }
}

export default function TeamsPage() {
    const router = useRouter();

    const [teams, setTeams] = useState<Team[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [currentUserId, setCurrentUserId] = useState("");

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Create team
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [teamName, setTeamName] = useState("");
    const [teamDescription, setTeamDescription] = useState("");
    const [creating, setCreating] = useState(false);

    // Edit team
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [saving, setSaving] = useState(false);

    // Add member
    const [memberEmail, setMemberEmail] = useState("");
    const [addingMember, setAddingMember] = useState(false);

    // Initial data
    const loadTeams = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getTeams();

            setTeams(data);

            if (data.length > 0) {
                const firstTeam = await getTeam(data[0]._id);
                setSelectedTeam(firstTeam);
            } else {
                setSelectedTeam(null);
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load teams."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setCurrentUserId(getCurrentUserId());
        loadTeams();
    }, [loadTeams]);

    // Refresh after a change
    const refreshTeamData = async (teamId: string) => {
        const [teamList, teamDetails] = await Promise.all([
            getTeams(),
            getTeam(teamId),
        ]);

        setTeams(teamList);
        setSelectedTeam(teamDetails);
    };

    // Select team
    const handleSelectTeam = async (teamId: string) => {
        try {
            setError("");
            setSuccess("");
            setRefreshing(true);

            const data = await getTeam(teamId);
            setSelectedTeam(data);
            setEditing(false);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to open team."
            );
        } finally {
            setRefreshing(false);
        }
    };

    // Current user's team role
    const currentMember = selectedTeam?.members?.find(
        (member) =>
            getUserId(member.user) === currentUserId
    );

    const myRole = currentMember?.role || (
        selectedTeam &&
            getUserId(selectedTeam.owner) === currentUserId
            ? "owner"
            : "member"
    );

    const isOwner = myRole === "owner";
    const canManage = myRole === "owner" || myRole === "manager";

    // Create team
    const handleCreateTeam = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const name = teamName.trim();
        const description = teamDescription.trim();

        if (name.length < 2 || name.length > 100) {
            setError("Team name must contain 2 to 100 characters.");
            return;
        }

        try {
            setCreating(true);
            setError("");
            setSuccess("");

            const created = await createTeam({
                name,
                description,
            });

            setShowCreateModal(false);
            setTeamName("");
            setTeamDescription("");

            await refreshTeamData(created._id);

            setSuccess("Team created successfully.");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create team."
            );
        } finally {
            setCreating(false);
        }
    };

    // Edit team
    const startEditing = () => {
        if (!selectedTeam) return;

        setEditName(selectedTeam.name);
        setEditDescription(selectedTeam.description || "");
        setEditing(true);
        setError("");
        setSuccess("");
    };

    const handleUpdateTeam = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!selectedTeam) return;

        const name = editName.trim();
        const description = editDescription.trim();

        if (name.length < 2 || name.length > 100) {
            setError("Team name must contain 2 to 100 characters.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            await updateTeam(selectedTeam._id, {
                name,
                description,
            });

            await refreshTeamData(selectedTeam._id);

            setEditing(false);
            setSuccess("Team updated successfully.");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update team."
            );
        } finally {
            setSaving(false);
        }
    };

    // Add existing registered user
    const handleAddMember = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!selectedTeam) return;

        const email = memberEmail.trim().toLowerCase();

        if (!email || !email.includes("@")) {
            setError("Enter a valid email address.");
            return;
        }

        try {
            setAddingMember(true);
            setError("");
            setSuccess("");

            await addTeamMember(selectedTeam._id, email);

            await refreshTeamData(selectedTeam._id);

            setMemberEmail("");
            setSuccess("Member added successfully.");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to add member."
            );
        } finally {
            setAddingMember(false);
        }
    };

    // Change role
    const handleRoleChange = async (
        member: TeamMember,
        role: "manager" | "member"
    ) => {
        if (!selectedTeam) return;

        const userId = getUserId(member.user);

        if (!userId) return;

        try {
            setError("");
            setSuccess("");

            await updateTeamMemberRole(
                selectedTeam._id,
                userId,
                role
            );

            await refreshTeamData(selectedTeam._id);

            setSuccess("Member role updated.");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update role."
            );
        }
    };

    // Remove member
    const handleRemoveMember = async (
        member: TeamMember
    ) => {
        if (!selectedTeam) return;

        const userId = getUserId(member.user);

        if (!userId) return;

        const confirmed = window.confirm(
            `Remove ${getUserName(member.user)} from this team?`
        );

        if (!confirmed) return;

        try {
            setError("");
            setSuccess("");

            await removeTeamMember(selectedTeam._id, userId);

            await refreshTeamData(selectedTeam._id);

            setSuccess("Member removed successfully.");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to remove member."
            );
        }
    };

    // Delete team
    const handleDeleteTeam = async () => {
        if (!selectedTeam || !isOwner) return;

        const confirmed = window.confirm(
            `Delete "${selectedTeam.name}"? This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            setError("");
            setSuccess("");

            await deleteTeam(selectedTeam._id);

            const remaining = await getTeams();

            setTeams(remaining);

            if (remaining.length > 0) {
                setSelectedTeam(await getTeam(remaining[0]._id));
            } else {
                setSelectedTeam(null);
            }

            setSuccess("Team deleted successfully.");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to delete team."
            );
        }
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            setError("");

            const data = await getTeams();
            setTeams(data);

            if (selectedTeam) {
                const updated = await getTeam(selectedTeam._id);
                setSelectedTeam(updated);
            } else if (data.length > 0) {
                setSelectedTeam(await getTeam(data[0]._id));
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to refresh teams."
            );
        } finally {
            setRefreshing(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem("accessToken");
        router.replace("/");
    };

    return (
        <main className="min-h-screen bg-[#f7f8fc] text-slate-800">

            {/* Header */}
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">

                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#635bff] text-xl font-bold text-white">
                            T
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-slate-900">
                                WorkNest
                            </h1>
                            <p className="text-xs text-slate-400">
                                Team Management
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            ← Dashboard
                        </button>

                        <button
                            onClick={handleLogout}
                            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl space-y-7 p-5 sm:p-8">

                {/* Page heading */}
                <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-sm font-medium text-indigo-600">
                            Workspace / Teams
                        </p>

                        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                            Your Teams
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Collaborate with people and manage team access.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            {refreshing ? "Refreshing..." : "↻ Refresh"}
                        </button>

                        <button
                            onClick={() => {
                                setError("");
                                setSuccess("");
                                setShowCreateModal(true);
                            }}
                            className="rounded-xl bg-[#635bff] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700"
                        >
                            + Create Team
                        </button>
                    </div>
                </section>

                {/* Feedback */}
                {error && (
                    <div className="flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        <span>{error}</span>
                        <button
                            onClick={() => setError("")}
                            aria-label="Dismiss error"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {success && (
                    <div className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        <span>{success}</span>
                        <button
                            onClick={() => setSuccess("")}
                            aria-label="Dismiss success"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center">
                        <p className="text-sm text-slate-500">
                            Loading your teams...
                        </p>
                    </div>
                ) : (
                    <div className="grid items-start gap-6 lg:grid-cols-[320px_1fr]">

                        {/* Team list */}
                        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-5 flex items-center justify-between">
                                <h3 className="font-bold text-slate-900">
                                    All Teams
                                </h3>

                                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                                    {teams.length}
                                </span>
                            </div>

                            {teams.length === 0 ? (
                                <div className="py-10 text-center">
                                    <div className="text-4xl">♧</div>

                                    <h4 className="mt-4 font-bold text-slate-800">
                                        No teams yet
                                    </h4>

                                    <p className="mt-2 text-sm text-slate-400">
                                        Create a team to start collaborating.
                                    </p>

                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="mt-5 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                                    >
                                        Create your first team →
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {teams.map((team) => (
                                        <button
                                            key={team._id}
                                            onClick={() => handleSelectTeam(team._id)}
                                            className={`w-full rounded-xl border p-4 text-left transition ${selectedTeam?._id === team._id
                                                ? "border-indigo-200 bg-indigo-50"
                                                : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-lg font-bold text-indigo-700">
                                                    {team.name.charAt(0).toUpperCase()}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-bold text-slate-800">
                                                        {team.name}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        {team.members?.length || 0} members
                                                    </p>
                                                </div>

                                                <span className="text-slate-400">
                                                    →
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </aside>

                        {/* Team details */}
                        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

                            {!selectedTeam ? (
                                <div className="py-20 text-center">
                                    <div className="text-5xl">♧</div>

                                    <h3 className="mt-5 text-xl font-bold text-slate-800">
                                        Select a team
                                    </h3>

                                    <p className="mt-2 text-sm text-slate-400">
                                        Select a team to view its members and settings.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Team heading */}
                                    <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-start">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h3 className="break-words text-2xl font-bold text-slate-900">
                                                    {selectedTeam.name}
                                                </h3>

                                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getRoleStyle(myRole)}`}>
                                                    {myRole}
                                                </span>
                                            </div>

                                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-500">
                                                {selectedTeam.description || "No team description provided."}
                                            </p>

                                            <p className="mt-3 text-xs text-slate-400">
                                                Created{" "}
                                                {new Date(selectedTeam.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>

                                        {canManage && (
                                            <div className="flex shrink-0 flex-wrap gap-2">
                                                <button
                                                    onClick={startEditing}
                                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                                                >
                                                    Edit
                                                </button>

                                                {isOwner && (
                                                    <button
                                                        onClick={handleDeleteTeam}
                                                        className="rounded-lg px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Edit form */}
                                    {editing && (
                                        <form
                                            onSubmit={handleUpdateTeam}
                                            className="mt-6 space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-5"
                                        >
                                            <h4 className="font-bold text-slate-800">
                                                Edit team details
                                            </h4>

                                            <div>
                                                <label className="mb-2 block text-sm font-semibold text-slate-600">
                                                    Team name
                                                </label>

                                                <input
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    maxLength={100}
                                                    required
                                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-semibold text-slate-600">
                                                    Description
                                                </label>

                                                <textarea
                                                    value={editDescription}
                                                    onChange={(e) => setEditDescription(e.target.value)}
                                                    maxLength={1000}
                                                    rows={3}
                                                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400"
                                                />
                                            </div>

                                            <div className="flex gap-3">
                                                <button
                                                    type="submit"
                                                    disabled={saving}
                                                    className="rounded-xl bg-[#635bff] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                                                >
                                                    {saving ? "Saving..." : "Save changes"}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setEditing(false)}
                                                    disabled={saving}
                                                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                    {/* Member summary */}
                                    <div className="mt-7 grid gap-4 sm:grid-cols-3">
                                        {[
                                            {
                                                label: "Total Members",
                                                value: selectedTeam.members?.length || 0,
                                            },
                                            {
                                                label: "Managers",
                                                value: selectedTeam.members?.filter(
                                                    (m) => m.role === "manager"
                                                ).length || 0,
                                            },
                                            {
                                                label: "Members",
                                                value: selectedTeam.members?.filter(
                                                    (m) => m.role === "member"
                                                ).length || 0,
                                            },
                                        ].map((item) => (
                                            <div
                                                key={item.label}
                                                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                                            >
                                                <p className="text-sm text-slate-500">
                                                    {item.label}
                                                </p>

                                                <p className="mt-2 text-2xl font-bold text-slate-900">
                                                    {item.value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add member */}
                                    {canManage && (
                                        <section className="mt-8 rounded-xl border border-slate-200 p-5">
                                            <h4 className="font-bold text-slate-900">
                                                Add team member
                                            </h4>

                                            <p className="mt-1 text-sm text-slate-400">
                                                Add someone who already has a registered WorkNest account.
                                            </p>

                                            <form
                                                onSubmit={handleAddMember}
                                                className="mt-4 flex flex-col gap-3 sm:flex-row"
                                            >
                                                <input
                                                    type="email"
                                                    value={memberEmail}
                                                    onChange={(e) => setMemberEmail(e.target.value)}
                                                    placeholder="Enter registered user's email"
                                                    required
                                                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-400"
                                                />

                                                <button
                                                    type="submit"
                                                    disabled={addingMember}
                                                    className="rounded-xl bg-[#635bff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                                                >
                                                    {addingMember ? "Adding..." : "+ Add Member"}
                                                </button>
                                            </form>
                                        </section>
                                    )}

                                    {/* Members */}
                                    <section className="mt-8">
                                        <div className="mb-5 flex items-center justify-between">
                                            <div>
                                                <h4 className="text-lg font-bold text-slate-900">
                                                    Team Members
                                                </h4>

                                                <p className="mt-1 text-sm text-slate-400">
                                                    People who belong to this team.
                                                </p>
                                            </div>
                                        </div>

                                        {!selectedTeam.members?.length ? (
                                            <div className="rounded-xl bg-slate-50 py-10 text-center text-sm text-slate-400">
                                                No members found.
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {selectedTeam.members.map((member, index) => {
                                                    const memberId = getUserId(member.user);
                                                    const isSelf = memberId === currentUserId;
                                                    const isMemberOwner = member.role === "owner";

                                                    const canChangeRole =
                                                        isOwner &&
                                                        !isMemberOwner &&
                                                        !isSelf;

                                                    const canRemove =
                                                        !isMemberOwner &&
                                                        (
                                                            isOwner ||
                                                            (
                                                                myRole === "manager" &&
                                                                member.role === "member"
                                                            )
                                                        );

                                                    return (
                                                        <article
                                                            key={memberId || index}
                                                            className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center"
                                                        >
                                                            <div className="flex min-w-0 items-center gap-3">
                                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                                                                    {getUserName(member.user).charAt(0).toUpperCase()}
                                                                </div>

                                                                <div className="min-w-0">
                                                                    <p className="break-all text-sm font-bold text-slate-800">
                                                                        {getUserName(member.user)}
                                                                        {isSelf && (
                                                                            <span className="ml-2 text-xs font-medium text-indigo-600">
                                                                                You
                                                                            </span>
                                                                        )}
                                                                    </p>

                                                                    <p className="break-all text-xs text-slate-400">
                                                                        {getUserEmail(member.user)}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getRoleStyle(member.role)}`}>
                                                                    {member.role}
                                                                </span>

                                                                {canChangeRole && (
                                                                    <select
                                                                        value={member.role}
                                                                        onChange={(e) =>
                                                                            handleRoleChange(
                                                                                member,
                                                                                e.target.value as "manager" | "member"
                                                                            )
                                                                        }
                                                                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-400"
                                                                    >
                                                                        <option value="member">
                                                                            Member
                                                                        </option>

                                                                        <option value="manager">
                                                                            Manager
                                                                        </option>
                                                                    </select>
                                                                )}

                                                                {canRemove && (
                                                                    <button
                                                                        onClick={() => handleRemoveMember(member)}
                                                                        className="rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </article>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </section>
                                </>
                            )}
                        </section>
                    </div>
                )}
            </div>

            {/* Create team modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8">

                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    Create a team
                                </h3>

                                <p className="mt-1 text-sm text-slate-400">
                                    Set up a new team workspace.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowCreateModal(false)}
                                disabled={creating}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                                aria-label="Close modal"
                            >
                                ✕
                            </button>
                        </div>

                        <form
                            onSubmit={handleCreateTeam}
                            className="space-y-5"
                        >
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Team name
                                </label>

                                <input
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    placeholder="e.g. Engineering Team"
                                    maxLength={100}
                                    required
                                    autoFocus
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-400"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Description
                                </label>

                                <textarea
                                    value={teamDescription}
                                    onChange={(e) => setTeamDescription(e.target.value)}
                                    placeholder="What is this team working on?"
                                    maxLength={1000}
                                    rows={4}
                                    className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-400"
                                />
                            </div>

                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    disabled={creating}
                                    onClick={() => setShowCreateModal(false)}
                                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="rounded-xl bg-[#635bff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {creating ? "Creating..." : "Create Team"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
