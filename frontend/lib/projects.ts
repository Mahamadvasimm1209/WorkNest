
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
    status?: "active" | "on-hold" | "completed";
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

// GET: Fetch all projects belonging to the logged-in user
export const getProjects = async (): Promise<Project[]> => {
    const token = sessionStorage.getItem("accessToken");

    if (!token) {
        throw new Error("Please log in to view your projects.");
    }

    const response = await fetch(`${API_URL}/projects`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const result: ProjectsResponse = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to fetch projects");
    }

    return result.data.projects;
};

// POST: Create a new project
export const createProject = async (
    projectData: CreateProjectData
): Promise<Project> => {
    const token = sessionStorage.getItem("accessToken");

    if (!token) {
        throw new Error("Please log in to create a project.");
    }

    const response = await fetch(`${API_URL}/projects`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
    });

    const result: CreateProjectResponse = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to create project");
    }

    return result.data.project;
};

export const deleteProject = async (
    projectId: string
): Promise<void> => {
    const token = sessionStorage.getItem("accessToken");

    if (!token) {
        throw new Error("Please log in to delete a project.");
    }

    const response = await fetch(
        `${API_URL}/projects/${projectId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Failed to delete project"
        );
    }
};
