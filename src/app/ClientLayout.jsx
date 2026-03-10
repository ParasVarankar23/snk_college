"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

/* PUBLIC WEBSITE NAVBAR + FOOTER */
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

/* ADMIN DASHBOARD NAVBAR + SIDEBAR */
import UserNavbar from "@/components/common/Navbar";
import Sidebar from "@/components/common/Sidebar";

export default function ClientLayout({ children }) {

    /* Get current route */
    const pathname = usePathname();

    /* Sidebar toggle state (for admin mobile view) */
    const [sidebarOpen, setSidebarOpen] = useState(false);

    /* ================= ROUTE CHECK ================= */

    /* If URL starts with /admin */
    const isAdminRoute = pathname.startsWith("/admin");

    /* If URL starts with /user */
    const isUserRoute = pathname.startsWith("/user");

    /* ================= ADMIN DASHBOARD ================= */
    if (isAdminRoute) {
        return (

            <div className="h-screen flex bg-gray-50">

                {/* ===== ADMIN SIDEBAR ===== */}
                <aside className="hidden md:block w-64 h-screen bg-white border-r">
                    <Sidebar />
                </aside>

                {/* ===== MOBILE SIDEBAR ===== */}
                {sidebarOpen && (
                    <div className="md:hidden fixed inset-0 z-40 bg-black/40">
                        <Sidebar setSidebarOpen={setSidebarOpen} />
                    </div>
                )}

                {/* ===== MAIN AREA ===== */}
                <div className="flex-1 flex flex-col h-screen">

                    {/* ADMIN NAVBAR */}
                    <header className="h-16 border-b bg-white">
                        <UserNavbar
                            sidebarOpen={sidebarOpen}
                            setSidebarOpen={setSidebarOpen}
                        />
                    </header>

                    {/* ADMIN PAGE CONTENT */}
                    <main className="flex-1 overflow-y-auto p-6">
                        {children}
                    </main>

                </div>

            </div>
        );
    }

    /* ================= USER PANEL ================= */
    if (isUserRoute) {
        return (
            <>
                {/* USER NAVBAR */}
                <UserNavbar />

                {/* USER PAGE CONTENT */}
                <main className="min-h-screen bg-gray-50 p-6">
                    {children}
                </main>
            </>
        );
    }

    /* ================= PUBLIC WEBSITE ================= */
    return (
        <>
            {/* PUBLIC WEBSITE NAVBAR */}
            <Navbar />

            {/* WEBSITE PAGE CONTENT */}
            <main className="min-h-screen">
                {children}
            </main>

            {/* WEBSITE FOOTER */}
            <Footer />
        </>
    );
}