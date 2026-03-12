"use client";

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
    const [uploadingSheet, setUploadingSheet] = useState(false);

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
        } catch (error) {
            toast.error(error.message || "Bulk registration failed");
        } finally {
            setSubmitting(false);
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
            </tr>
        ));
    }

    return (
        <div className="min-h-screen space-y-6 bg-[#f6f3f1] p-4 md:p-6">
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900">Student Registration (Bulk)</h1>
                <p className="mt-1 text-sm text-slate-600">
                    Add students from merit list in bulk format: name,email,department
                </p>

                <div className="mt-3 rounded-xl border border-stone-200 bg-stone-50 p-3">
                    <p className="text-xs font-medium text-slate-700">
                        Excel Upload: .xlsx/.xls with columns like Application ID, Name, Email, Department
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

                <form onSubmit={handleRegister} className="mt-4 space-y-4">
                    <textarea
                        value={bulkText}
                        onChange={(event) => setBulkText(event.target.value)}
                        className="min-h-44 w-full rounded-xl border border-stone-300 p-4 text-sm outline-none focus:border-[#7a1c1c]/60"
                        placeholder="name,email,department"
                    />

                    <button
                        type="submit"
                        disabled={submitting}
                        className="h-11 rounded-xl bg-[#7a1c1c] px-5 text-sm font-semibold text-white transition hover:bg-[#9f2a2a] disabled:opacity-70"
                    >
                        {submitting ? "Registering..." : "Register Students"}
                    </button>
                </form>

                {result && (
                    <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-slate-700">
                        <p>Created: {result.createdCount || 0}</p>
                        <p>Updated: {result.updatedCount || 0}</p>
                        <p>Failed: {(result.failed || []).length}</p>
                        <p className="mt-1 text-xs text-slate-500">
                            For security reasons, passwords are never shown on screen.
                        </p>
                    </div>
                )}
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">Registered Students ({students.length})</h2>
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="h-10 w-full rounded-xl border border-stone-300 px-3 text-sm outline-none sm:w-80"
                        placeholder="Search name, email, department..."
                    />
                </div>

                <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-stone-50 text-slate-600">
                            <tr>
                                <th className="px-3 py-2 text-left">Name</th>
                                <th className="px-3 py-2 text-left">Email</th>
                                <th className="px-3 py-2 text-left">Department</th>
                                <th className="px-3 py-2 text-left">Application ID</th>
                            </tr>
                        </thead>
                        <tbody>{studentRows}</tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
