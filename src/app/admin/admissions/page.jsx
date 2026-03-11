"use client";

import { Trash2, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const streamLabelMap = {
    science: "Science Department",
    commerce: "Commerce Department",
    arts: "Arts Department",
    other: "Other / Not Selected",
};

function resolveStream(admission) {
    return String(admission?.selectedStream || admission?.payload?.selectedStream || "")
        .trim()
        .toLowerCase();
}

function prettyValue(value) {
    if (value === null || value === undefined || value === "") return "-";
    if (Array.isArray(value)) return value.join(", ") || "-";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
}

export default function AdminAdmissionsPage() {
    const [admissions, setAdmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [expandedId, setExpandedId] = useState("");

    const grouped = useMemo(() => {
        const base = {
            science: [],
            commerce: [],
            arts: [],
            other: [],
        };

        admissions.forEach((admission) => {
            const stream = resolveStream(admission);
            if (base[stream]) {
                base[stream].push(admission);
            } else {
                base.other.push(admission);
            }
        });

        return base;
    }, [admissions]);

    const totalCount = admissions.length;

    const loadAdmissions = async () => {
        setLoading(true);
        setError("");

        try {
            const token = globalThis.localStorage.getItem("authToken");
            if (!token) {
                throw new Error("Please login again as admin.");
            }

            const response = await fetch("/api/auth/admission", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch admissions");
            }

            setAdmissions(data.admissions || []);
        } catch (err) {
            setError(err.message || "Failed to fetch admissions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAdmissions();
    }, []);

    const handleDelete = async (id) => {
        if (!globalThis.confirm("Delete this admission record?")) return;

        try {
            const token = globalThis.localStorage.getItem("authToken");
            if (!token) {
                throw new Error("Please login again as admin.");
            }

            const response = await fetch(`/api/auth/admission/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to delete admission");
            }

            setAdmissions((prev) => prev.filter((item) => item.id !== id));
            if (expandedId === id) setExpandedId("");
        } catch (err) {
            setError(err.message || "Failed to delete admission");
        }
    };

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#fdf5f5_0%,#f8f6f6_42%,#f4f2f2_100%)] p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <section className="rounded-3xl border border-[#7a1c1c]/10 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7a1c1c]">Admin Admissions Panel</p>
                            <h1 className="mt-2 text-3xl font-black text-slate-900">Department-Wise Admission Records</h1>
                            <p className="mt-2 text-sm text-slate-500">View all student admissions with complete details grouped by selected stream.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl border border-[#7a1c1c]/10 bg-[#7a1c1c]/5 px-4 py-3 text-sm font-semibold text-[#7a1c1c]">
                                Total Admissions: {totalCount}
                            </div>
                            <button
                                type="button"
                                onClick={loadAdmissions}
                                disabled={loading}
                                className="rounded-xl bg-linear-to-r from-[#9f2a2a] via-[#7a1c1c] to-[#5a1414] px-5 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
                            >
                                {loading ? "Loading..." : "Refresh Admissions"}
                            </button>
                        </div>
                    </div>
                    {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
                </section>

                {Object.entries(grouped).map(([stream, items]) => (
                    <section key={stream} className="rounded-3xl border border-[#7a1c1c]/10 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">{streamLabelMap[stream]}</h2>
                            <span className="rounded-full bg-[#7a1c1c]/5 px-3 py-1 text-sm font-semibold text-[#7a1c1c]">
                                {items.length} records
                            </span>
                        </div>

                        {items.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                                No admissions in this department.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {items.map((admission) => {
                                    const studentName =
                                        admission?.payload?.declarationStudentName ||
                                        [
                                            admission?.payload?.firstName,
                                            admission?.payload?.middleName,
                                            admission?.payload?.lastName,
                                        ]
                                            .filter(Boolean)
                                            .join(" ") ||
                                        "Student";

                                    const isExpanded = expandedId === admission.id;

                                    return (
                                        <div key={admission.id} className="rounded-2xl border border-slate-200 bg-white">
                                            <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7a1c1c] text-white">
                                                        <UserRound className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{studentName}</p>
                                                        <p className="text-xs text-slate-500">
                                                            {admission?.payload?.email || "-"} | {admission?.payload?.mobileNumber || "-"}
                                                        </p>
                                                        <p className="text-xs text-slate-500">Application ID: {admission.applicationId || "-"}</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setExpandedId(isExpanded ? "" : admission.id)}
                                                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                                                    >
                                                        {isExpanded ? "Hide Details" : "View Full Details"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(admission.id)}
                                                        className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="border-t border-slate-200 bg-slate-50/70 p-4">
                                                    <h3 className="mb-3 text-sm font-bold text-slate-800">Submitted Form Data</h3>
                                                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                                        {Object.entries(admission.payload || {}).map(([key, value]) => (
                                                            <div key={key} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                                                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{key}</p>
                                                                <p className="mt-1 wrap-break-word text-sm font-medium text-slate-700">{prettyValue(value)}</p>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <h3 className="mb-3 mt-5 text-sm font-bold text-slate-800">Uploaded Documents</h3>
                                                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                                        {Object.entries(admission.documents || {}).length === 0 && (
                                                            <p className="text-sm text-slate-500">No uploaded documents found.</p>
                                                        )}
                                                        {Object.entries(admission.documents || {}).map(([key, doc]) => (
                                                            <a
                                                                key={key}
                                                                href={doc?.url || "#"}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="rounded-xl border border-[#7a1c1c]/10 bg-white px-3 py-2 text-sm font-medium text-[#7a1c1c] hover:bg-[#7a1c1c]/5"
                                                            >
                                                                {key}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                ))}
            </div>
        </div>
    );
}
