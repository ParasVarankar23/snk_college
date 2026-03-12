"use client";

/* eslint-disable react/prop-types */

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

function parseBulkRows(input) {
    const extractEmail = (value) => {
        const raw = String(value || "").trim();
        if (!raw) return "";

        const markdownLinkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(raw);
        if (markdownLinkMatch) {
            const href = String(markdownLinkMatch[2] || "").trim();
            if (href.toLowerCase().startsWith("mailto:")) {
                return href.slice(7).trim().toLowerCase();
            }

            return String(markdownLinkMatch[1] || "").trim().toLowerCase();
        }

        return raw.toLowerCase();
    };

    const parseLine = (line) => {
        const row = String(line || "").trim();
        if (!row) return null;

        if (row.includes("|")) {
            const cells = row
                .split("|")
                .map((cell) => cell.trim())
                .filter(Boolean);

            if (cells.length === 0) return null;

            // Skip markdown separator row like | -----: | ------- |
            const isSeparator = cells.every((cell) => /^:?-{2,}:?$/.test(cell));
            if (isSeparator) return null;

            if (cells.length >= 5) {
                const [, applicationId = "", name = "", email = "", department = ""] = cells;
                return {
                    name,
                    email: extractEmail(email),
                    department: department.toLowerCase(),
                    applicationId: applicationId.toUpperCase(),
                };
            }

            if (cells.length >= 4) {
                const [applicationId = "", name = "", email = "", department = ""] = cells;
                return {
                    name,
                    email: extractEmail(email),
                    department: department.toLowerCase(),
                    applicationId: applicationId.toUpperCase(),
                };
            }

            return null;
        }

        const chunks = row.split(",").map((chunk) => chunk.trim());
        if (chunks.length >= 5) {
            const [, applicationId = "", name = "", email = "", department = ""] = chunks;
            return {
                name,
                email: extractEmail(email),
                department: department.toLowerCase(),
                applicationId: applicationId.toUpperCase(),
            };
        }

        if (chunks.length >= 4) {
            const [applicationId = "", name = "", email = "", department = ""] = chunks;
            return {
                name,
                email: extractEmail(email),
                department: department.toLowerCase(),
                applicationId: applicationId.toUpperCase(),
            };
        }

        if (chunks.length >= 3) {
            const [first = "", second = "", third = ""] = chunks;
            const firstLooksLikeAppId = /\d{4}.*[a-z]{2,}/i.test(first) || /^std\d+/i.test(first);

            if (firstLooksLikeAppId) {
                return {
                    applicationId: String(first || "").trim().toUpperCase(),
                    name: String(second || "").trim(),
                    email: "",
                    department: String(third || "").trim().toLowerCase(),
                };
            }

            const [name = "", email = "", department = ""] = chunks;
            return {
                name,
                email: extractEmail(email),
                department: department.toLowerCase(),
                applicationId: "",
            };
        }

        return null;
    };

    const lines = String(input || "")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    return lines
        .map((line) => {
            const parsed = parseLine(line);
            if (!parsed) return null;
            const { name = "", email = "", department = "", applicationId = "" } = parsed;

            if (
                name.toLowerCase() === "name" &&
                email.toLowerCase() === "email" &&
                department.toLowerCase() === "department"
            ) {
                return null;
            }

            if (
                name.toLowerCase() === "application id" ||
                applicationId.toLowerCase() === "application id"
            ) {
                return null;
            }

            return {
                name: String(name || "").trim(),
                email: String(email || "").trim().toLowerCase(),
                department: String(department || "").trim().toLowerCase(),
                applicationId: String(applicationId || "").trim().toUpperCase(),
            };
        })
        .filter(Boolean);
}

function normalizeHeader(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replaceAll(/[^a-z0-9]/g, "");
}

