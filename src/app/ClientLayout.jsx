"use client";

import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/* PUBLIC WEBSITE NAVBAR + FOOTER */
import AdmissionEnquiryWidget from "@/components/common/AdmissionEnquiryWidget";
import CookieBanner from "@/components/common/CookieBanner";
import FloatingContact from "@/components/common/FloatingContact";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

/* ADMIN DASHBOARD NAVBAR + SIDEBAR */
import UserNavbar from "@/components/common/Navbar";
import Sidebar from "@/components/common/Sidebar";

// eslint-disable-next-line react/prop-types
export default function ClientLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading, isAuthenticated } = useAuth();
    const normalizedRole = String(user?.role || "").trim().toLowerCase();

    /* Sidebar toggle state (for admin mobile view) */
    const [sidebarOpen, setSidebarOpen] = useState(false);

    /* ================= ROUTE CHECK ================= */

    /* If URL starts with /admin */
    const isAdminRoute = pathname.startsWith("/admin");

    useEffect(() => {
        if (!isAdminRoute || loading) return;

        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        if (normalizedRole !== "admin") {
            router.push("/user/admission");
        }
    }, [isAdminRoute, loading, isAuthenticated, normalizedRole, router]);


    /* Authenticated user routes (profile, settings, academics, etc.) */
    const isDashboardRoute =
        pathname.startsWith("/user") ||
        pathname.startsWith("/notifications") ||
        pathname.startsWith("/merit") ||
        pathname.startsWith("/profile") ||
        pathname.startsWith("/settings");

    /* ================= ADMIN DASHBOARD ================= */
    if (isAdminRoute) {
        if (loading || !isAuthenticated || normalizedRole !== "admin") {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-[#7a1c1c]"></div>
                        <p className="mt-4 text-gray-600">Checking access...</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="h-screen flex flex-col md:flex-row bg-gray-50">
                {/* ADMIN SIDEBAR - DESKTOP */}
                <aside className="hidden md:block w-64 h-screen overflow-hidden shrink-0">
                    <Sidebar />
                </aside>

                {/* ADMIN SIDEBAR - MOBILE OVERLAY */}
                {sidebarOpen && (
                    <div className="md:hidden fixed inset-0 z-30 bg-black/40">
                        <aside className="w-64 h-screen overflow-hidden shrink-0">
                            <Sidebar setSidebarOpen={setSidebarOpen} />
                        </aside>
                    </div>
                )}

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* NAVBAR */}
                    <header className="h-20 border-b border-gray-200 shrink-0">
                        <UserNavbar
                            sidebarOpen={sidebarOpen}
                            setSidebarOpen={setSidebarOpen}
                        />
                    </header>

                    {/* PAGE CONTENT */}
                    <main className="flex-1 overflow-y-auto p-4 md:p-6">
                        {children}
                    </main>
                </div>
            </div>
        );
    }


    /* ================= AUTHENTICATED ROUTES (WITH SIDEBAR) ================= */
    if (isDashboardRoute) {
        return (
            <div className="h-screen flex flex-col md:flex-row bg-gray-50">
                {/* SIDEBAR - DESKTOP */}
                <aside className="hidden md:block w-64 h-screen overflow-hidden shrink-0">
                    <Sidebar />
                </aside>

                {/* SIDEBAR - MOBILE OVERLAY */}
                {sidebarOpen && (
                    <div className="md:hidden fixed inset-0 z-30 bg-black/40">
                        <aside className="w-64 h-screen overflow-hidden shrink-0">
                            <Sidebar setSidebarOpen={setSidebarOpen} />
                        </aside>
                    </div>
                )}

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* NAVBAR */}
                    <header className="h-20 border-b border-gray-200 shrink-0">
                        <UserNavbar
                            sidebarOpen={sidebarOpen}
                            setSidebarOpen={setSidebarOpen}
                        />
                    </header>

                    {/* PAGE CONTENT */}
                    <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
                        {children}
                    </main>
                </div>
            </div>
        );
    }

    /* ================= PUBLIC WEBSITE ================= */
    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* PUBLIC WEBSITE NAVBAR */}
            <Navbar />

            {/* WEBSITE PAGE CONTENT */}
            <main className="flex-1">
                {children}
            </main>

            {/* WEBSITE FOOTER */}
            <Footer />

            {/* FIXED WIDGETS */}
            <AdmissionEnquiryWidget />
            <FloatingContact />
            <CookieBanner />
        </div>
    );
}