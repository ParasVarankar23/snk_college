/**
 * Authentication API Client
 * Utility functions to interact with the Firebase authentication API
 */

export async function signup(name, email) {
    const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Signup failed");
    }

    return data;
}

export async function login(email, password) {
    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Login failed");
    }

    // Store token and user in localStorage
    if (data.idToken) {
        localStorage.setItem("authToken", data.idToken);
    }
    if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
}

export function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
}

export function getAuthToken() {
    if (typeof window !== "undefined") {
        return localStorage.getItem("authToken");
    }
    return null;
}

export function getStoredUser() {
    if (typeof window !== "undefined") {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    }
    return null;
}

export function isAuthenticated() {
    if (typeof window !== "undefined") {
        return !!localStorage.getItem("authToken");
    }
    return false;
}
