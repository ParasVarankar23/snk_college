"use client";

/* eslint-disable react/prop-types */
/* eslint-disable no-negated-condition */

import { BellRing } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 100;

export default function Notification({ roleLabel, notifications, unreadCount, loading, typeCounts }) {
    const hasNotifications = Array.isArray(notifications) && notifications.length > 0;
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil((notifications?.length || 0) / PAGE_SIZE));

    const paginatedNotifications = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return (notifications || []).slice(start, start + PAGE_SIZE);
    }, [notifications, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [notifications]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    let content = null;
    if (loading) {
        content = <p className="text-sm text-slate-500">Loading notifications...</p>;
    } else if (!hasNotifications) {
        content = (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                You have no notifications right now.
            </div>
        );
    } else {
        content = (
            <div className="space-y-3">
                {paginatedNotifications.map((item) => (
                    <article key={item.id} className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a1c1c]">{item.type}</p>
                                <h3 className="mt-1 text-base font-bold text-slate-900">{item.title}</h3>
                                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                                <p className="mt-2 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                            </div>
                            <a
                                href={item.href}
                                className="rounded-lg border border-[#7a1c1c]/20 bg-[#7a1c1c]/5 px-3 py-2 text-xs font-semibold text-[#7a1c1c]"
                            >
                                View
                            </a>
                        </div>
                    </article>
                ))}

                <div className="flex flex-col gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">Page {currentPage} of {totalPages}</p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            type="button"
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <section className="rounded-3xl border border-[#7a1c1c]/10 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7a1c1c]">Notifications</p>
                        <h1 className="mt-2 text-2xl font-black text-slate-900">{roleLabel} Notification Center</h1>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#7a1c1c]/10 px-4 py-2 text-sm font-semibold text-[#7a1c1c]">
                        <BellRing size={16} /> Unread: {unreadCount}
                    </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                    {Object.keys(typeCounts || {}).length === 0 ? (
                        <span className="rounded-full bg-slate-100 px-3 py-1">No notifications</span>
                    ) : (
                        Object.entries(typeCounts).map(([key, value]) => (
                            <span key={key} className="rounded-full bg-slate-100 px-3 py-1">
                                {key}: {value}
                            </span>
                        ))
                    )}
                </div>
            </section>

            <section className="rounded-3xl border border-[#7a1c1c]/10 bg-white p-5 shadow-sm">
                {content}
            </section>
        </div>
    );
}
