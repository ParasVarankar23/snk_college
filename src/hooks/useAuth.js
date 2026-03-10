"use client";

import { useEffect, useState } from "react";

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if user is logged in (from localStorage)
        const storedUser = localStorage.getItem("user");
        const authToken = localStorage.getItem("authToken");

        if (storedUser && authToken) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
        }

        setLoading(false);
    }, []);

    const logout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false);
    };

    return {
        user,
        loading,
        isAuthenticated,
        logout,
    };
}
