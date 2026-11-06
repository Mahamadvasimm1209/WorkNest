const API_URL = "http://localhost:5000/api/v1";

export type TeamUser = {
    _id: string;
    name?: string;
    email?: string;
};

export type TeamMember = {
    user: string | TeamUser;
    role: "owner" | "manager" | "member";
    joinedAt?: string;
};

export type Team = {
    _id: string;
    name: string;
    description?: string;
    owner: string | TeamUser;
    members: TeamMember[];
    createdAt: string;
    updatedAt: string;
};

type TeamInput = {
    name: string;
    description?: string;
};

async function apiRequest(
    path: string,
    options: RequestInit = {}
) {
    const token = sessionStorage.getItem("accessToken");

    if (!token) {
        throw new Error("Please log in to continue.");
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            result.message ||
            result.error ||
            `Request failed (${response.status})`
        );
    }

    return result;
}

function extractTeam(result: any): Team {
    return (
        result?.data?.team ??
        result?.team ??
        result?.data ??
        result
    ) as Team;
}

export async function getTeams(): Promise<Team[]> {
    const result = await apiRequest("/teams");

    const teams =
        result?.data?.teams ??
        result?.teams ??
        result?.data ??
        result;

    return Array.isArray(teams) ? teams : [];
}

export async function getTeam(teamId: string): Promise<Team> {
    const result = await apiRequest(`/teams/${teamId}`);
    return extractTeam(result);
}

export async function createTeam(
    data: TeamInput
): Promise<Team> {
    const result = await apiRequest("/teams", {
        method: "POST",
        body: JSON.stringify(data),
    });

    return extractTeam(result);
}

export async function updateTeam(
    teamId: string,
    data: TeamInput
): Promise<Team> {
    const result = await apiRequest(`/teams/${teamId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });

    return extractTeam(result);
}

export async function addTeamMember(
    teamId: string,
    email: string
) {
    return apiRequest(`/teams/${teamId}/members`, {
        method: "POST",
        body: JSON.stringify({ email }),
    });
}

export async function updateTeamMemberRole(
    teamId: string,
    userId: string,
    role: "manager" | "member"
) {
    return apiRequest(
        `/teams/${teamId}/members/${userId}/role`,
        {
            method: "PATCH",
            body: JSON.stringify({ role }),
        }
    );
}

export async function removeTeamMember(
    teamId: string,
    userId: string
) {
    return apiRequest(
        `/teams/${teamId}/members/${userId}`,
        {
            method: "DELETE",
        }
    );
}

export async function deleteTeam(teamId: string) {
    return apiRequest(`/teams/${teamId}`, {
        method: "DELETE",
    });
}