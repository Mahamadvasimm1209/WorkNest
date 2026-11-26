"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Plus,
    Search,
    ListTodo,
    CalendarDays,
    Pencil,
    Trash2,
    X,
    RefreshCw,
    FolderKanban,
    Clock3,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";

import {
    createTask,
    deleteTask,
    getTaskProjects,
    getTasks,
    updateTask,
    type ProjectOption,
    type Task,
    type TaskInput,
    type TaskPriority,
    type TaskStatus,
} from "@/lib/tasks";

const statusLabels: Record<TaskStatus, string> = {
    todo: "To Do",
    "in-progress": "In Progress",
    review: "In Review",
    completed: "Completed",
};

const priorityLabels: Record<TaskPriority, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
};

const initialForm: TaskInput = {
    title: "",
    description: "",
    projectId: "",
    status: "todo",
    priority: "medium",
    dueDate: null,
};

function getProjectName(task: Task) {
    return typeof task.project === "string"
        ? "Project"
        : task.project?.name || "Project";
}

function getProjectId(task: Task) {
    return typeof task.project === "string"
        ? task.project
        : task.project?._id || "";
}

function formatDate(date: string | null) {
    if (!date) return "No due date";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function isOverdue(task: Task) {
    if (!task.dueDate || task.status === "completed") return false;

    const due = new Date(task.dueDate);
    due.setHours(23, 59, 59, 999);

    return due.getTime() < Date.now();
}

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<ProjectOption[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [projectFilter, setProjectFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("newest");

    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [deletingTask, setDeletingTask] = useState<Task | null>(null);

    const [form, setForm] = useState<TaskInput>(initialForm);
    const [formError, setFormError] = useState("");

    const loadData = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const [taskData, projectData] = await Promise.all([
                getTasks(),
                getTaskProjects(),
            ]);

            setTasks(taskData);
            setProjects(projectData);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load tasks"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredTasks = useMemo(() => {
        let result = [...tasks];

        const searchValue = search.trim().toLowerCase();

        if (searchValue) {
            result = result.filter((task) => {
                return (
                    task.title.toLowerCase().includes(searchValue) ||
                    task.description.toLowerCase().includes(searchValue) ||
                    getProjectName(task).toLowerCase().includes(searchValue)
                );
            });
        }

        if (statusFilter !== "all") {
            result = result.filter(
                (task) => task.status === statusFilter
            );
        }

        if (priorityFilter !== "all") {
            result = result.filter(
                (task) => task.priority === priorityFilter
            );
        }

        if (projectFilter !== "all") {
            result = result.filter(
                (task) => getProjectId(task) === projectFilter
            );
        }

        result.sort((a, b) => {
            if (sortOrder === "oldest") {
                return (
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
                );
            }

            if (sortOrder === "due-date") {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;

                return (
                    new Date(a.dueDate).getTime() -
                    new Date(b.dueDate).getTime()
                );
            }

            return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );
        });

        return result;
    }, [
        tasks,
        search,
        statusFilter,
        priorityFilter,
        projectFilter,
        sortOrder,
    ]);

    const counts = useMemo(() => {
        return {
            total: tasks.length,
            todo: tasks.filter((task) => task.status === "todo").length,
            progress: tasks.filter(
                (task) => task.status === "in-progress"
            ).length,
            completed: tasks.filter(
                (task) => task.status === "completed"
            ).length,
            overdue: tasks.filter(isOverdue).length,
        };
    }, [tasks]);

    function openCreateModal() {
        setEditingTask(null);
        setForm({
            ...initialForm,
            projectId: projects[0]?._id || "",
        });
        setFormError("");
        setShowModal(true);
    }

    function openEditModal(task: Task) {
        setEditingTask(task);

        setForm({
            title: task.title,
            description: task.description || "",
            projectId: getProjectId(task),
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate
                ? new Date(task.dueDate).toISOString().slice(0, 10)
                : null,
        });

        setFormError("");
        setShowModal(true);
    }

    function closeModal() {
        if (saving) return;

        setShowModal(false);
        setEditingTask(null);
        setForm(initialForm);
        setFormError("");
    }

    function handleInputChange(
        field: keyof TaskInput,
        value: string
    ) {
        setForm((previous) => ({
            ...previous,
            [field]: field === "dueDate" ? value || null : value,
        }));
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError("");
        setSuccess("");

        if (!form.title.trim()) {
            setFormError("Please enter a task title.");
            return;
        }

        if (!form.projectId) {
            setFormError("Please select a project.");
            return;
        }

        setSaving(true);

        try {
            const payload: TaskInput = {
                ...form,
                title: form.title.trim(),
                description: form.description.trim(),
                dueDate: form.dueDate
                    ? new Date(`${form.dueDate}T00:00:00.000Z`).toISOString()
                    : null,
            };

            if (editingTask) {
                await updateTask(editingTask._id, payload);
                setSuccess("Task updated successfully.");
            } else {
                await createTask(payload);
                setSuccess("Task created successfully.");
            }

            closeModal();
            await loadData();
        } catch (err) {
            setFormError(
                err instanceof Error
                    ? err.message
                    : "Unable to save task"
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!deletingTask) return;

        setError("");
        setSuccess("");

        try {
            await deleteTask(deletingTask._id);
            setTasks((previous) =>
                previous.filter((task) => task._id !== deletingTask._id)
            );
            setDeletingTask(null);
            setSuccess("Task deleted successfully.");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to delete task"
            );
            setDeletingTask(null);
        }
    }

    async function handleStatusChange(
        task: Task,
        status: TaskStatus
    ) {
        setError("");
        setSuccess("");

        try {
            const updated = await updateTask(task._id, { status });

            setTasks((previous) =>
                previous.map((item) =>
                    item._id === task._id ? updated : item
                )
            );

            setSuccess("Task status updated.");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to update task status"
            );
        }
    }

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

                {/* HEADER */}
                <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <Link
                            href="/dashboard"
                            className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900"
                        >
                            <ArrowLeft size={16} />
                            Back to Dashboard
                        </Link>

                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                                <ListTodo size={25} />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                                    My Tasks
                                </h1>
                                <p className="mt-1 text-sm text-slate-500">
                                    Manage and track your project tasks.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={loadData}
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            <RefreshCw
                                size={16}
                                className={loading ? "animate-spin" : ""}
                            />
                            Refresh
                        </button>

                        <button
                            onClick={openCreateModal}
                            disabled={projects.length === 0}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Plus size={18} />
                            New Task
                        </button>
                    </div>
                </header>

                {/* MESSAGES */}
                {success && (
                    <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                        <CheckCircle2 size={17} />
                        {success}
                        <button
                            onClick={() => setSuccess("")}
                            className="ml-auto"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {error && (
                    <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        <AlertCircle size={17} />
                        {error}
                        <button
                            onClick={() => setError("")}
                            className="ml-auto"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* STATISTICS */}
                <section className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-5">
                    <StatCard
                        label="Total Tasks"
                        value={counts.total}
                        icon={<ListTodo size={19} />}
                    />
                    <StatCard
                        label="To Do"
                        value={counts.todo}
                        icon={<Clock3 size={19} />}
                    />
                    <StatCard
                        label="In Progress"
                        value={counts.progress}
                        icon={<RefreshCw size={19} />}
                    />
                    <StatCard
                        label="Completed"
                        value={counts.completed}
                        icon={<CheckCircle2 size={19} />}
                    />
                    <StatCard
                        label="Overdue"
                        value={counts.overdue}
                        icon={<AlertCircle size={19} />}
                    />
                </section>

                {/* FILTERS */}
                <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        <div className="relative lg:col-span-2">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                            />
                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search tasks or projects..."
                                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>

                        <select
                            value={projectFilter}
                            onChange={(event) =>
                                setProjectFilter(event.target.value)
                            }
                            className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        >
                            <option value="all">All Projects</option>
                            {projects.map((project) => (
                                <option key={project._id} value={project._id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(event.target.value)
                            }
                            className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        >
                            <option value="all">All Statuses</option>
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="review">In Review</option>
                            <option value="completed">Completed</option>
                        </select>

                        <select
                            value={priorityFilter}
                            onChange={(event) =>
                                setPriorityFilter(event.target.value)
                            }
                            className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        >
                            <option value="all">All Priorities</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs text-slate-500">
                            Showing {filteredTasks.length} of {tasks.length} tasks
                        </p>

                        <select
                            value={sortOrder}
                            onChange={(event) =>
                                setSortOrder(event.target.value)
                            }
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-indigo-500"
                        >
                            <option value="newest">Newest first</option>
                            <option value="oldest">Oldest first</option>
                            <option value="due-date">Due date</option>
                        </select>
                    </div>
                </section>

                {/* TASK LIST */}
                <section>
                    {loading ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                            <RefreshCw
                                size={25}
                                className="mx-auto animate-spin text-indigo-600"
                            />
                            <p className="mt-3 text-sm text-slate-500">
                                Loading your tasks...
                            </p>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
                            <FolderKanban
                                size={35}
                                className="mx-auto text-slate-500"
                            />
                            <h2 className="mt-4 text-lg font-semibold">
                                Create a project first
                            </h2>
                            <p className="mt-2 text-sm text-slate-500">
                                Tasks must belong to a project. Create a project
                                before adding your first task.
                            </p>
                            <Link
                                href="/dashboard"
                                className="mt-5 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                            >
                                Go to Dashboard
                            </Link>
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
                            <ListTodo
                                size={35}
                                className="mx-auto text-slate-500"
                            />
                            <h2 className="mt-4 text-lg font-semibold">
                                No tasks found
                            </h2>
                            <p className="mt-2 text-sm text-slate-500">
                                Create a task or change your search and filters.
                            </p>
                            <button
                                onClick={openCreateModal}
                                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                            >
                                <Plus size={17} />
                                Create Task
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredTasks.map((task) => (
                                <TaskCard
                                    key={task._id}
                                    task={task}
                                    onEdit={() => openEditModal(task)}
                                    onDelete={() => setDeletingTask(task)}
                                    onStatusChange={(status) =>
                                        handleStatusChange(task, status)
                                    }
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* CREATE / EDIT MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm">
                    <div className="my-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    {editingTask ? "Edit Task" : "Create Task"}
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Add details and organize your work.
                                </p>
                            </div>

                            <button
                                onClick={closeModal}
                                disabled={saving}
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Task title *
                                </label>
                                <input
                                    required
                                    minLength={2}
                                    maxLength={120}
                                    value={form.title}
                                    onChange={(event) =>
                                        handleInputChange(
                                            "title",
                                            event.target.value
                                        )
                                    }
                                    placeholder="e.g. Build authentication page"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    maxLength={2000}
                                    value={form.description}
                                    onChange={(event) =>
                                        handleInputChange(
                                            "description",
                                            event.target.value
                                        )
                                    }
                                    placeholder="Describe what needs to be done..."
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Project *
                                </label>
                                <select
                                    required
                                    value={form.projectId}
                                    onChange={(event) =>
                                        handleInputChange(
                                            "projectId",
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                >
                                    <option value="">Select a project</option>
                                    {projects.map((project) => (
                                        <option
                                            key={project._id}
                                            value={project._id}
                                        >
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Status
                                    </label>
                                    <select
                                        value={form.status}
                                        onChange={(event) =>
                                            handleInputChange(
                                                "status",
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    >
                                        <option value="todo">To Do</option>
                                        <option value="in-progress">
                                            In Progress
                                        </option>
                                        <option value="review">In Review</option>
                                        <option value="completed">
                                            Completed
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Priority
                                    </label>
                                    <select
                                        value={form.priority}
                                        onChange={(event) =>
                                            handleInputChange(
                                                "priority",
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Due date
                                </label>
                                <input
                                    type="date"
                                    value={form.dueDate || ""}
                                    onChange={(event) =>
                                        handleInputChange(
                                            "dueDate",
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            {formError && (
                                <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                    {formError}
                                </p>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingTask
                                            ? "Save Changes"
                                            : "Create Task"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION */}
            {deletingTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                            <Trash2 size={23} />
                        </div>

                        <h2 className="text-xl font-bold text-slate-900">Delete task?</h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-slate-900">
                                {deletingTask.title}
                            </span>
                            ? This action cannot be undone.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setDeletingTask(null)}
                                className="rounded-xl border border-slate-200 px-5 py-3 text-sm text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDelete}
                                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
                            >
                                Delete Task
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

function StatCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between text-slate-500">
                <span className="text-xs sm:text-sm">{label}</span>
                {icon}
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
    );
}

function TaskCard({
    task,
    onEdit,
    onDelete,
    onStatusChange,
}: {
    task: Task;
    onEdit: () => void;
    onDelete: () => void;
    onStatusChange: (status: TaskStatus) => void;
}) {
    const overdue = isOverdue(task);

    const priorityStyle: Record<TaskPriority, string> = {
        low: "bg-slate-100 text-slate-700 border-slate-200",
        medium: "bg-amber-50 text-amber-700 border-amber-200",
        high: "bg-red-50 text-red-700 border-red-200",
    };

    const statusStyle: Record<TaskStatus, string> = {
        todo: "bg-slate-100 text-slate-700",
        "in-progress": "bg-blue-50 text-blue-700",
        review: "bg-purple-50 text-purple-700",
        completed: "bg-emerald-50 text-emerald-700",
    };

    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-200 sm:p-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="break-words text-base font-semibold text-slate-900">
                            {task.title}
                        </h3>

                        <span
                            className={`rounded-full border px-2.5 py-1 text-xs ${priorityStyle[task.priority]}`}
                        >
                            {priorityLabels[task.priority]} priority
                        </span>

                        {overdue && (
                            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs text-red-700">
                                Overdue
                            </span>
                        )}
                    </div>

                    {task.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                            {task.description}
                        </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                            <FolderKanban size={14} />
                            {getProjectName(task)}
                        </span>

                        <span
                            className={`inline-flex items-center gap-1.5 ${overdue ? "text-red-700" : ""
                                }`}
                        >
                            <CalendarDays size={14} />
                            {formatDate(task.dueDate)}
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={task.status}
                        onChange={(event) =>
                            onStatusChange(event.target.value as TaskStatus)
                        }
                        className={`rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-indigo-500 ${statusStyle[task.status]}`}
                        aria-label={`Change status for ${task.title}`}
                    >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="review">In Review</option>
                        <option value="completed">Completed</option>
                    </select>

                    <button
                        onClick={onEdit}
                        title="Edit task"
                        className="rounded-lg border border-slate-200 p-2.5 text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                        <Pencil size={16} />
                    </button>

                    <button
                        onClick={onDelete}
                        title="Delete task"
                        className="rounded-lg border border-slate-200 p-2.5 text-slate-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </article>
    );
}