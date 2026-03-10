"use client";

import { useEffect, useState } from "react";

/* eslint-disable react/prop-types */

export default function AwardsPage() {
    return (
        <AchievementCategoryPage
            category="awards"
            title="Awards & Honors"
            description="The college has received several awards for excellence in education, sports, and cultural activities."
            emptyMessage="No awards added yet."
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
        <section className="bg-gray-50 py-10 min-h-[60vh]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800">{title}</h1>
                    <p className="text-gray-600 mt-4">{description}</p>
                </div>

                {loading && <p className="text-center text-gray-500">Loading achievements...</p>}
                {error && <p className="text-center text-rose-600">{error}</p>}
                {!loading && !error && achievements.length === 0 && (
                    <p className="text-center text-gray-500">{emptyMessage}</p>
                )}

                {!loading && !error && achievements.length > 0 && (
                    <div className="grid md:grid-cols-3 gap-8">
                        {achievements.map((achievement) => (
                            <div key={achievement.id} className="bg-white p-6 rounded-xl shadow-md text-center">
                                <img
                                    src={achievement.imageUrl}
                                    alt={achievement.title}
                                    className="mx-auto w-full h-56 rounded-lg mb-4 object-cover"
                                />

                                <h3 className="font-semibold text-[#7a1c1c] text-lg">{achievement.title}</h3>
                                <p className="text-gray-600 text-sm mt-2">{achievement.description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
