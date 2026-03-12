"use client";

/* eslint-disable react/prop-types */

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const statusOptions = ["present", "absent", "leave"];
const SUBJECTS_BY_DEPARTMENT = {
    science: ["physics", "chemistry", "biology", "maths", "english", "marathi"],
    commerce: ["account", "secretarial practice", "organization of commerce", "economics", "english", "marathi"],
    arts: ["english", "marathi", "geography", "history", "political science", "economics"],
};
const defaultSubjectOptions = SUBJECTS_BY_DEPARTMENT.science;

function normalizeSubject(value) {
    return String(value || "").trim().toLowerCase();
}

function getDepartmentSubjects(department) {
    const key = String(department || "").trim().toLowerCase();
    return SUBJECTS_BY_DEPARTMENT[key] || [];
}

function today() {
    return new Date().toISOString().slice(0, 10);
}

function getStatusActiveClass(status) {
    if (status === "present") return "border-emerald-300 bg-emerald-50 text-emerald-700";
    if (status === "absent") return "border-rose-300 bg-rose-50 text-rose-700";
    if (status === "leave") return "border-amber-300 bg-amber-50 text-amber-700";
    return "border-slate-300 bg-slate-100 text-slate-700";
}

const PAGE_SIZE = 10;

export default function TeacherAttendancePage() {
    const [date, setDate] = useState(today());
    const [subject, setSubject] = useState("general");
    const [subjectOptions, setSubjectOptions] = useState(defaultSubjectOptions);
    const [teacherDepartment, setTeacherDepartment] = useState("");
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [statusMap, setStatusMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const stats = useMemo(() => {
        return Object.values(statusMap).reduce(
            (acc, status) => {
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            },
            { present: 0, absent: 0, leave: 0 }
        );
    }, [statusMap]);

    const filteredStudents = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return students;
        return students.filter((student) =>
            [student.name, student.email, student.department, student.applicationId]
                .join(" ")
                .toLowerCase()
                .includes(query)
        );
    }, [students, search]);

    const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));

    const paginatedStudents = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredStudents.slice(start, start + PAGE_SIZE);
    }, [filteredStudents, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const loadData = async () => {
        try {
            setLoading(true);
            const token = globalThis.localStorage.getItem("authToken");
            if (!token) {
                throw new Error("Please login again");
            }

            const teacherMetaResponse = await fetch("/api/attendance?type=teacher-meta", {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
            });

            const teacherMetaData = await teacherMetaResponse.json();
            if (!teacherMetaResponse.ok) {
                throw new Error(teacherMetaData.error || "Failed to load teacher subjects");
            }

            setTeacherDepartment(String(teacherMetaData.department || "").trim().toLowerCase());

            const teacherSubjects = Array.isArray(teacherMetaData.subjects)
                ? teacherMetaData.subjects.map((item) => normalizeSubject(item)).filter(Boolean)
                : [];

            const teacherDepartmentSubjects = Array.isArray(teacherMetaData.departmentSubjects)
                ? teacherMetaData.departmentSubjects.map((item) => normalizeSubject(item)).filter(Boolean)
                : getDepartmentSubjects(teacherMetaData.department);

            let options = teacherSubjects;
            if (options.length === 0) {
                options = teacherDepartmentSubjects.length > 0 ? teacherDepartmentSubjects : ["general"];
            }
            setSubjectOptions(options);

            const effectiveSubject = options.includes(normalizeSubject(subject))
                ? normalizeSubject(subject)
                : options[0];

            if (effectiveSubject !== subject) {
                setSubject(effectiveSubject);
            }

            const [studentsResponse, attendanceResponse] = await Promise.all([
                fetch("/api/attendance?type=students", {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                }),
                fetch(`/api/attendance?date=${encodeURIComponent(date)}&subject=${encodeURIComponent(effectiveSubject)}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                }),
            ]);

            const studentsData = await studentsResponse.json();
            const attendanceData = await attendanceResponse.json();

            if (!studentsResponse.ok) {
                throw new Error(studentsData.error || "Failed to load students");
            }

            if (!attendanceResponse.ok) {
                throw new Error(attendanceData.error || "Failed to load attendance");
            }

            const list = studentsData.students || [];
            setStudents(list);

            const byStudent = (attendanceData.attendance || []).reduce((acc, row) => {
                acc[row.studentId] = row.status;
                return acc;
            }, {});

            const initialMap = {};
            list.forEach((student) => {
                initialMap[student.id] = byStudent[student.id] || "pending";
            });
            setStatusMap(initialMap);
        } catch (error) {
            toast.error(error.message || "Failed to load attendance");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [date, subject]);

    const handleStatusChange = (studentId, value) => {
        setStatusMap((prev) => ({
            ...prev,
            [studentId]: value,
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const token = globalThis.localStorage.getItem("authToken");
            if (!token) {
                throw new Error("Please login again");
            }

            const entries = students
                .map((student) => ({
                    studentId: student.id,
                    status: statusMap[student.id] || "pending",
                }))
                .filter((entry) => statusOptions.includes(entry.status));

            if (entries.length === 0) {
                throw new Error("Mark at least one student as Present, Absent, or Leave");
            }

            const response = await fetch("/api/attendance", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    type: "mark-attendance",
                    date,
                    subject,
                    entries,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to save attendance");
            }

            toast.success(`Attendance saved (${data.markedCount || 0} students)`);
        } catch (error) {
            toast.error(error.message || "Failed to save attendance");
        } finally {
            setSaving(false);
        }
    };

    const department = teacherDepartment || students[0]?.department || "";

    let attendanceRows = null;
    if (loading) {
        attendanceRows = (
            <tr>
                <td colSpan={3} className="px-3 py-8 text-center text-slate-500">
                    Loading students...
                </td>
            </tr>
        );
    } else if (filteredStudents.length === 0) {
        attendanceRows = (
            <tr>
                <td colSpan={3} className="px-3 py-8 text-center text-slate-500">
                    No students found.
                </td>
            </tr>
        );
    } else {
        attendanceRows = paginatedStudents.map((student) => (
            <tr key={student.id} className="border-t border-stone-100">
                <td className="px-3 py-2">{student.name}</td>
                <td className="px-3 py-2">{student.email}</td>
                <td className="px-3 py-2">
                    <div className="flex flex-wrap items-center gap-2">
                        {["pending", ...statusOptions].map((status) => {
                            const isActive = (statusMap[student.id] || "pending") === status;
                            const activeClass = getStatusActiveClass(status);

                            return (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => handleStatusChange(student.id, status)}
                                    className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize transition ${isActive
                                            ? activeClass
                                            : "border-stone-300 bg-white text-slate-600 hover:bg-stone-100"
                                        }`}
                                >
                                    {status}
                                </button>
                            );
                        })}
                    </div>
                </td>
            </tr>
        ));
    }

    return (
        <div className="min-h-screen space-y-6 bg-[#f6f3f1] p-4 md:p-6">
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900">Teacher Attendance</h1>
                <p className="mt-1 text-sm text-slate-600 capitalize">
                    Mark attendance for {department || "your"} department students.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <select
                        value={subject}
                        onChange={(event) => setSubject(event.target.value)}
                        className="h-10 rounded-xl border border-stone-300 px-3 text-sm capitalize"
                    >
                        {subjectOptions.map((item) => (
                            <option key={item} value={item} className="capitalize">
                                {item}
                            </option>
                        ))}
                    </select>

                    <input
                        type="date"
                        value={date}
                        onChange={(event) => setDate(event.target.value)}
                        className="h-10 rounded-xl border border-stone-300 px-3 text-sm"
                    />

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || loading || students.length === 0}
                        className="h-10 rounded-xl bg-[#7a1c1c] px-4 text-sm font-semibold text-white disabled:opacity-60"
                    >
                        {saving ? "Saving..." : "Save Attendance"}
                    </button>
                </div>

                <p className="mt-2 text-xs text-slate-500 capitalize">Selected subject: {subject}</p>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <Stat label="Present" value={stats.present || 0} />
                    <Stat label="Absent" value={stats.absent || 0} />
                    <Stat label="Leave" value={stats.leave || 0} />
                </div>
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">Students ({filteredStudents.length})</h2>
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="h-10 w-full rounded-xl border border-stone-300 px-3 text-sm outline-none sm:w-80"
                        placeholder="Search name, email, application ID..."
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-stone-50 text-slate-600">
                            <tr>
                                <th className="px-3 py-2 text-left">Name</th>
                                <th className="px-3 py-2 text-left">Email</th>
                                <th className="px-3 py-2 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceRows}
                        </tbody>
                    </table>
                </div>

                {!loading && filteredStudents.length > 0 && (
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

function Stat({ label, value }) {
    return (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
        </div>
    );
}
