"use client";

import Notification from "@/components/common/Notification";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useMemo, useState } from "react";

export default function NotificationPage() {
    const { user } = useAuth();
    const normalizedRole = String(user?.role || "student").trim().toLowerCase();
    const roleLabel = normalizedRole === "admin" ? "Admin" : "Student";

    const [notifications, setNotifications] = useState([]);
    const [typeCounts, setTypeCounts] = useState({});
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const authHeader = useMemo(() => {
        if (typeof window === "undefined") return null;
        const token = localStorage.getItem("authToken");
        return token ? { Authorization: `Bearer ${token}` } : null;
    }, []);

    useEffect(() => {
        const loadNotifications = async () => {
            setLoading(true);
            try {
                if (!authHeader) {
                    setNotifications([]);
                    setTypeCounts({});
                    setUnreadCount(0);
                    return;
                }

                const response = await fetch("/api/notification", {
                    headers: authHeader,
                    cache: "no-store",
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || "Failed to fetch notifications");
                }

                setNotifications(data.notifications || []);
                setTypeCounts(data.typeCounts || {});
                setUnreadCount(Number(data.unreadCount || 0));

                await fetch("/api/notification", {
                    method: "POST",
                    headers: {
                        ...authHeader,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ action: "mark-seen" }),
                });
                setUnreadCount(0);
                globalThis.dispatchEvent(new Event("notifications-seen"));
            } catch {
                setNotifications([]);
                setTypeCounts({});
                setUnreadCount(0);
            } finally {
                setLoading(false);
            }
        };

        loadNotifications();
    }, [authHeader]);

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#fdf5f5_0%,#f8f6f6_42%,#f4f2f2_100%)] px-4 py-6 md:px-6">
            <div className="mx-auto max-w-6xl">
                <Notification
                    roleLabel={roleLabel}
                    notifications={notifications}
                    unreadCount={unreadCount}
                    loading={loading}
                    typeCounts={typeCounts}
                />
            </div>
        </div>
    );
}
