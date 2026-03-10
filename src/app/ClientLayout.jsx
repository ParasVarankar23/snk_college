"use client";

import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import { useState } from "react";

/* PUBLIC WEBSITE NAVBAR + FOOTER */
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

/* ADMIN DASHBOARD NAVBAR + SIDEBAR */
import UserNavbar from "@/components/common/Navbar";
import Sidebar from "@/components/common/Sidebar";

// eslint-disable-next-line react/prop-types
export default function ClientLayout({ children }) {
    const pathname = usePathname();
    const { isAuthenticated } = useAuth();

    /* Sidebar toggle state (for admin mobile view) */
    const [sidebarOpen, setSidebarOpen] = useState(false);

    /* ================= ROUTE CHECK ================= */

    /* If URL starts with /admin */
    const isAdminRoute = pathname.startsWith("/admin");


    /* Authenticated user routes (profile, settings, academics, etc.) */
    const isAuthenticatedRoute =
        pathname.startsWith("/profile") ||
        pathname.startsWith("/settings") ||
        pathname.startsWith("/academics") ||
        pathname.startsWith("/departments") ||
        pathname.startsWith("/facilities") ||
        pathname.startsWith("/events") ||
        pathname.startsWith("/achievements") ||
        pathname.startsWith("/gallery") ||
        pathname.startsWith("/contact");

    /* ================= ADMIN DASHBOARD ================= */
    if (isAdminRoute) {
        return (
            <div className="h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-[#0f0f0f]">
                {/* ADMIN SIDEBAR - DESKTOP */}
                <aside className="hidden md:block w-64 h-screen overflow-y-auto">
                    <Sidebar />
                </aside>

                {/* ADMIN SIDEBAR - MOBILE OVERLAY */}
                {sidebarOpen && (
                    <div className="md:hidden fixed inset-0 z-30 bg-black/40">
                        <aside className="w-64 h-screen overflow-y-auto">
                            <Sidebar setSidebarOpen={setSidebarOpen} />
                        </aside>
                    </div>
                )}

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* NAVBAR */}
                    <header className="h-20 border-b border-gray-200 dark:border-white/10 flex-shrink-0">
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
    if (isAuthenticatedRoute && isAuthenticated) {
        return (
            <div className="h-screen flex flex-col">
                {/* NAVBAR */}
                <header className="h-20 fixed top-0 left-0 right-0 z-40">
                    <UserNavbar
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                    />
                </header>

                {/* LAYOUT WITH SIDEBAR */}
                <div className="flex flex-1 pt-20 overflow-hidden">
                    {/* DESKTOP SIDEBAR */}
                    <aside className="hidden md:block w-64 h-full overflow-y-auto">
                        <Sidebar />
                    </aside>

                    {/* MOBILE SIDEBAR OVERLAY */}
                    {sidebarOpen && (
                        <div className="md:hidden fixed inset-0 z-30 bg-black/40">
                            <div className="w-64 h-full pt-20">
                                <Sidebar setSidebarOpen={setSidebarOpen} />
                            </div>
                        </div>
                    )}

                    {/* MAIN CONTENT */}
                    <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-[#0f0f0f]">
                        {children}
                    </main>
                </div>
            </div>
        );
    }

    /* ================= PUBLIC WEBSITE ================= */
    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-[#0f0f0f]">
            {/* PUBLIC WEBSITE NAVBAR */}
            <Navbar />

            {/* WEBSITE PAGE CONTENT */}
            <main className="flex-1">
                {children}
            </main>

            {/* WEBSITE FOOTER */}
            <Footer />
        </div>
    );
}