function rowsFromWorksheet(fileRows) {
    const mapByHeader = (row, headerMap) => {
        const getValue = (...aliases) => {
            for (const alias of aliases) {
                const normalized = normalizeHeader(alias);
                const key = headerMap.get(normalized);
                if (key && row[key] != null && String(row[key]).trim()) {
                    return String(row[key]).trim();
                }
            }
            return "";
        };

        return {
            applicationId: getValue("applicationid", "appid", "application", "id"),
            name: getValue("name", "studentname", "fullname"),
            email: getValue("email", "mail", "emailaddress"),
            department: getValue("department", "dept", "stream"),
        };
    };

    const normalized = fileRows
        .map((row) => {
            const keys = Object.keys(row || {});
            if (!keys.length) return null;

            const headerMap = new Map(keys.map((key) => [normalizeHeader(key), key]));
            const mapped = mapByHeader(row, headerMap);

            if (!mapped.name && !mapped.email && !mapped.department) {
                return null;
            }

            return {
                applicationId: mapped.applicationId.toUpperCase(),
                name: mapped.name,
                email: mapped.email.toLowerCase(),
                department: mapped.department.toLowerCase(),
            };
        })
        .filter(Boolean);

    return normalized;
}

export default function AdminStudentPage() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [bulkText, setBulkText] = useState("name,email,department");
    const [result, setResult] = useState(null);
    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("all");
    const [uploadingSheet, setUploadingSheet] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [manualForm, setManualForm] = useState({
        name: "",
        email: "",
        department: "science",
        applicationId: "",
    });
    const [editForm, setEditForm] = useState({
        studentId: "",
        name: "",
        email: "",
        department: "science",
        applicationId: "",
    });

    const departmentOptions = [
        { value: "all", label: "All" },
        { value: "science", label: "Science" },
        { value: "commerce", label: "Commerce" },
        { value: "arts", label: "Arts" },
    ];

    const previewRows = useMemo(() => {
        const parsed = parseBulkRows(bulkText);
        return parsed
            .filter((row) => row.name && row.department && (row.email || row.applicationId))
            .slice(0, 50);
    }, [bulkText]);

    const filteredStudents = useMemo(() => {
        const query = search.trim().toLowerCase();
        return students.filter((row) => {
            if (departmentFilter !== "all" && row.department !== departmentFilter) {
                return false;
            }

            if (!query) return true;

            return [row.name, row.email, row.department, row.applicationId]
                .join(" ")
                .toLowerCase()
                .includes(query);
        });
    }, [students, search, departmentFilter]);

    const requestWithAuth = async ({ body }) => {
        const token = globalThis.localStorage.getItem("authToken");
        if (!token) {
            throw new Error("Please login again");
        }

        const response = await fetch("/api/attendance", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Request failed");
        }

        return data;
    };

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
                throw new Error(data.error || "Failed to fetch students");
            }

            setStudents(data.students || []);
        } catch (error) {
            toast.error(error.message || "Failed to fetch students");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStudents();
    }, []);

    const resetManualForm = () => {
        setManualForm({ name: "", email: "", department: "science", applicationId: "" });
    };

    const resetBulkForm = () => {
        setBulkText("name,email,department");
    };

    const openEditModal = (row) => {
        setEditForm({
            studentId: row.id,
            name: row.name || "",
            email: row.email || "",
            department: row.department || "science",
            applicationId: row.applicationId || "",
        });
        setShowEditModal(true);
    };

    const handleExcelUpload = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) return;

        const fileName = String(file.name || "").toLowerCase();
        const isSpreadsheet =
            fileName.endsWith(".xlsx") ||
            fileName.endsWith(".xls") ||
            file.type.includes("sheet");

        if (!isSpreadsheet) {
            toast.error("Please upload an Excel file (.xlsx or .xls)");
            return;
        }

        try {
            setUploadingSheet(true);
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: "array" });
            const firstSheet = workbook.SheetNames[0];

            if (!firstSheet) {
                throw new Error("No sheet found in file");
            }

            const worksheet = workbook.Sheets[firstSheet];
            const rawRows = XLSX.utils.sheet_to_json(worksheet, {
                defval: "",
                raw: false,
            });

            const mappedRows = rowsFromWorksheet(rawRows);
            if (!mappedRows.length) {
                throw new Error("No valid rows found. Required columns: Name, Email, Department");
            }

            const csvText = [
                "applicationId,name,email,department",
                ...mappedRows.map(
                    (row) =>
                        `${row.applicationId},${row.name},${row.email},${row.department}`
                ),
            ].join("\n");

            setBulkText(csvText);
            toast.success(`Loaded ${mappedRows.length} student rows from Excel`);
        } catch (error) {
            toast.error(error.message || "Failed to read Excel file");
        } finally {
            setUploadingSheet(false);
        }
    };

    const handleRegister = async (event) => {
        event.preventDefault();

        const rows = parseBulkRows(bulkText);
        if (rows.length === 0) {
            toast.error("Add at least one student row: name,email,department");
            return;
        }

        try {
            setSubmitting(true);
            const token = globalThis.localStorage.getItem("authToken");
            if (!token) {
                throw new Error("Please login again");
            }

            const response = await fetch("/api/attendance", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    type: "bulk-register-students",
                    students: rows,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Bulk registration failed");
            }

            setResult(data);
            toast.success("Bulk student registration completed");
            await loadStudents();
            setShowBulkModal(false);
            resetBulkForm();
        } catch (error) {
            toast.error(error.message || "Bulk registration failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleManualAdd = async (event) => {
        event.preventDefault();

        try {
            setActionLoading(true);
            await requestWithAuth({
                body: {
                    type: "create-student",
                    name: manualForm.name,
                    email: manualForm.email,
                    department: manualForm.department,
                    applicationId: manualForm.applicationId,
                },
            });

            toast.success("Student added successfully");
            setShowAddModal(false);
            resetManualForm();
            await loadStudents();
        } catch (error) {
            toast.error(error.message || "Failed to add student");
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateStudent = async (event) => {
        event.preventDefault();

        try {
            setActionLoading(true);
            await requestWithAuth({
                body: {
                    type: "update-student",
                    studentId: editForm.studentId,
                    name: editForm.name,
                    email: editForm.email,
                    department: editForm.department,
                    applicationId: editForm.applicationId,
                },
            });

            toast.success("Student updated successfully");
            setShowEditModal(false);
            await loadStudents();
        } catch (error) {
            toast.error(error.message || "Failed to update student");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteStudent = async (student) => {
        const shouldDelete = globalThis.confirm(`Delete student ${student.name}? This also removes related attendance records.`);
        if (!shouldDelete) return;

        try {
            setActionLoading(true);
            await requestWithAuth({
                body: {
                    type: "delete-student",
                    studentId: student.id,
                },
            });

            toast.success("Student deleted successfully");
            await loadStudents();
        } catch (error) {
            toast.error(error.message || "Failed to delete student");
        } finally {
            setActionLoading(false);
        }
    };

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
                    No students found
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
                <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => openEditModal(row)}
                            className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700"
                        >
                            Edit
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDeleteStudent(row)}
                            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700"
                            disabled={actionLoading}
                        >
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        ));
    }

    return (
        <div className="min-h-screen space-y-6 bg-[#f6f3f1] p-4 md:p-6">
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900">Student Registration (Bulk)</h1>
                <p className="mt-1 text-sm text-slate-600">
                    Add students manually or in bulk with Excel/text import.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setShowAddModal(true)}
                        className="h-11 rounded-xl bg-[#7a1c1c] px-5 text-sm font-semibold text-white transition hover:bg-[#9f2a2a]"
                    >
                        Add Student
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowBulkModal(true)}
                        className="h-11 rounded-xl border border-stone-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:bg-stone-100"
                    >
                        Add Bulk
                    </button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <MetricCard label="Total Students" value={String(students.length)} />
                    <MetricCard
                        label="Science"
                        value={String(students.filter((row) => row.department === "science").length)}
                    />
                    <MetricCard
                        label="Commerce"
                        value={String(students.filter((row) => row.department === "commerce").length)}
                    />
                    <MetricCard
                        label="Arts"
                        value={String(students.filter((row) => row.department === "arts").length)}
                    />
                </div>

                {result && (
                    <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-slate-700">
                        <p>Created: {result.createdCount || 0}</p>
                        <p>Updated: {result.updatedCount || 0}</p>
                        <p>Failed: {(result.failed || []).length}</p>
                        <p>Credentials Email Sent: {result.emailedCount || 0}</p>
                        {(result.emailFailed || []).length > 0 && (
                            <p className="mt-1 text-xs text-amber-700">
                                Email failed for {(result.emailFailed || []).length} students. Please verify SMTP settings.
                            </p>
                        )}
                        {(result.credentials || []).length > 0 && (
                            <div className="mt-3 rounded-lg border border-emerald-200 bg-white p-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Generated Login Credentials</p>
                                <p className="mt-1 text-xs text-slate-600">
                                    Passwords are generated for newly created accounts. Students also receive these on email directly.
                                </p>
                                <div className="mt-2 overflow-x-auto">
                                    <table className="min-w-full text-xs">
                                        <thead className="bg-emerald-50 text-emerald-800">
                                            <tr>
                                                <th className="px-2 py-1 text-left">Name</th>
                                                <th className="px-2 py-1 text-left">Email</th>
                                                <th className="px-2 py-1 text-left">Application ID</th>
                                                <th className="px-2 py-1 text-left">Password</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result.credentials.map((item) => (
                                                <tr key={`${item.email}_${item.row}`} className="border-t border-emerald-100">
                                                    <td className="px-2 py-1">{item.name}</td>
                                                    <td className="px-2 py-1">{item.email}</td>
                                                    <td className="px-2 py-1">{item.applicationId || "-"}</td>
                                                    <td className="px-2 py-1 font-semibold text-slate-900">{item.password}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">Registered Students ({filteredStudents.length})</h2>

                    <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                        <select
                            value={departmentFilter}
                            onChange={(event) => setDepartmentFilter(event.target.value)}
                            className="h-10 rounded-xl border border-stone-300 px-3 text-sm capitalize outline-none"
                        >
                            {departmentOptions.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>

                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="h-10 w-full rounded-xl border border-stone-300 px-3 text-sm outline-none sm:w-80"
                            placeholder="Search name, email, department..."
                        />
                    </div>
                </div>

                <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-stone-50 text-slate-600">
                            <tr>
                                <th className="px-3 py-2 text-left">Name</th>
                                <th className="px-3 py-2 text-left">Email</th>
                                <th className="px-3 py-2 text-left">Department</th>
                                <th className="px-3 py-2 text-left">Application ID</th>
                                <th className="px-3 py-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>{studentRows}</tbody>
                    </table>
                </div>
            </div>

            {showAddModal && (
                <ModalShell title="Add Student" onClose={() => setShowAddModal(false)}>
                    <form onSubmit={handleManualAdd} className="space-y-3">
                        <FormField
                            label="Name"
                            value={manualForm.name}
                            onChange={(value) => setManualForm((prev) => ({ ...prev, name: value }))}
                            placeholder="Student name"
                        />
                        <FormField
                            label="Email"
                            value={manualForm.email}
                            onChange={(value) => setManualForm((prev) => ({ ...prev, email: value }))}
                            placeholder="student@email.com"
                        />
                        <SelectField
                            label="Department"
                            value={manualForm.department}
                            onChange={(value) => setManualForm((prev) => ({ ...prev, department: value }))}
                            options={departmentOptions.filter((item) => item.value !== "all")}
                        />
                        <FormField
                            label="Application ID (optional)"
                            value={manualForm.applicationId}
                            onChange={(value) => setManualForm((prev) => ({ ...prev, applicationId: value.toUpperCase() }))}
                            placeholder="2026SNK0007"
                        />

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddModal(false);
                                    resetManualForm();
                                }}
                                className="h-10 rounded-lg border border-stone-300 px-4 text-sm font-semibold text-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="h-10 rounded-lg bg-[#7a1c1c] px-4 text-sm font-semibold text-white disabled:opacity-70"
                            >
                                {actionLoading ? "Saving..." : "Save Student"}
                            </button>
                        </div>
                    </form>
                </ModalShell>
            )}

            {showBulkModal && (
                <ModalShell title="Bulk Add Students" onClose={() => setShowBulkModal(false)} size="xl">
                    <div className="space-y-4">
                        <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                            <p className="text-xs font-medium text-slate-700">
                                Upload Excel (.xlsx/.xls) with columns: Application ID, Name, Department, Email (optional if Application ID maps to admission record)
                            </p>
                            <label className="mt-2 inline-flex cursor-pointer items-center rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-stone-100">
                                {uploadingSheet ? "Reading Excel..." : "Upload Excel Sheet"}
                                <input
                                    type="file"
                                    accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                                    onChange={handleExcelUpload}
                                    className="hidden"
                                    disabled={uploadingSheet || submitting}
                                />
                            </label>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-4">
                            <textarea
                                value={bulkText}
                                onChange={(event) => setBulkText(event.target.value)}
                                className="min-h-44 w-full rounded-xl border border-stone-300 p-4 text-sm outline-none focus:border-[#7a1c1c]/60"
                                placeholder="applicationId,name,email(optional),department"
                            />

                            <div>
                                <p className="text-sm font-semibold text-slate-800">Preview ({previewRows.length})</p>
                                <div className="mt-2 max-h-56 overflow-auto rounded-xl border border-stone-200">
                                    <table className="min-w-full text-xs">
                                        <thead className="bg-stone-50 text-slate-600">
                                            <tr>
                                                <th className="px-3 py-2 text-left">Application ID</th>
                                                <th className="px-3 py-2 text-left">Name</th>
                                                <th className="px-3 py-2 text-left">Email</th>
                                                <th className="px-3 py-2 text-left">Department</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewRows.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="px-3 py-3 text-center text-slate-500">
                                                        No valid preview rows yet.
                                                    </td>
                                                </tr>
                                            )}
                                            {previewRows.map((row, index) => (
                                                <tr key={`${row.email}_${index}`} className="border-t border-stone-100">
                                                    <td className="px-3 py-2">{row.applicationId || "-"}</td>
                                                    <td className="px-3 py-2">{row.name}</td>
                                                    <td className="px-3 py-2">{row.email}</td>
                                                    <td className="px-3 py-2 capitalize">{row.department}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowBulkModal(false);
                                        resetBulkForm();
                                    }}
                                    className="h-10 rounded-lg border border-stone-300 px-4 text-sm font-semibold text-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="h-10 rounded-lg bg-[#7a1c1c] px-4 text-sm font-semibold text-white disabled:opacity-70"
                                >
                                    {submitting ? "Registering..." : "Register Students"}
                                </button>
                            </div>
                        </form>
                    </div>
                </ModalShell>
            )}

            {showEditModal && (
                <ModalShell title="Edit Student" onClose={() => setShowEditModal(false)}>
                    <form onSubmit={handleUpdateStudent} className="space-y-3">
                        <FormField
                            label="Name"
                            value={editForm.name}
                            onChange={(value) => setEditForm((prev) => ({ ...prev, name: value }))}
                            placeholder="Student name"
                        />
                        <FormField
                            label="Email"
                            value={editForm.email}
                            onChange={(value) => setEditForm((prev) => ({ ...prev, email: value }))}
                            placeholder="student@email.com"
                        />
                        <SelectField
                            label="Department"
                            value={editForm.department}
                            onChange={(value) => setEditForm((prev) => ({ ...prev, department: value }))}
                            options={departmentOptions.filter((item) => item.value !== "all")}
                        />
                        <FormField
                            label="Application ID"
                            value={editForm.applicationId}
                            onChange={(value) => setEditForm((prev) => ({ ...prev, applicationId: value.toUpperCase() }))}
                            placeholder="2026SNK0001"
                        />

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowEditModal(false)}
                                className="h-10 rounded-lg border border-stone-300 px-4 text-sm font-semibold text-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="h-10 rounded-lg bg-[#7a1c1c] px-4 text-sm font-semibold text-white disabled:opacity-70"
                            >
                                {actionLoading ? "Updating..." : "Update Student"}
                            </button>
                        </div>
                    </form>
                </ModalShell>
            )}
        </div>
    );
}

function MetricCard({ label, value }) {
    return (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
        </div>
    );
}

function FormField({ label, value, onChange, placeholder }) {
    return (
        <label className="block">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="h-10 w-full rounded-lg border border-stone-300 px-3 text-sm outline-none focus:border-[#7a1c1c]/60"
            />
        </label>
    );
}

function SelectField({ label, value, onChange, options }) {
    return (
        <label className="block">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-10 w-full rounded-lg border border-stone-300 px-3 text-sm capitalize outline-none focus:border-[#7a1c1c]/60"
            >
                {options.map((item) => (
                    <option key={item.value} value={item.value}>
                        {item.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

function ModalShell({ title, onClose, children, size = "md" }) {
    const widthClass = size === "xl" ? "max-w-4xl" : "max-w-lg";

    return (
        <dialog
            open
            className="fixed inset-0 z-100 m-0 h-screen w-screen max-h-none max-w-none border-0 bg-transparent p-0"
        >
            <div className="absolute inset-0 bg-black/35" onClick={onClose} aria-hidden="true" />
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className={`w-full ${widthClass} rounded-2xl border border-stone-200 bg-white p-5 shadow-xl`}>
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md border border-stone-300 px-2 py-1 text-xs font-semibold text-slate-600"
                        >
                            Close
                        </button>
                    </div>
                    {children}
                </div>
            </div>
        </dialog>
    );
}
