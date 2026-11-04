
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    getProjects,
    createProject,
    type Project,
} from "@/lib/projects";

const tasks = [
    {
        title: "Finalize landing page design",
        project: "Website Redesign",
        priority: "High",
        due: "Today",
        color: "bg-rose-100 text-rose-700",
    },
    {
        title: "Review API documentation",
        project: "Mobile Application",
        priority: "Medium",
        due: "Tomorrow",
        color: "bg-amber-100 text-amber-700",
    },
    {
        title: "Prepare campaign report",
        project: "Marketing Campaign",
        priority: "Low",
        due: "Nov 08",
        color: "bg-emerald-100 text-emerald-700",
    },
];

const navigation = [
    { label: "Dashboard", icon: "▦" },
    { label: "My Tasks", icon: "☑" },
    { label: "Projects", icon: "▤" },
    { label: "Team", icon: "♧" },
];

export default function DashboardPage() {
    const router = useRouter();

    // Project states
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [projectsError, setProjectsError] = useState("");

    // Dashboard states
    const [activePage, setActivePage] = useState("Dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showProjectModal, setShowProjectModal] = useState(false);

    // Create project form states
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [projectStatus, setProjectStatus] =
        useState<Project["status"]>("active");
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [createProjectError, setCreateProjectError] = useState("");

    // Fetch projects from backend
    useEffect(() => {
        const fetchUserProjects = async () => {
            try {
                setProjectsLoading(true);
                setProjectsError("");

                const data = await getProjects();
                setProjects(data);
            } catch (error) {
                setProjectsError(
                    error instanceof Error
                        ? error.message
                        : "Something went wrong"
                );
            } finally {
                setProjectsLoading(false);
            }
        };

        fetchUserProjects();
    }, []);

    // Logout
    const handleLogout = () => {
        sessionStorage.removeItem("accessToken");
        router.replace("/");
    };

    // Sidebar navigation
    const handleNavigation = (page: string) => {
        setActivePage(page);
        setSidebarOpen(false);
    };

    // Open project modal
    const openProjectModal = () => {
        setProjectName("");
        setProjectDescription("");
        setProjectStatus("active");
        setCreateProjectError("");
        setShowProjectModal(true);
    };

    // Close project modal
    const closeProjectModal = () => {
        if (isCreatingProject) return;

        setShowProjectModal(false);
        setProjectName("");
        setProjectDescription("");
        setProjectStatus("active");
        setCreateProjectError("");
    };

    // Create project
    const handleCreateProject = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const trimmedName = projectName.trim();
        const trimmedDescription = projectDescription.trim();

        if (trimmedName.length < 2) {
            setCreateProjectError(
                "Project name must contain at least 2 characters."
            );
            return;
        }

        if (trimmedName.length > 100) {
            setCreateProjectError(
                "Project name cannot exceed 100 characters."
            );
            return;
        }

        if (trimmedDescription.length > 1000) {
            setCreateProjectError(
                "Description cannot exceed 1000 characters."
            );
            return;
        }

        try {
            setIsCreatingProject(true);
            setCreateProjectError("");

            const newProject = await createProject({
                name: trimmedName,
                description: trimmedDescription,
                status: projectStatus,
            });

            // Add the newly created project to the dashboard
            setProjects((previousProjects) => [
                newProject,
                ...previousProjects,
            ]);

            // Close and reset the modal
            setShowProjectModal(false);
            setProjectName("");
            setProjectDescription("");
            setProjectStatus("active");
        } catch (error) {
            setCreateProjectError(
                error instanceof Error
                    ? error.message
                    : "Failed to create project. Please try again."
            );
        } finally {
            setIsCreatingProject(false);
        }
    };

    // Project status styling
    const getStatusStyle = (status: Project["status"]) => {
        switch (status) {
            case "completed":
                return "bg-emerald-50 text-emerald-700";

            case "on-hold":
                return "bg-amber-50 text-amber-700";

            default:
                return "bg-indigo-50 text-indigo-700";
        }
    };

    const getStatusLabel = (status: Project["status"]) => {
        switch (status) {
            case "completed":
                return "Completed";

            case "on-hold":
                return "On Hold";

            default:
                return "Active";
        }
    };

    return (
        <main className="min-h-screen bg-[#f7f8fc] text-slate-800">

            {/* Mobile overlay */}
            {sidebarOpen && (
                <button
                    aria-label="Close sidebar"
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } lg:translate-x-0`}
            >
                {/* Brand */}
                <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#635bff] text-xl font-bold text-white">
                        T
                    </div>

                    <span className="text-2xl font-bold tracking-tight text-slate-900">
                        TaskFlow
                    </span>
                </div>

                {/* Workspace */}
                <div className="border-b border-slate-100 p-4">
                    <button
                        onClick={() => handleNavigation("Dashboard")}
                        className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left hover:bg-slate-50"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 font-bold text-indigo-700">
                            W
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">
                                My Workspace
                            </p>

                            <p className="text-xs text-slate-400">
                                Free Plan
                            </p>
                        </div>

                        <span className="text-slate-400">⌄</span>
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 p-4">
                    <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Workspace
                    </p>

                    <nav className="space-y-1">
                        {navigation.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => handleNavigation(item.label)}
                                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${activePage === item.label
                                        ? "bg-indigo-50 text-indigo-700"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                            >
                                <span className="text-lg">
                                    {item.icon}
                                </span>

                                {item.label}
                            </button>
                        ))}
                    </nav>

                    {/* Preferences */}
                    <div className="mt-9">
                        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Preferences
                        </p>

                        <button
                            onClick={() => handleNavigation("Settings")}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${activePage === "Settings"
                                    ? "bg-indigo-50 text-indigo-700"
                                    : "text-slate-500 hover:bg-slate-50"
                                }`}
                        >
                            <span className="text-lg">⚙</span>
                            Settings
                        </button>
                    </div>
                </div>

                {/* User profile and logout */}
                <div className="border-t border-slate-100 p-4">
                    <div className="flex items-center gap-3 rounded-xl p-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                            V
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">
                                TaskFlow User
                            </p>

                            <p className="truncate text-xs text-slate-400">
                                user@example.com
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                    >
                        <span className="text-lg">↪</span>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main area */}
            <section className="min-h-screen lg:ml-64">

                {/* Top bar */}
                <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="rounded-lg p-2 text-xl hover:bg-slate-100 lg:hidden"
                            aria-label="Open sidebar"
                        >
                            ☰
                        </button>

                        <div>
                            <p className="text-sm text-slate-400">
                                Workspace / {activePage}
                            </p>

                            <h1 className="text-lg font-bold text-slate-900">
                                {activePage}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:block">
                            <input
                                type="search"
                                placeholder="Search anything..."
                                className="w-56 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400"
                            />
                        </div>

                        <button
                            aria-label="Notifications"
                            className="relative rounded-xl border border-slate-200 p-2.5 hover:bg-slate-50"
                        >
                            ♧
                            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
                        </button>

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                            V
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <div className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8">

                    {activePage === "Dashboard" ? (
                        <>
                            {/* Welcome */}
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                        Good morning, Vasim 👋
                                    </h2>

                                    <p className="mt-2 text-sm text-slate-500">
                                        Here's what's happening with your projects today.
                                    </p>
                                </div>

                                <button
                                    onClick={openProjectModal}
                                    className="rounded-xl bg-[#635bff] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700"
                                >
                                    + New Project
                                </button>
                            </div>

                            {/* Statistics */}
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                {[
                                    {
                                        label: "Total Projects",
                                        value: "12",
                                        detail: "+2 this month",
                                        icon: "▤",
                                    },
                                    {
                                        label: "Total Tasks",
                                        value: "48",
                                        detail: "Across all projects",
                                        icon: "☑",
                                    },
                                    {
                                        label: "Completed Tasks",
                                        value: "32",
                                        detail: "66.7% completion",
                                        icon: "✓",
                                    },
                                    {
                                        label: "Pending Tasks",
                                        value: "16",
                                        detail: "Need your attention",
                                        icon: "◷",
                                    },
                                ].map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                                    >
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-slate-500">
                                                {stat.label}
                                            </p>

                                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg text-indigo-600">
                                                {stat.icon}
                                            </span>
                                        </div>

                                        <p className="mt-4 text-3xl font-bold text-slate-900">
                                            {stat.value}
                                        </p>

                                        <p className="mt-2 text-xs text-slate-400">
                                            {stat.detail}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Recent Projects */}
                            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                <div className="mb-6 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">
                                            Recent Projects
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-400">
                                            Track progress across your projects.
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => handleNavigation("Projects")}
                                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                                    >
                                        View all
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {projectsLoading ? (
                                        <p className="py-6 text-center text-sm text-slate-400">
                                            Loading projects...
                                        </p>
                                    ) : projectsError ? (
                                        <p className="py-6 text-center text-sm text-rose-600">
                                            {projectsError}
                                        </p>
                                    ) : projects.length === 0 ? (
                                        <p className="py-6 text-center text-sm text-slate-400">
                                            No projects yet. Create your first project!
                                        </p>
                                    ) : (
                                        projects.slice(0, 3).map((project) => (
                                            <div
                                                key={project._id}
                                                className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-5 last:border-0 last:pb-0 sm:flex-row sm:items-center"
                                            >
                                                <div>
                                                    <p className="font-semibold text-slate-800">
                                                        {project.name}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        {project.description || "No description"}
                                                    </p>

                                                    <p className="mt-2 text-xs text-slate-400">
                                                        Created{" "}
                                                        {new Date(
                                                            project.createdAt
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                                                        project.status
                                                    )}`}
                                                >
                                                    {getStatusLabel(project.status)}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>

                            {/* Upcoming tasks */}
                            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-slate-900">
                                        Upcoming Tasks
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Keep track of your next priorities.
                                    </p>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[540px] text-left">
                                        <thead>
                                            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                                                <th className="pb-4 font-semibold">
                                                    Task
                                                </th>

                                                <th className="pb-4 font-semibold">
                                                    Project
                                                </th>

                                                <th className="pb-4 font-semibold">
                                                    Priority
                                                </th>

                                                <th className="pb-4 font-semibold">
                                                    Due date
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {tasks.map((task) => (
                                                <tr
                                                    key={task.title}
                                                    className="border-b border-slate-50 last:border-0"
                                                >
                                                    <td className="py-4 text-sm font-semibold text-slate-700">
                                                        {task.title}
                                                    </td>

                                                    <td className="py-4 text-sm text-slate-500">
                                                        {task.project}
                                                    </td>

                                                    <td className="py-4">
                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${task.color}`}
                                                        >
                                                            {task.priority}
                                                        </span>
                                                    </td>

                                                    <td className="py-4 text-sm text-slate-500">
                                                        {task.due}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </>
                    ) : (
                        /* Other navigation pages */
                        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-slate-900">
                                {activePage}
                            </h2>

                            <p className="mt-3 text-slate-500">
                                {activePage === "My Tasks" &&
                                    "Manage and track all your assigned tasks here."}

                                {activePage === "Projects" &&
                                    "Create, organize and manage your projects here."}

                                {activePage === "Team" &&
                                    "View and manage your workspace team members here."}

                                {activePage === "Settings" &&
                                    "Manage your profile and application preferences here."}
                            </p>

                            <div className="mt-6 rounded-xl bg-slate-50 p-5">
                                <p className="text-sm text-slate-500">
                                    This section will become fully functional in the upcoming development milestones.
                                </p>
                            </div>

                            {activePage === "Projects" && (
                                <button
                                    onClick={openProjectModal}
                                    className="mt-6 rounded-xl bg-[#635bff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                                >
                                    + New Project
                                </button>
                            )}
                        </section>
                    )}
                </div>
            </section>

            {/* Create Project Modal */}
            {showProjectModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

                        {/* Modal heading */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900">
                                Create a project
                            </h3>

                            <button
                                type="button"
                                onClick={closeProjectModal}
                                disabled={isCreatingProject}
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Close modal"
                            >
                                ✕
                            </button>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                            Add a new project to your workspace.
                        </p>

                        {/* Project form */}
                        <form
                            onSubmit={handleCreateProject}
                            className="mt-5 space-y-4"
                        >
                            {/* Project name */}
                            <div>
                                <label
                                    htmlFor="projectName"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Project name *
                                </label>

                                <input
                                    id="projectName"
                                    type="text"
                                    value={projectName}
                                    onChange={(event) =>
                                        setProjectName(event.target.value)
                                    }
                                    placeholder="e.g. Website Redesign"
                                    minLength={2}
                                    maxLength={100}
                                    required
                                    autoFocus
                                    disabled={isCreatingProject}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label
                                    htmlFor="projectDescription"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Description
                                    <span className="ml-1 font-normal text-slate-400">
                                        (Optional)
                                    </span>
                                </label>

                                <textarea
                                    id="projectDescription"
                                    value={projectDescription}
                                    onChange={(event) =>
                                        setProjectDescription(event.target.value)
                                    }
                                    placeholder="What is this project about?"
                                    maxLength={1000}
                                    rows={3}
                                    disabled={isCreatingProject}
                                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label
                                    htmlFor="projectStatus"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Project status
                                </label>

                                <select
                                    id="projectStatus"
                                    value={projectStatus}
                                    onChange={(event) =>
                                        setProjectStatus(
                                            event.target.value as Project["status"]
                                        )
                                    }
                                    disabled={isCreatingProject}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                                >
                                    <option value="active">Active</option>
                                    <option value="on-hold">On Hold</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            {/* API / validation error */}
                            {createProjectError && (
                                <p
                                    role="alert"
                                    className="rounded-lg bg-rose-50 p-3 text-sm text-rose-600"
                                >
                                    {createProjectError}
                                </p>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeProjectModal}
                                    disabled={isCreatingProject}
                                    className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={isCreatingProject}
                                    className="flex-1 rounded-xl bg-[#635bff] py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isCreatingProject
                                        ? "Creating..."
                                        : "Create Project"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </main>
    );
}
