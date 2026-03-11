"use client";

import { FileText, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 10;

export default function AdminMeritPage() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [form, setForm] = useState({
        title: "",
        description: "",
        collegeName: "Shri Nanasaheb Kulkarni Kanishta Mahavidyalay, Borli Panchatan",
        file: null,
    });

    const loadMeritNotices = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch("/api/merit", { cache: "no-store" });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch merit records");
            }
            setRecords(data.meritNotices || []);
        } catch (err) {
            setError(err.message || "Failed to fetch merit records");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMeritNotices();
    }, []);

    const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));

    const paginatedRecords = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return records.slice(start, start + PAGE_SIZE);
    }, [records, currentPage]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");

        if (!form.title.trim() || !form.description.trim() || !form.collegeName.trim()) {
            setError("Please fill title, description, and college name");
            return;
        }

        if (!form.file) {
            setError("Please choose a PDF file");
            return;
        }

        setUploading(true);
        try {
            const token = globalThis.localStorage.getItem("authToken");
            if (!token) {
                throw new Error("Please login again as admin");
            }

            const body = new FormData();
            body.set("title", form.title.trim());
            body.set("description", form.description.trim());
            body.set("collegeName", form.collegeName.trim());
            body.set("file", form.file);

            const response = await fetch("/api/merit", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body,
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to upload merit list");
            }

            setMessage("Merit list uploaded successfully");
            setForm((prev) => ({ ...prev, title: "", description: "", file: null }));
            await loadMeritNotices();
        } catch (err) {
            setError(err.message || "Failed to upload merit list");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = globalThis.confirm("Delete this merit record?");
        if (!confirmed) return;

        setError("");
        setMessage("");
        try {
            const token = globalThis.localStorage.getItem("authToken");
            if (!token) {
                throw new Error("Please login again as admin");
            }

            const response = await fetch(`/api/merit?id=${encodeURIComponent(id)}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to delete merit record");
            }

            setRecords((prev) => prev.filter((item) => item.id !== id));
            setMessage("Merit record deleted");
        } catch (err) {
            setError(err.message || "Failed to delete merit record");
        }
    };

    let recordsContent = null;
    if (loading) {
        recordsContent = <p className="mt-4 text-sm text-slate-500">Loading merit records...</p>;
    } else if (records.length === 0) {
        recordsContent = (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                No merit records uploaded yet.
            </div>
        );
    } else {
        recordsContent = (
            <div className="mt-4 space-y-3">
                {paginatedRecords.map((item) => (
                    <article key={item.id} className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a1c1c]">{item.collegeName}</p>
                                <h3 className="mt-1 text-lg font-bold text-slate-900">{item.title}</h3>
                                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                                <p className="mt-1 text-xs text-slate-500">Uploaded: {new Date(item.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={item.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 rounded-lg border border-[#7a1c1c]/20 bg-[#7a1c1c]/5 px-3 py-2 text-sm font-semibold text-[#7a1c1c]"
                                >
                                    <FileText size={15} /> View PDF
                                </a>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(item.id)}
                                    className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600"
                                >
                                    <Trash2 size={15} /> Delete
                                </button>
                            </div>
                        </div>
                    </article>
                ))}

                {records.length > 0 && (
                    <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:items-center sm:justify-between">
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
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#fcf4f4_0%,#f7f3f3_45%,#f3f1f1_100%)] px-4 py-6 md:px-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <section className="rounded-3xl border border-[#7a1c1c]/10 bg-white p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7a1c1c]">Admin Merit Upload</p>
                    <h1 className="mt-2 text-2xl font-black text-slate-900">Upload Merit List PDF</h1>
                    <p className="mt-1 text-sm text-slate-500">Upload merit list with proper title and description for students.</p>

                    <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={form.collegeName}
                            onChange={(event) => setForm((prev) => ({ ...prev, collegeName: event.target.value }))}
                            className="h-12 rounded-xl border border-slate-200 px-4 text-sm text-slate-700 outline-none focus:border-[#7a1c1c]"
                            placeholder="College name"
                        />
                        <input
                            type="text"
                            value={form.title}
                            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                            className="h-12 rounded-xl border border-slate-200 px-4 text-sm text-slate-700 outline-none focus:border-[#7a1c1c]"
                            placeholder="Merit title"
                        />
                        <textarea
                            value={form.description}
                            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                            className="md:col-span-2 min-h-28 rounded-xl border border-slate-200 p-4 text-sm text-slate-700 outline-none focus:border-[#7a1c1c]"
                            placeholder="Write merit description"
                        />
                        <label className="md:col-span-2 flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-[#7a1c1c]/30 bg-[#7a1c1c]/5 px-4 py-3 text-sm text-slate-700">
                            <span className="truncate">{form.file ? form.file.name : "Select Merit PDF"}</span>
                            <input
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={(event) => setForm((prev) => ({ ...prev, file: event.target.files?.[0] || null }))}
                            />
                            <Upload size={16} className="text-[#7a1c1c]" />
                        </label>

                        <button
                            type="submit"
                            disabled={uploading}
                            className="h-12 rounded-xl bg-linear-to-r from-[#9f2a2a] via-[#7a1c1c] to-[#5a1414] text-sm font-semibold text-white disabled:opacity-60"
                        >
                            {uploading ? "Uploading..." : "Upload Merit PDF"}
                        </button>
                    </form>

                    {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
                    {message && <p className="mt-3 text-sm text-emerald-600">{message}</p>}
                </section>

                <section className="rounded-3xl border border-[#7a1c1c]/10 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900">Uploaded Merit Lists</h2>
                        <span className="rounded-full bg-[#7a1c1c]/10 px-3 py-1 text-xs font-semibold text-[#7a1c1c]">
                            Total: {records.length}
                        </span>
                    </div>

                    {recordsContent}
                </section>
            </div>
        </div>
    );
}
