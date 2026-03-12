"use client";

import { useEffect, useMemo, useState } from "react";

/* eslint-disable react/prop-types */

const departmentMeta = {
    arts: {
        icon: "🎨",
        gradient: "from-[#7a1c1c] to-[#5a1414]",
        surface: "from-[#fdf4f4] to-[#f9ecec]",
    },
    commerce: {
        icon: "💼",
        gradient: "from-[#7a1c1c] to-[#5a1414]",
        surface: "from-[#fdf4f4] to-[#f9ecec]",
    },
    science: {
        icon: "🔬",
        gradient: "from-[#7a1c1c] to-[#5a1414]",
        surface: "from-[#fdf4f4] to-[#f9ecec]",
    },
};

export default function AcademicCoursePage({ standard, department, fallbackTitle, fallbackSubtitle }) {
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const meta = departmentMeta[department] || departmentMeta.arts;

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const params = new URLSearchParams({ standard, department });
                const response = await fetch(`/api/academics?${params.toString()}`, {
                    cache: "no-store",
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to load course");
                }

                setCourse((data.courses || [])[0] || null);
            } catch (err) {
                setError(err.message || "Failed to load course");
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [department, standard]);

    const subjects = course?.subjects || [];
    const practicalCount = useMemo(
        () => subjects.filter((subject) => subject.type.includes("Practical")).length,
        [subjects]
    );
    const theoryCount = useMemo(
        () => subjects.filter((subject) => subject.type === "Theory").length,
        [subjects]
    );

    return (
        <div className={`min-h-screen bg-linear-to-br ${meta.surface} py-12 px-4 sm:px-6 lg:px-8`}>
            <div className="max-w-7xl mx-auto">
                <div className={`bg-linear-to-r ${meta.gradient} rounded-2xl shadow-2xl p-8 md:p-12 mb-12 text-white`}>
                    <div className="flex items-center mb-4">
                        <span className="text-6xl mr-6">{meta.icon}</span>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-2">
                                {course?.title || fallbackTitle}
                            </h1>
                            <p className="text-red-100 text-lg">
                                {course?.subtitle || fallbackSubtitle}
                            </p>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="bg-white rounded-2xl shadow-lg p-10 text-center text-gray-500">
                        Loading academic details...
                    </div>
                )}

                {error && (
                    <div className="bg-white rounded-2xl shadow-lg p-10 text-center text-rose-600">
                        {error}
                    </div>
                )}

                {!loading && !error && !course && (
                    <div className="bg-white rounded-2xl shadow-lg p-10 text-center text-gray-500">
                        No academic course found for this page yet.
                    </div>
                )}

                {!loading && !error && course && (
                    <>
                        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 mb-10">
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Course Overview</h2>
                                    <p className="text-gray-700 text-justify text-lg leading-relaxed mb-4">
                                        {course.overviewPrimary}
                                    </p>
                                    <p className="text-gray-700 text-lg leading-relaxed">
                                        {course.overviewSecondary}
                                    </p>
                                </div>

                                {course.syllabusUrl && (
                                    <a
                                        href={course.syllabusUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="shrink-0 inline-flex items-center rounded-2xl bg-[#7a1c1c] px-5 py-3 text-sm font-semibold text-white hover:bg-[#9f2a2a] transition"
                                    >
                                        View Syllabus
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className={`px-8 py-6 bg-linear-to-r ${meta.gradient}`}>
                                <h2 className="text-2xl font-bold text-white">Subject Details</h2>
                            </div>

                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b-2 border-gray-200">
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 uppercase tracking-wider">
                                                Subject Name
                                            </th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-6 py-4 text-justify text-sm font-semibold text-gray-900 uppercase tracking-wider">
                                                Description
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {subjects.map((subject) => (
                                            <tr key={subject.name} className="hover:bg-red-50 transition-colors duration-200">
                                                <td className="px-6 py-5">
                                                    <div className="text-base text-center font-semibold text-gray-900">{subject.name}</div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`inline-flex text-center px-3 py-1 rounded-full text-sm font-medium ${subject.type.includes("Practical")
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-blue-100 text-blue-800"
                                                        }`}>
                                                        {subject.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-gray-700 text-sm leading-relaxed">
                                                    {subject.description}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="md:hidden divide-y divide-gray-200">
                                {subjects.map((subject) => (
                                    <div key={subject.name} className="p-6 hover:bg-red-50 transition-colors duration-200">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{subject.name}</h3>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-3 ${subject.type.includes("Practical")
                                            ? "bg-green-100 text-green-800"
                                            : "bg-blue-100 text-blue-800"
                                            }`}>
                                            {subject.type}
                                        </span>
                                        <p className="text-gray-700 text-sm leading-relaxed mt-2">{subject.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                            <StatCard label="Total Subjects" value={subjects.length} accent="border-[#7a1c1c] text-[#7a1c1c]" />
                            <StatCard label="Practical Subjects" value={practicalCount} accent="border-green-500 text-green-600" />
                            <StatCard label="Theory Subjects" value={theoryCount} accent="border-[#7a1c1c] text-[#7a1c1c]" />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function StatCard({ label, value, accent }) {
    return (
        <div className={`bg-white rounded-xl shadow-md p-6 border-t-4 ${accent}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{label}</h3>
            <p className="text-3xl font-bold">{value}</p>
        </div>
    );
}
