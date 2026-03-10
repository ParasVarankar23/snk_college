"use client";

import { useEffect, useState } from "react";

export default function ArtsTeachersSection() {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await fetch("/api/departments?department=arts", {
                    cache: "no-store",
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to load arts teachers");
                }

                setTeachers(data.teachers || []);
            } catch (err) {
                setError(err.message || "Failed to load arts teachers");
            } finally {
                setLoading(false);
            }
        };

        fetchTeachers();
    }, []);

    return (
        <section className="bg-gray-50 py-10 min-h-[60vh]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-14">
                    <h2 className="text-3xl font-bold text-gray-800">Arts Department Teachers</h2>
                    <p className="text-gray-600 mt-3">
                        Dedicated teachers helping students explore humanities and social
                        sciences with strong academic guidance.
                    </p>
                </div>

                {loading && <p className="text-center text-gray-500">Loading teachers...</p>}
                {error && <p className="text-center text-rose-600">{error}</p>}

                {!loading && !error && teachers.length === 0 && (
                    <p className="text-center text-gray-500">No teachers added yet for Arts department.</p>
                )}

                {!loading && !error && teachers.length > 0 && (
                    <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
                        {teachers.map((teacher) => (
                            <div
                                key={teacher.id}
                                className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition"
                            >
                                <img
                                    src={teacher.imageUrl}
                                    alt={teacher.name}
                                    className="mx-auto w-36 h-36 rounded-full mb-4 object-cover border border-gray-200"
                                />

                                <h3 className="text-lg font-semibold text-[#7a1c1c]">{teacher.name}</h3>

                                <p className="text-gray-600 text-sm mt-2">Subject: {teacher.subject}</p>

                                <p className="text-gray-500 text-sm mt-1">Education: {teacher.education}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
