"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function TeacherStudentsPage() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const filteredStudents = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return students;

        return students.filter((row) =>
            [row.name, row.email, row.department, row.applicationId]
                .join(" ")
                .toLowerCase()
                .includes(query)
        );
    }, [students, search]);

    useEffect(() => {
        const loadStudents = async () => {
            try {
                setLoading(true);
                const token = globalThis.localStorage.getItem("authToken");
                if (!token) {
                    throw new Error("Please login again");
                }

                const response = await fetch("/api/attendance?type=students", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || "Failed to load students");
                }

                setStudents(data.students || []);
            } catch (error) {
                toast.error(error.message || "Failed to load students");
            } finally {
                setLoading(false);
            }
        };

        loadStudents();
    }, []);

    const departmentLabel = students[0]?.department || "department";

    let studentRows = null;
    if (loading) {
        studentRows = (
            <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-slate-500">
                    Loading students...
                </td>
            </tr>
        );
    } else if (filteredStudents.length === 0) {
        studentRows = (
            <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-slate-500">
                    No students found.
                </td>
            </tr>
        );
    } else {
        studentRows = filteredStudents.map((row) => (
            <tr key={row.id} className="border-t border-stone-100">
                <td className="px-3 py-2">{row.name}</td>
                <td className="px-3 py-2">{row.email}</td>
                <td className="px-3 py-2 capitalize">{row.department}</td>
                <td className="px-3 py-2">{row.applicationId || "-"}</td>
            </tr>
        ));
    }

    return (
        <div className="min-h-screen space-y-6 bg-[#f6f3f1] p-4 md:p-6">
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900">My Students</h1>
                <p className="mt-1 text-sm text-slate-600 capitalize">
                    You can view only {departmentLabel} department students.
                </p>

                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="mt-4 h-10 w-full max-w-md rounded-xl border border-stone-300 px-3 text-sm"
                    placeholder="Search by name, email, application ID"
                />
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-stone-50 text-slate-600">
                            <tr>
                                <th className="px-3 py-2 text-left">Name</th>
                                <th className="px-3 py-2 text-left">Email</th>
                                <th className="px-3 py-2 text-left">Department</th>
                                <th className="px-3 py-2 text-left">Application ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentRows}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
