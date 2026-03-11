"use client";

import { ExternalLink, FileText } from "lucide-react";
import { useEffect, useState } from "react";

export default function MeritPage() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadMeritNotices = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await fetch("/api/merit", { cache: "no-store" });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || "Failed to fetch merit list");
                }
                setRecords(data.meritNotices || []);
            } catch (err) {
                setError(err.message || "Failed to fetch merit list");
            } finally {
                setLoading(false);
            }
        };

        loadMeritNotices();
    }, []);

    let content = null;
    if (loading) {
        content = (
            <section className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading merit list...</section>
        );
    } else if (error) {
        content = (
            <section className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-600">{error}</section>
        );
    } else if (records.length === 0) {
        content = (
            <section className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-sm text-slate-500">
                Merit list is not uploaded yet. Please check again later.
            </section>
        );
    } else {
        content = (
            <section className="grid gap-4 md:grid-cols-2">
                {records.map((item) => (
                    <article key={item.id} className="rounded-3xl border border-[#7a1c1c]/10 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a1c1c]">{item.collegeName}</p>
                        <h2 className="mt-2 text-lg font-bold text-slate-900">{item.title}</h2>
                        <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                        <p className="mt-2 text-xs text-slate-500">Uploaded on {new Date(item.createdAt).toLocaleString()}</p>

                        <div className="mt-4 flex items-center gap-2">
                            <a
                                href={item.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-[#9f2a2a] via-[#7a1c1c] to-[#5a1414] px-4 py-2 text-sm font-semibold text-white"
                            >
                                <FileText size={16} /> Open PDF
                            </a>
                            <a
                                href={item.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                            >
                                <ExternalLink size={16} /> View
                            </a>
                        </div>
                    </article>
                ))}
            </section>
        );
    }

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#fdf5f5_0%,#f8f6f6_42%,#f4f2f2_100%)] px-4 py-6 md:px-6">
            <div className="mx-auto max-w-6xl space-y-6">
                <section className="rounded-3xl border border-[#7a1c1c]/10 bg-white p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7a1c1c]">Merit List</p>
                    <h1 className="mt-2 text-2xl font-black text-slate-900">College Merit List PDF</h1>
                    <p className="mt-2 text-sm text-slate-500">View latest merit lists uploaded by the college administration.</p>
                </section>

                {content}
            </div>
        </div>
    );
}
