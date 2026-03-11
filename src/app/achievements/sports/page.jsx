"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

/* eslint-disable react/prop-types */

export default function SportsAchievements() {
    return (
        <AchievementCategoryPage
            category="sports"
            title="Sports Achievements"
            description="Our students actively participate in sports competitions and achieve remarkable success."
            emptyMessage="No sports achievements added yet."
        />
    );
}

function AchievementCategoryPage({ category, title, description, emptyMessage }) {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                const response = await fetch(`/api/achievements?category=${category}`, {
                    cache: "no-store",
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to load achievements");
                }

                setAchievements(data.achievements || []);
            } catch (err) {
                setError(err.message || "Failed to load achievements");
            } finally {
                setLoading(false);
            }
        };

        fetchAchievements();
    }, [category]);

    return (
        <section className="bg-gray-50 py-5 min-h-[60vh]">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                    viewport={{ once: true }}
                >
                    <h1 className="text-4xl font-bold text-gray-800">{title}</h1>
                    <p className="text-gray-600 mt-4">{description}</p>
                </motion.div>

                {loading && <p className="text-center text-gray-500">Loading achievements...</p>}
                {error && <p className="text-center text-rose-600">{error}</p>}
                {!loading && !error && achievements.length === 0 && (
                    <p className="text-center text-gray-500">{emptyMessage}</p>
                )}

                {!loading && !error && achievements.length > 0 && (
                    <motion.div
                        className="grid gap-8 md:grid-cols-3"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        viewport={{ once: true, amount: 0.1 }}
                    >
                        {achievements.map((achievement) => (
                            <motion.div
                                key={achievement.id}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -6 }}
                                transition={{ duration: 0.45, ease: "easeOut" }}
                                viewport={{ once: true, amount: 0.2 }}
                                className="rounded-xl bg-white p-6 text-center shadow-md"
                            >
                                <img
                                    src={achievement.imageUrl}
                                    alt={achievement.title}
                                    className="mx-auto w-full h-56 rounded-lg mb-4 object-cover"
                                />

                                <h3 className="font-semibold text-[#7a1c1c] text-lg">{achievement.title}</h3>
                                <p className="text-gray-600 text-sm mt-2">{achievement.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </section>
    );
}
