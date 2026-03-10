"use client";

import { getFirebaseDb } from "@/lib/firebase";
import { get, ref } from "firebase/database";
import { useEffect, useState } from "react";

function decodeJwtPayload(token) {
    try {
        const payload = token.split(".")[1];
        if (!payload) return null;

        const base64 = payload.replaceAll("-", "+").replaceAll("_", "/");
        const decoded = atob(base64);
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const initAuth = async () => {
            const authToken = localStorage.getItem("authToken");

            if (!authToken) {
                setLoading(false);
                return;
            }

            const payload = decodeJwtPayload(authToken);
            const uid = payload?.user_id || payload?.uid || payload?.sub;

            if (!uid) {
                localStorage.removeItem("authToken");
                setLoading(false);
                return;
            }

            setIsAuthenticated(true);

            try {
                const snapshot = await get(ref(getFirebaseDb(), `users/${uid}`));
                const profile = snapshot.exists() ? snapshot.val() : {};

                setUser({
                    uid,
                    name: profile?.name || null,
                    email: profile?.email || null,
                });
            } catch {
                // Keep auth state from token even if profile fetch fails
                setUser({ uid, name: null, email: null });
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const logout = () => {
        localStorage.removeItem("authToken");
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
