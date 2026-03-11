"use client";

import { motion } from "framer-motion";
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
                <motion.div
                    className="text-center mb-14"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl font-bold text-gray-800">Arts Department Teachers</h2>
                    <p className="text-gray-600 mt-3">
                        Dedicated teachers helping students explore humanities and social
                        sciences with strong academic guidance.
                    </p>
                </motion.div>

                {loading && <p className="text-center text-gray-500">Loading teachers...</p>}
                {error && <p className="text-center text-rose-600">{error}</p>}

                {!loading && !error && teachers.length === 0 && (
                    <p className="text-center text-gray-500">No teachers added yet for Arts department.</p>
                )}

                {!loading && !error && teachers.length > 0 && (
                    <motion.div
                        className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        viewport={{ once: true, amount: 0.1 }}
                    >
                        {teachers.map((teacher) => (
                            <motion.div
                                key={teacher.id}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -6 }}
                                transition={{ duration: 0.45, ease: "easeOut" }}
                                viewport={{ once: true, amount: 0.2 }}
                                className="bg-white rounded-xl shadow-md p-6 text-center transition hover:shadow-xl"
                            >
                                <img
                                    src={teacher.imageUrl}
                                    alt={teacher.name}
                                    className="mx-auto w-36 h-36 rounded-full mb-4 object-cover border border-gray-200"
                                />

                                <h3 className="text-lg font-semibold text-[#7a1c1c]">{teacher.name}</h3>

                                <p className="text-gray-600 text-sm mt-2">Subject: {teacher.subject}</p>

                                <p className="text-gray-500 text-sm mt-1">Education: {teacher.education}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </section>
    );
}
