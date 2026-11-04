const API_URL = "http://localhost:5000/api/v1";

export type TaskStatus = "todo" | "in-progress" | "review" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface ProjectOption {
    _id: string;
    name: string;
    status?: string;
}

export interface Task {
    _id: string;
    title: string;
    description: string;
    project: ProjectOption | string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string | null;
    owner: string;
    createdAt: string;
    updatedAt: string;
}

export interface TaskInput {
    title: string;
    description: string;
    projectId: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string | null;
}

function getHeaders(): HeadersInit {
    const token =
        typeof window !== "undefined"
            ? sessionStorage.getItem("accessToken")
            : null;

    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function parseResponse(response: Response) {
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(result.message || "Something went wrong");
    }

    return result;
}

// GET ALL TASKS
export async function getTasks(): Promise<Task[]> {
    const response = await fetch(`${API_URL}/tasks`, {
        method: "GET",
        headers: getHeaders(),
        credentials: "include",
        cache: "no-store",
    });

    const result = await parseResponse(response);

    return result.data.tasks;
}

// GET PROJECTS FOR TASK FORM
export async function getTaskProjects(): Promise<ProjectOption[]> {
    const response = await fetch(`${API_URL}/projects`, {
        method: "GET",
        headers: getHeaders(),
        credentials: "include",
        cache: "no-store",
    });

    const result = await parseResponse(response);

    return result.data.projects;
}

// CREATE TASK
export async function createTask(data: TaskInput): Promise<Task> {
    const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify(data),
    });

    const result = await parseResponse(response);

    return result.data.task;
}

// UPDATE TASK
export async function updateTask(
    taskId: string,
    data: Partial<TaskInput>
): Promise<Task> {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "PATCH",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify(data),
    });

    const result = await parseResponse(response);

    return result.data.task;
}

// DELETE TASK
export async function deleteTask(taskId: string): Promise<void> {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "DELETE",
        headers: getHeaders(),
        credentials: "include",
    });

    await parseResponse(response);
}