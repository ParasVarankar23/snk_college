"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const sports = [
    { id: "cricket", name: "Cricket", type: "Outdoor Sport", icon: "🏏" },
    { id: "kabaddi", name: "Kabaddi", type: "Traditional Sport", icon: "🤼" },
    { id: "volleyball", name: "Volleyball", type: "Team Sport", icon: "🏐" },
    { id: "athletics", name: "Athletics", type: "Track & Field", icon: "🏃" },
];

const paragraphs = [
    "Shri Nanasaheb Kulkarni Junior College encourages students to participate in sports and physical activities for maintaining health, discipline, and teamwork.",
    "The college organizes various indoor and outdoor sports activities that help students develop physical fitness and competitive spirit.",
    "Students actively participate in sports events, tournaments, and inter-college competitions which promote leadership and teamwork.",
];

export default function SportsSection() {
    return (
        <section className="relative overflow-hidden bg-gray-50 py-5 md:py-5">
            <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 md:grid-cols-2 lg:px-8">

                {/* TEXT — slides in from left */}
                <motion.div
                    initial={{ opacity: 0, x: -60 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.75, ease: "easeOut" }}
                    viewport={{ once: true }}
                >

                    <h2 className="mt-4 mb-5 text-3xl font-bold text-gray-800 md:text-4xl">
                        Sports &amp; Physical Activities
                    </h2>

                    {paragraphs.map((text, i) => (
                        <motion.p
                            key={text.slice(0, 24)}
                            className="mb-4 text-justify leading-relaxed text-gray-600"
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 + i * 0.13 }}
                            viewport={{ once: true }}
                        >
                            {text}
                        </motion.p>
                    ))}

                    {/* SPORT TILES — spring pop-in, staggered */}
                    <div className="mt-6 grid grid-cols-2 gap-4">
                        {sports.map((sport, i) => (
                            <motion.div
                                key={sport.id}
                                initial={{ opacity: 0, scale: 0.6 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.06, y: -4 }}
                                transition={{
                                    delay: 0.45 + i * 0.1,
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 18,
                                }}
                                viewport={{ once: true }}
                                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                            >
                                <span className="text-2xl">{sport.icon}</span>
                                <div>
                                    <p className="font-bold text-[#7a1c1c]">{sport.name}</p>
                                    <p className="text-xs text-gray-500">{sport.type}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* IMAGE — slides in from right */}
                <motion.div
                    initial={{ opacity: 0, x: 60 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.75, ease: "easeOut", delay: 0.12 }}
                    viewport={{ once: true }}
                    className="px-2 md:px-4"
                >
                    <Image
                        src="/college/sports.jpg"
                        alt="College Sports Activities"
                        width={600}
                        height={400}
                        className="rounded-2xl shadow-xl"
                    />
                </motion.div>

            </div>
        </section>
    );
}