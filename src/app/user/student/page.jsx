"use client";

/* eslint-disable react/prop-types */

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const RANGE_OPTIONS = [
    { label: "Today", value: "today" },
    { label: "Weekly", value: "weekly" },
    { label: "This Month", value: "this-month" },
    { label: "1 Month", value: "1-month" },
    { label: "2 Months", value: "2-months" },
    { label: "3 Months", value: "3-months" },
    { label: "1 Year", value: "1-year" },
    { label: "All", value: "all" },
];

const PAGE_SIZE = 10;
const SUBJECTS_BY_DEPARTMENT = {
    science: ["physics", "chemistry", "biology", "maths", "english", "marathi"],
    commerce: ["account", "secretarial practice", "organization of commerce", "economics", "english", "marathi"],
    arts: ["english", "marathi", "geography", "history", "political science", "economics"],
};

function normalizeSubject(value) {
    return String(value || "general").trim().toLowerCase() || "general";
}

function formatSubjectLabel(value) {
    const subject = normalizeSubject(value);
    return subject
        .split(" ")
        .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
        .join(" ");
}

function getDateRangeStart(filterKey) {
    const now = new Date();
    const start = new Date(now);

    if (filterKey === "today") {
        start.setHours(0, 0, 0, 0);
        return start;
    }

    if (filterKey === "weekly") {
        start.setDate(now.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        return start;
    }

    if (filterKey === "this-month") {
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }

    if (filterKey === "1-month") {
        start.setMonth(now.getMonth() - 1);
        return start;
    }

    if (filterKey === "2-months") {
        start.setMonth(now.getMonth() - 2);
        return start;
    }

    if (filterKey === "3-months") {
        start.setMonth(now.getMonth() - 3);
        return start;
    }

    if (filterKey === "1-year") {
        start.setFullYear(now.getFullYear() - 1);
        return start;
    }

    return null;
}

export default function UserStudentPage() {
    const [student, setStudent] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [totals, setTotals] = useState({ present: 0, absent: 0, leave: 0 });
    const [departmentSubjects, setDepartmentSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [rangeFilter, setRangeFilter] = useState("all");
    const [subjectFilter, setSubjectFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const loadSummary = async () => {
            try {
                setLoading(true);
                const token = globalThis.localStorage.getItem("authToken");
                if (!token) {
                    throw new Error("Please login again");
                }

                const response = await fetch("/api/attendance?type=summary", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || "Failed to load student summary");
                }

                setStudent(data.student || null);
                setAttendance(data.attendance || []);
                setTotals(data.totals || { present: 0, absent: 0, leave: 0 });
                const serverDepartmentSubjects = Array.isArray(data.departmentSubjects)
                    ? data.departmentSubjects.map((item) => normalizeSubject(item)).filter(Boolean)
                    : [];

                const fallbackDepartment = String(data.student?.department || "").trim().toLowerCase();
                const fallbackSubjects = SUBJECTS_BY_DEPARTMENT[fallbackDepartment] || [];
                setDepartmentSubjects(
                    serverDepartmentSubjects.length > 0 ? serverDepartmentSubjects : fallbackSubjects
                );
            } catch (error) {
                toast.error(error.message || "Failed to load student summary");
            } finally {
                setLoading(false);
            }
        };

        loadSummary();
    }, []);

    const attendancePercent = useMemo(() => {
        const total = Number(totals.present || 0) + Number(totals.absent || 0) + Number(totals.leave || 0);
        if (!total) return 0;
        return Math.round((Number(totals.present || 0) / total) * 100);
    }, [totals]);

    const availableSubjects = useMemo(() => {
        if (departmentSubjects.length > 0) {
            return ["all", ...departmentSubjects];
        }

        const unique = new Set(attendance.map((row) => normalizeSubject(row.subject)));
        return ["all", ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
    }, [attendance, departmentSubjects]);

    useEffect(() => {
        if (!availableSubjects.includes(subjectFilter)) {
            setSubjectFilter("all");
        }
    }, [availableSubjects, subjectFilter]);

    const filteredAttendance = useMemo(() => {
        const query = search.trim().toLowerCase();
        const startDate = getDateRangeStart(rangeFilter);
        const hasDepartmentSubjectFilter = departmentSubjects.length > 0;

        return attendance.filter((row) => {
            const normalizedSubject = normalizeSubject(row.subject);

            if (hasDepartmentSubjectFilter && !departmentSubjects.includes(normalizedSubject)) {
                return false;
            }

            if (subjectFilter !== "all" && normalizeSubject(row.subject) !== subjectFilter) {
                return false;
            }

            if (startDate) {
                const rowDate = new Date(String(row.date || row.markedAt || ""));
                if (Number.isNaN(rowDate.getTime()) || rowDate < startDate) {
                    return false;
                }
            }

            if (!query) {
                return true;
            }

            return [row.date, row.status, row.subject, row.markedAt]
                .join(" ")
                .toLowerCase()
                .includes(query);
        });
    }, [attendance, rangeFilter, subjectFilter, search, departmentSubjects]);

    const filteredTotals = useMemo(() => {
        return filteredAttendance.reduce(
            (acc, row) => {
                const status = String(row.status || "").toLowerCase();
                if (status === "present") acc.present += 1;
                if (status === "absent") acc.absent += 1;
                if (status === "leave") acc.leave += 1;
                return acc;
            },
            { present: 0, absent: 0, leave: 0 }
        );
    }, [filteredAttendance]);

    const filteredAttendancePercent = useMemo(() => {
        const total = Number(filteredTotals.present) + Number(filteredTotals.absent) + Number(filteredTotals.leave);
        if (!total) return 0;
        return Math.round((Number(filteredTotals.present) / total) * 100);
    }, [filteredTotals]);

    const subjectWiseSummary = useMemo(() => {
        const grouped = new Map();

        for (const row of filteredAttendance) {
            const subject = normalizeSubject(row.subject);
            if (!grouped.has(subject)) {
                grouped.set(subject, { present: 0, absent: 0, leave: 0, total: 0 });
            }

            const current = grouped.get(subject);
            const status = String(row.status || "").toLowerCase();
            if (status === "present") current.present += 1;
            if (status === "absent") current.absent += 1;
            if (status === "leave") current.leave += 1;
            current.total += 1;
        }

        return Array.from(grouped.entries())
            .map(([subject, value]) => ({
                subject,
                ...value,
                percentage: value.total ? Math.round((value.present / value.total) * 100) : 0,
            }))
            .sort((a, b) => a.subject.localeCompare(b.subject));
    }, [filteredAttendance]);

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(filteredAttendance.length / PAGE_SIZE)),
        [filteredAttendance.length]
    );

    const paginatedAttendance = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredAttendance.slice(start, start + PAGE_SIZE);
    }, [filteredAttendance, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, rangeFilter, subjectFilter]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    let studentProfileSection = null;
    if (loading) {
        studentProfileSection = <p className="mt-3 text-sm text-slate-500">Loading profile...</p>;
    } else if (student) {
        studentProfileSection = (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Info label="Name" value={student.name} />
                <Info label="Email" value={student.email} />
                <Info label="Department" value={student.department} capitalize />
                <Info label="Application ID" value={student.applicationId || "-"} />
            </div>
        );
    } else {
        studentProfileSection = (
            <p className="mt-3 text-sm text-slate-500">
                Student profile not found. Contact admin after merit registration.
            </p>
        );
    }

    let attendanceRows = null;
    if (loading) {
        attendanceRows = (
            <tr>
                <td colSpan={3} className="px-3 py-8 text-center text-slate-500">Loading attendance...</td>
            </tr>
        );
    } else if (filteredAttendance.length === 0) {
        attendanceRows = (
            <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-slate-500">No attendance records available.</td>
            </tr>
        );
    } else {
        attendanceRows = paginatedAttendance.map((row) => (
            <tr key={row.id} className="border-t border-stone-100">
                <td className="px-3 py-2">{row.date}</td>
                <td className="px-3 py-2">{formatSubjectLabel(row.subject)}</td>
                <td className="px-3 py-2 capitalize">{row.status}</td>
                <td className="px-3 py-2 text-slate-600">
                    {row.markedAt ? new Date(row.markedAt).toLocaleString() : "-"}
                </td>
            </tr>
        ));
    }

    return (
        <div className="min-h-screen space-y-6 bg-[#f6f3f1] p-4 md:p-6">
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900">My Student Profile</h1>
                {studentProfileSection}
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Attendance Summary</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                    <Info label="Present" value={String(filteredTotals.present || 0)} />
                    <Info label="Absent" value={String(filteredTotals.absent || 0)} />
                    <Info label="Leave" value={String(filteredTotals.leave || 0)} />
                    <Info label="Attendance %" value={`${filteredAttendancePercent}%`} />
                </div>

                <p className="mt-3 text-xs text-slate-500">
                    Overall all-time percentage: {attendancePercent}%
                </p>
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Subject Wise Attendance</h2>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {subjectWiseSummary.length === 0 && (
                        <p className="text-sm text-slate-500">No subject-wise records in selected filters.</p>
                    )}
                    {subjectWiseSummary.map((item) => (
                        <div key={item.subject} className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                            <p className="text-sm font-semibold text-slate-900">{formatSubjectLabel(item.subject)}</p>
                            <p className="mt-1 text-xs text-slate-600">
                                Present {item.present} | Absent {item.absent} | Leave {item.leave}
                            </p>
                            <p className="mt-2 text-lg font-bold text-[#7a1c1c]">{item.percentage}%</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Recent Attendance</h2>

                <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by date, subject, status..."
                        className="h-10 rounded-xl border border-stone-300 px-3 text-sm outline-none"
                    />

                    <select
                        value={subjectFilter}
                        onChange={(event) => setSubjectFilter(event.target.value)}
                        className="h-10 rounded-xl border border-stone-300 px-3 text-sm capitalize"
                    >
                        {availableSubjects.map((subject) => (
                            <option key={subject} value={subject}>
                                {subject === "all" ? "All" : formatSubjectLabel(subject)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                    {RANGE_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => setRangeFilter(option.value)}
                            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${rangeFilter === option.value
                                ? "border-[#7a1c1c] bg-[#7a1c1c] text-white"
                                : "border-stone-300 bg-white text-slate-700 hover:bg-stone-100"
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-stone-50 text-slate-600">
                            <tr>
                                <th className="px-3 py-2 text-left">Date</th>
                                <th className="px-3 py-2 text-left">Subject</th>
                                <th className="px-3 py-2 text-left">Status</th>
                                <th className="px-3 py-2 text-left">Marked At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceRows}
                        </tbody>
                    </table>
                </div>

                {!loading && filteredAttendance.length > 0 && (
                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-slate-500">Page {currentPage} of {totalPages}</p>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                type="button"
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function Info({ label, value, capitalize = false }) {
    return (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
            <p className={`mt-1 text-base font-semibold text-slate-900 ${capitalize ? "capitalize" : ""}`}>
                {value || "-"}
            </p>
        </div>
    );
}
