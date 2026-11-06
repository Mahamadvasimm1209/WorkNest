const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

async function settingsRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<{ data: T; message: string }> {
    const token =
        typeof window !== "undefined"
            ? sessionStorage.getItem("accessToken")
            : null;

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Request failed");
    }

    return {
        data: result.data,
        message: result.message,
    };
}

export async function getProfile(): Promise<UserProfile> {
    const result = await settingsRequest<{ user: UserProfile }>(
        "/auth/me"
    );

    return result.data.user;
}

export async function updateProfile(data: {
    name: string;
    email: string;
}): Promise<UserProfile> {
    const result = await settingsRequest<{ user: UserProfile }>(
        "/auth/me",
        {
            method: "PATCH",
            body: JSON.stringify(data),
        }
    );

    return result.data.user;
}

export async function changePassword(data: {
    currentPassword: string;
    newPassword: string;
}): Promise<void> {
    await settingsRequest("/auth/change-password", {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}