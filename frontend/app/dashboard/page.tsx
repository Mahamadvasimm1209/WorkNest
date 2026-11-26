
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";

import {
    getProjects,
    createProject,
    deleteProject,
    type Project,
} from "@/lib/projects";

import { getTasks, type Task } from "@/lib/tasks";

const navigation = [
    { label: "Dashboard", icon: "▦" },
    { label: "My Tasks", icon: "☑" },
    { label: "Projects", icon: "▤" },
    { label: "Team", icon: "♧" },
];

type StatusFilter = "all" | Project["status"];
type SortOrder = "newest" | "oldest";

export default function DashboardPage() {
    const router = useRouter();

    // Project state
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [projectsError, setProjectsError] = useState("");

    // Task state
    const [tasks, setTasks] = useState<Task[]>([]);
    const [tasksLoading, setTasksLoading] = useState(true);
    const [tasksError, setTasksError] = useState("");

    // Navigation
    const [activePage, setActivePage] = useState("Dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Project search, filter and sorting
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] =
        useState<StatusFilter>("all");
    const [sortOrder, setSortOrder] =
        useState<SortOrder>("newest");

    // Create project modal
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [projectStatus, setProjectStatus] =
        useState<Project["status"]>("active");
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [createProjectError, setCreateProjectError] = useState("");

    // Delete project modal
    const [projectToDelete, setProjectToDelete] =
        useState<Project | null>(null);
    const [isDeletingProject, setIsDeletingProject] = useState(false);
    const [deleteProjectError, setDeleteProjectError] = useState("");

    // Fetch projects
    const fetchUserProjects = useCallback(async () => {
        try {
            setProjectsLoading(true);
            setProjectsError("");

            const data = await getProjects();
            setProjects(data);
        } catch (error) {
            setProjectsError(
                error instanceof Error
                    ? error.message
                    : "Failed to load projects."
            );
        } finally {
            setProjectsLoading(false);
        }
    }, []);

    // Fetch real tasks
    const fetchUserTasks = useCallback(async () => {
        try {
            setTasksLoading(true);
            setTasksError("");

            const data = await getTasks();
            setTasks(data);
        } catch (error) {
            setTasksError(
                error instanceof Error
                    ? error.message
                    : "Failed to load tasks."
            );
        } finally {
            setTasksLoading(false);
        }
    }, []);

    // Initial data loading
    useEffect(() => {
        fetchUserProjects();
        fetchUserTasks();
    }, [fetchUserProjects, fetchUserTasks]);

    // Logout
    const handleLogout = () => {
        sessionStorage.removeItem("accessToken");
        router.replace("/");
    };

    // Navigation
    // Navigation
    const handleNavigation = (page: string) => {
        setSidebarOpen(false);

        if (page === "My Tasks") {
            router.push("/dashboard/tasks");
            return;
        }

        if (page === "Team") {
            router.push("/dashboard/teams");
            return;
        }

        if (page === "Settings") {
            router.push("/dashboard/settings");
            return;
        }

        setActivePage(page);
    };

    // Create project modal
    const openProjectModal = () => {
        setProjectName("");
        setProjectDescription("");
        setProjectStatus("active");
        setCreateProjectError("");
        setShowProjectModal(true);
    };

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

        if (trimmedName.length < 2 || trimmedName.length > 100) {
            setCreateProjectError(
                "Project name must contain 2 to 100 characters."
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

            setProjects((previous) => [newProject, ...previous]);

            setShowProjectModal(false);
            setProjectName("");
            setProjectDescription("");
            setProjectStatus("active");

            setActivePage("Projects");
        } catch (error) {
            setCreateProjectError(
                error instanceof Error
                    ? error.message
                    : "Failed to create project."
            );
        } finally {
            setIsCreatingProject(false);
        }
    };

    // Open delete confirmation
    const openDeleteModal = (project: Project) => {
        setProjectToDelete(project);
        setDeleteProjectError("");
    };

    // Close delete confirmation
    const closeDeleteModal = () => {
        if (isDeletingProject) return;

        setProjectToDelete(null);
        setDeleteProjectError("");
    };

    // Delete project
    const handleDeleteProject = async () => {
        if (!projectToDelete) return;

        try {
            setIsDeletingProject(true);
            setDeleteProjectError("");

            await deleteProject(projectToDelete._id);

            setProjects((previous) =>
                previous.filter(
                    (project) => project._id !== projectToDelete._id
                )
            );

            setProjectToDelete(null);
        } catch (error) {
            setDeleteProjectError(
                error instanceof Error
                    ? error.message
                    : "Failed to delete project."
            );
        } finally {
            setIsDeletingProject(false);
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

    // Project statistics
    const activeProjects = projects.filter(
        (project) => project.status === "active"
    ).length;

    const completedProjects = projects.filter(
        (project) => project.status === "completed"
    ).length;

    const onHoldProjects = projects.filter(
        (project) => project.status === "on-hold"
    ).length;

    // Task statistics
    const completedTasks = tasks.filter(
        (task) => task.status === "completed"
    ).length;

    const pendingTasks = tasks.filter(
        (task) => task.status !== "completed"
    ).length;

    // Search, filter and sorting
    const filteredProjects = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return projects
            .filter((project) => {
                const matchesSearch =
                    project.name.toLowerCase().includes(query) ||
                    (project.description || "").toLowerCase().includes(query);

                const matchesStatus =
                    statusFilter === "all" ||
                    project.status === statusFilter;

                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();

                return sortOrder === "newest"
                    ? dateB - dateA
                    : dateA - dateB;
            });
    }, [projects, searchQuery, statusFilter, sortOrder]);

    // Upcoming tasks: incomplete tasks, ordered by due date
    const upcomingTasks = useMemo(() => {
        return [...tasks]
            .filter((task) => task.status !== "completed")
            .sort((a, b) => {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;

                return (
                    new Date(a.dueDate).getTime() -
                    new Date(b.dueDate).getTime()
                );
            })
            .slice(0, 5);
    }, [tasks]);

    const getTaskProjectName = (task: Task) => {
        return typeof task.project === "string"
            ? "Project"
            : task.project?.name || "Project";
    };

    const getTaskPriorityStyle = (priority: Task["priority"]) => {
        switch (priority) {
            case "high":
                return "bg-rose-100 text-rose-700";

            case "medium":
                return "bg-amber-100 text-amber-700";

            default:
                return "bg-emerald-100 text-emerald-700";
        }
    };

    const formatTaskDate = (date: string | null) => {
        if (!date) return "No due date";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
        });
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
                {/* Logo */}
                <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#635bff] text-xl font-bold text-white">
                        T
                    </div>

                    <span className="text-2xl font-bold tracking-tight text-slate-900">
                        WorkNest
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
                                <span className="text-lg">{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </nav>

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

                {/* Profile */}
                <div className="border-t border-slate-100 p-4">
                    <div className="flex items-center gap-3 rounded-xl p-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                            V
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">
                                WorkNest User
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
                                value={searchQuery}
                                onChange={(event) =>
                                    setSearchQuery(event.target.value)
                                }
                                placeholder="Search projects..."
                                className="w-56 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400"
                            />
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                            V
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8">

                    {/* DASHBOARD */}
                    {activePage === "Dashboard" && (
                        <>
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
                                        value: projects.length,
                                        detail: "Your workspace projects",
                                        icon: "▤",
                                    },
                                    {
                                        label: "Active Projects",
                                        value: activeProjects,
                                        detail: "Currently in progress",
                                        icon: "◷",
                                    },
                                    {
                                        label: "Completed Tasks",
                                        value: completedTasks,
                                        detail: "Successfully completed",
                                        icon: "✓",
                                    },
                                    {
                                        label: "Pending Tasks",
                                        value: pendingTasks,
                                        detail: "Tasks still to complete",
                                        icon: "Ⅱ",
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
                                            {projectsLoading || tasksLoading
                                                ? "—"
                                                : stat.value}
                                        </p>

                                        <p className="mt-2 text-xs text-slate-400">
                                            {stat.detail}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Recent projects */}
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
                                        View all →
                                    </button>
                                </div>

                                {projectsLoading ? (
                                    <p className="py-6 text-center text-sm text-slate-400">
                                        Loading projects...
                                    </p>
                                ) : projectsError ? (
                                    <div className="py-6 text-center">
                                        <p className="text-sm text-rose-600">
                                            {projectsError}
                                        </p>
                                        <button
                                            onClick={fetchUserProjects}
                                            className="mt-3 text-sm font-semibold text-indigo-600"
                                        >
                                            Try again
                                        </button>
                                    </div>
                                ) : projects.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <p className="text-slate-500">
                                            No projects yet.
                                        </p>
                                        <button
                                            onClick={openProjectModal}
                                            className="mt-3 text-sm font-semibold text-indigo-600"
                                        >
                                            Create your first project
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        {projects.slice(0, 3).map((project) => (
                                            <div
                                                key={project._id}
                                                className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-5 last:border-0 last:pb-0 sm:flex-row sm:items-center"
                                            >
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-800">
                                                        {project.name}
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-400">
                                                        {project.description || "No description"}
                                                    </p>
                                                    <p className="mt-2 text-xs text-slate-400">
                                                        Created{" "}
                                                        {new Date(project.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(project.status)}`}
                                                >
                                                    {getStatusLabel(project.status)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Upcoming tasks */}
                            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">
                                            Upcoming Tasks
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-400">
                                            Your next incomplete tasks.
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => router.push("/dashboard/tasks")}
                                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                                    >
                                        View all →
                                    </button>
                                </div>

                                {tasksLoading ? (
                                    <p className="py-6 text-center text-sm text-slate-400">
                                        Loading tasks...
                                    </p>
                                ) : tasksError ? (
                                    <div className="py-6 text-center">
                                        <p className="text-sm text-rose-600">
                                            {tasksError}
                                        </p>
                                        <button
                                            onClick={fetchUserTasks}
                                            className="mt-3 text-sm font-semibold text-indigo-600"
                                        >
                                            Try again
                                        </button>
                                    </div>
                                ) : upcomingTasks.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <p className="text-slate-500">
                                            No pending tasks yet.
                                        </p>
                                        <button
                                            onClick={() => router.push("/dashboard/tasks")}
                                            className="mt-3 text-sm font-semibold text-indigo-600"
                                        >
                                            Open My Tasks
                                        </button>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[540px] text-left">
                                            <thead>
                                                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                                                    <th className="pb-4 font-semibold">Task</th>
                                                    <th className="pb-4 font-semibold">Project</th>
                                                    <th className="pb-4 font-semibold">Priority</th>
                                                    <th className="pb-4 font-semibold">Due date</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {upcomingTasks.map((task) => (
                                                    <tr
                                                        key={task._id}
                                                        className="border-b border-slate-50 last:border-0"
                                                    >
                                                        <td className="py-4 text-sm font-semibold text-slate-700">
                                                            {task.title}
                                                        </td>

                                                        <td className="py-4 text-sm text-slate-500">
                                                            {getTaskProjectName(task)}
                                                        </td>

                                                        <td className="py-4">
                                                            <span
                                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${getTaskPriorityStyle(task.priority)}`}
                                                            >
                                                                {task.priority}
                                                            </span>
                                                        </td>

                                                        <td className="py-4 text-sm text-slate-500">
                                                            {formatTaskDate(task.dueDate)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </section>
                        </>
                    )}

                    {/* PROJECTS MANAGEMENT */}
                    {activePage === "Projects" && (
                        <>
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        My Projects
                                    </h2>
                                    <p className="mt-2 text-sm text-slate-500">
                                        Create, organize, search and manage your projects.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={fetchUserProjects}
                                        disabled={projectsLoading}
                                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                                    >
                                        ↻ Refresh
                                    </button>

                                    <button
                                        onClick={openProjectModal}
                                        className="rounded-xl bg-[#635bff] px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                                    >
                                        + New Project
                                    </button>
                                </div>
                            </div>

                            {/* Project summary */}
                            <div className="grid gap-4 sm:grid-cols-3">
                                {[
                                    { label: "Active", value: activeProjects },
                                    { label: "On Hold", value: onHoldProjects },
                                    { label: "Completed", value: completedProjects },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className="rounded-2xl border border-slate-200 bg-white p-5"
                                    >
                                        <p className="text-sm text-slate-500">
                                            {item.label}
                                        </p>
                                        <p className="mt-2 text-2xl font-bold text-slate-900">
                                            {projectsLoading ? "—" : item.value}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Search and filters */}
                            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div>
                                        <label
                                            htmlFor="projectSearch"
                                            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400"
                                        >
                                            Search projects
                                        </label>
                                        <input
                                            id="projectSearch"
                                            type="search"
                                            value={searchQuery}
                                            onChange={(event) =>
                                                setSearchQuery(event.target.value)
                                            }
                                            placeholder="Search name or description..."
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-400"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="statusFilter"
                                            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400"
                                        >
                                            Filter by status
                                        </label>
                                        <select
                                            id="statusFilter"
                                            value={statusFilter}
                                            onChange={(event) =>
                                                setStatusFilter(event.target.value as StatusFilter)
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400"
                                        >
                                            <option value="all">All statuses</option>
                                            <option value="active">Active</option>
                                            <option value="on-hold">On Hold</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="sortOrder"
                                            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400"
                                        >
                                            Sort projects
                                        </label>
                                        <select
                                            id="sortOrder"
                                            value={sortOrder}
                                            onChange={(event) =>
                                                setSortOrder(event.target.value as SortOrder)
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400"
                                        >
                                            <option value="newest">Newest first</option>
                                            <option value="oldest">Oldest first</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* Project list */}
                            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">
                                            All Projects
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-400">
                                            {filteredProjects.length} of {projects.length} projects
                                        </p>
                                    </div>

                                    {(searchQuery || statusFilter !== "all") && (
                                        <button
                                            onClick={() => {
                                                setSearchQuery("");
                                                setStatusFilter("all");
                                            }}
                                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </div>

                                {projectsLoading ? (
                                    <div className="py-16 text-center">
                                        <p className="text-sm text-slate-500">
                                            Loading your projects...
                                        </p>
                                    </div>
                                ) : projectsError ? (
                                    <div className="py-12 text-center">
                                        <p className="text-sm text-rose-600">
                                            {projectsError}
                                        </p>
                                        <button
                                            onClick={fetchUserProjects}
                                            className="mt-4 rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700"
                                        >
                                            Try again
                                        </button>
                                    </div>
                                ) : projects.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <div className="text-4xl">▤</div>
                                        <h4 className="mt-4 font-bold text-slate-800">
                                            No projects yet
                                        </h4>
                                        <p className="mt-2 text-sm text-slate-400">
                                            Create your first project to get started.
                                        </p>
                                        <button
                                            onClick={openProjectModal}
                                            className="mt-5 rounded-xl bg-[#635bff] px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                                        >
                                            + Create Project
                                        </button>
                                    </div>
                                ) : filteredProjects.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <h4 className="font-bold text-slate-800">
                                            No matching projects
                                        </h4>
                                        <p className="mt-2 text-sm text-slate-400">
                                            Try changing your search or filter.
                                        </p>
                                        <button
                                            onClick={() => {
                                                setSearchQuery("");
                                                setStatusFilter("all");
                                            }}
                                            className="mt-4 text-sm font-semibold text-indigo-600"
                                        >
                                            Clear filters
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid gap-4 lg:grid-cols-2">
                                        {filteredProjects.map((project) => (
                                            <article
                                                key={project._id}
                                                className="rounded-2xl border border-slate-200 p-5 transition hover:border-indigo-200 hover:shadow-md"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <h4 className="break-words text-base font-bold text-slate-900">
                                                            {project.name}
                                                        </h4>
                                                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-500">
                                                            {project.description || "No description provided."}
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(project.status)}`}
                                                    >
                                                        {getStatusLabel(project.status)}
                                                    </span>
                                                </div>

                                                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                                                    <p className="text-xs text-slate-400">
                                                        Created{" "}
                                                        {new Date(project.createdAt).toLocaleDateString()}
                                                    </p>

                                                    <button
                                                        onClick={() => openDeleteModal(project)}
                                                        className="rounded-lg px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                                                    >
                                                        Delete project
                                                    </button>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </>
                    )}

                    {/* TEAM AND SETTINGS PLACEHOLDERS */}
                    {activePage !== "Dashboard" &&
                        activePage !== "Projects" && (
                            <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                                <h2 className="text-2xl font-bold text-slate-900">
                                    {activePage}
                                </h2>

                                <p className="mt-3 text-slate-500">
                                    {activePage === "Team" &&
                                        "View and manage your workspace team members here."}

                                    {activePage === "Settings" &&
                                        "Manage your profile and application preferences here."}
                                </p>

                                <div className="mt-6 rounded-xl bg-slate-50 p-5">
                                    <p className="text-sm text-slate-500">
                                        This feature will be implemented in an upcoming development phase.
                                    </p>
                                </div>
                            </section>
                        )}
                </div>
            </section>

            {/* CREATE PROJECT MODAL */}
            {showProjectModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900">
                                Create a project
                            </h3>

                            <button
                                type="button"
                                onClick={closeProjectModal}
                                disabled={isCreatingProject}
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                                aria-label="Close modal"
                            >
                                ✕
                            </button>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                            Add a new project to your workspace.
                        </p>

                        <form
                            onSubmit={handleCreateProject}
                            className="mt-5 space-y-4"
                        >
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
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="projectDescription"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Description (Optional)
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
                                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                                />
                            </div>

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
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                                >
                                    <option value="active">Active</option>
                                    <option value="on-hold">On Hold</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            {createProjectError && (
                                <p
                                    role="alert"
                                    className="rounded-lg bg-rose-50 p-3 text-sm text-rose-600"
                                >
                                    {createProjectError}
                                </p>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeProjectModal}
                                    disabled={isCreatingProject}
                                    className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={isCreatingProject}
                                    className="flex-1 rounded-xl bg-[#635bff] py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
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

            {/* DELETE PROJECT CONFIRMATION */}
            {projectToDelete && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="deleteProjectTitle"
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-xl text-rose-600">
                            !
                        </div>

                        <h3
                            id="deleteProjectTitle"
                            className="mt-4 text-xl font-bold text-slate-900"
                        >
                            Delete project?
                        </h3>

                        <p className="mt-3 text-sm leading-6 text-slate-500">
                            Are you sure you want to delete{" "}
                            <strong className="text-slate-800">
                                {projectToDelete.name}
                            </strong>
                            ? This action cannot be undone.
                        </p>

                        {deleteProjectError && (
                            <p
                                role="alert"
                                className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-600"
                            >
                                {deleteProjectError}
                            </p>
                        )}

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                disabled={isDeletingProject}
                                className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDeleteProject}
                                disabled={isDeletingProject}
                                className="flex-1 rounded-xl bg-rose-600 py-3 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                            >
                                {isDeletingProject
                                    ? "Deleting..."
                                    : "Delete Project"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
