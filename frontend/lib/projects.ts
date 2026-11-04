
const API_URL = "http://localhost:5000/api/v1";

export interface Project {
    _id: string;
    name: string;
    description: string;
    status: "active" | "on-hold" | "completed";
    owner: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProjectData {
    name: string;
    description?: string;
    status?: Project["status"];
}

interface ProjectsResponse {
    success: boolean;
    message: string;
    data: {
        projects: Project[];
        count: number;
    };
}

interface CreateProjectResponse {
    success: boolean;
    message: string;
    data: {
        project: Project;
    };
}

interface ApiResponse {
    success: boolean;
    message: string;
}

const getAuthHeaders = (): HeadersInit => {
    const token = sessionStorage.getItem("accessToken");

    if (!token) {
        throw new Error("Please log in to continue.");
    }

    return {
        Authorization: `Bearer ${token}`,
    };
};

// GET ALL PROJECTS
export const getProjects = async (): Promise<Project[]> => {
    const response = await fetch(`${API_URL}/projects`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    const result: ProjectsResponse = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to fetch projects.");
    }

    return result.data.projects;
};

// CREATE PROJECT
export const createProject = async (
    projectData: CreateProjectData
): Promise<Project> => {
    const response = await fetch(`${API_URL}/projects`, {
        method: "POST",
        headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
    });

    const result: CreateProjectResponse = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to create project.");
    }

    return result.data.project;
};

// DELETE PROJECT
export const deleteProject = async (
    projectId: string
): Promise<void> => {
    const response = await fetch(
        `${API_URL}/projects/${projectId}`,
        {
            method: "DELETE",
            headers: getAuthHeaders(),
        }
    );

    const result: ApiResponse = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to delete project.");
    }
};
