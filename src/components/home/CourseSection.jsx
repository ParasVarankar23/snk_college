"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const courses = [
    {
        id: "science",
        icon: "🔬",
        title: "Science",
        description:
            "Focus on Physics, Chemistry, Biology, and Mathematics with practical laboratory learning.",
        href: "/departments/science",
    },
    {
        id: "commerce",
        icon: "💼",
        title: "Commerce",
        description:
            "Learn accounting, economics, and business studies to build a strong foundation for business careers.",
        href: "/departments/commerce",
    },
    {
        id: "arts",
        icon: "🎨",
        title: "Arts",
        description:
            "Explore humanities and social sciences while developing creativity, communication, and critical thinking.",
        href: "/departments/arts",
    },
];

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.18 },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.96 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.55, ease: "easeOut" },
    },
};

export default function CoursesSection() {
    return (
        <section className="relative overflow-hidden bg-gray-50 py-14 md:py-20">

            {/* Soft decorative blobs */}
            <div className="pointer-events-none absolute -top-10 -left-10 h-64 w-64 rounded-full bg-[#7a1c1c]/6 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-[#7a1c1c]/6 blur-3xl" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* SECTION TITLE */}
                <motion.div
                    className="mb-14 text-center"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65 }}
                    viewport={{ once: true }}
                >
                    <h2 className="mt-4 text-3xl font-bold text-gray-800 md:text-5xl">
                        Courses We <span className="text-[#7a1c1c]">Offer</span>
                    </h2>

                    <p className="mx-auto mt-4 max-w-xl text-base text-gray-500 md:text-lg">
                        Explore the streams available at SNK Mahavidyalay for your academic journey.
                    </p>
                </motion.div>

                {/* COURSES GRID */}
                <motion.div
                    className="grid gap-8 md:grid-cols-3"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    {courses.map((course) => (
                        <motion.div
                            key={course.id}
                            variants={cardVariants}
                            whileHover={{ y: -8, scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            className="group relative rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-[0_8px_30px_rgba(15,23,42,0.07)] transition-shadow duration-300 hover:shadow-[0_20px_50px_rgba(122,28,28,0.13)]"
                        >
                            {/* Top accent bar */}
                            <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-linear-to-r from-[#7a1c1c] to-[#b84040] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                            <motion.div
                                className="mb-5 text-5xl"
                                whileHover={{ scale: 1.18, rotate: 6 }}
                                transition={{ type: "spring", stiffness: 300, damping: 14 }}
                            >
                                {course.icon}
                            </motion.div>

                            <h3 className="text-xl font-bold text-[#7a1c1c]">
                                {course.title}
                            </h3>

                            <div className="mx-auto my-4 h-1 w-12 rounded-full bg-[#7a1c1c]/20 transition-all duration-300 group-hover:w-20 group-hover:bg-[#7a1c1c]" />

                            <p className="text-sm leading-relaxed text-gray-600 md:text-base">
                                {course.description}
                            </p>

                            <Link
                                href={course.href}
                                className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[#7a1c1c] transition-all duration-200 hover:gap-2 hover:underline"
                            >
                                <span>Learn More</span>
                                <span className="transition-transform duration-200 group-hover:translate-x-1">{"→"}</span>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

            </div>
        </section>
    );
}