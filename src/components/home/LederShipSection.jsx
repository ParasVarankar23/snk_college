"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

const leaders = [
    {
        id: "chairman-ravindra-dada-kulkarni",
        name: "Ravindra Dada Kulkarni",
        role: "Chairman",
        image: "/college/supervisor.jpg",
        frontDesc:
            "Leading the institution with dedication and vision to promote quality education for rural students.",
        backDesc:
            "Under his leadership, the institution continues to inspire students through discipline, opportunity, and educational growth.",
    },
    {
        id: "principal-babasaheb-yalmate",
        name: "Babasaheb Yalmate",
        role: "Principal",
        image: "/college/supervisor.jpg",
        frontDesc:
            "M.A., B.Ed. Dedicated to academic excellence and the holistic development of students.",
        backDesc:
            "Focused on building a student-centered environment with strong values, academic discipline, and career guidance.",
    },
    {
        id: "vice-principal",
        name: "Vice Principal Name",
        role: "Vice Principal",
        image: "/college/supervisor.jpg",
        frontDesc:
            "Supporting academic administration and student development activities across departments.",
        backDesc:
            "Plays a vital role in strengthening coordination, discipline, and smooth educational functioning in the college.",
    },
    {
        id: "supervisor",
        name: "Supervisor Name",
        role: "Supervisor",
        image: "/college/supervisor.jpg",
        frontDesc:
            "Ensuring smooth academic operations and maintaining discipline across the college campus.",
        backDesc:
            "Dedicated to creating an organized and positive learning atmosphere for students and staff alike.",
    },
];

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.18,
        },
    },
};

const cardVariants = {
    hidden: {
        opacity: 0,
        y: 50,
        scale: 0.95,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: "easeOut",
        },
    },
};

export default function LeadershipSection() {
    const [flippedCards, setFlippedCards] = useState({});

    const toggleFlip = (cardId) => {
        setFlippedCards((prev) => ({
            ...prev,
            [cardId]: !prev[cardId],
        }));
    };

    return (
        <section className="relative overflow-hidden bg-linear-to-b from-white via-[#fff8f8] to-white py-5 md:py-10">
            {/* Decorative Background */}
            <div className="absolute top-10 left-0 h-40 w-40 rounded-full bg-[#7a1c1c]/10 blur-3xl"></div>
            <div className="absolute bottom-10 right-0 h-52 w-52 rounded-full bg-[#7a1c1c]/10 blur-3xl"></div>

            <div className="mx-auto max-w-7xl px-6">
                {/* TITLE */}
                <motion.div
                    className="mb-12 text-center"
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    viewport={{ once: true }}
                >

                    <h2 className="text-3xl font-bold text-gray-800 md:text-5xl">
                        Our <span className="text-[#7a1c1c]">Leadership</span>
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 md:text-lg">
                        Dedicated leaders guiding SNK Mahavidyalay towards excellence.
                    </p>
                </motion.div>

                {/* GRID */}
                <motion.div
                    className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    {leaders.map((leader) => (
                        <motion.div
                            key={leader.id}
                            variants={cardVariants}
                            className="group perspective-distant"
                        >
                            <motion.div
                                onClick={() => toggleFlip(leader.id)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        toggleFlip(leader.id);
                                    }
                                }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 250, damping: 18 }}
                                className="relative h-96 w-full cursor-pointer rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7a1c1c] focus-visible:ring-offset-2"
                                style={{
                                    transformStyle: "preserve-3d",
                                }}
                                animate={{
                                    rotateY: flippedCards[leader.id] ? 180 : 0,
                                }}
                                role="button"
                                tabIndex={0}
                                aria-label={`Flip card for ${leader.name}`}
                            >
                                {/* FRONT SIDE */}
                                <div
                                    className="absolute inset-0 rounded-3xl border border-[#7a1c1c]/10 bg-white p-5 shadow-[0_15px_50px_rgba(15,23,42,0.08)] transition-all duration-500 group-hover:shadow-[0_20px_60px_rgba(122,28,28,0.15)]"
                                    style={{
                                        backfaceVisibility: "hidden",
                                        WebkitBackfaceVisibility: "hidden",
                                    }}
                                >
                                    {/* Image */}
                                    <div className="relative mx-auto mb-4 h-36 w-36 overflow-hidden rounded-2xl border-4 border-[#7a1c1c]/10 shadow-md">
                                        <motion.div
                                            whileHover={{ scale: 1.08 }}
                                            transition={{ duration: 0.4 }}
                                            className="h-full w-full"
                                        >
                                            <Image
                                                src={leader.image}
                                                alt={leader.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </motion.div>
                                    </div>

                                    {/* Text */}
                                    <div className="text-center">
                                        <h3 className="text-lg font-bold text-[#7a1c1c]">
                                            {leader.name}
                                        </h3>

                                        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                                            {leader.role}
                                        </p>

                                        <div className="mx-auto my-3 h-1 w-12 rounded-full bg-[#7a1c1c]"></div>

                                        <p className="text-sm leading-6 text-gray-600">
                                            {leader.frontDesc}
                                        </p>
                                    </div>
                                </div>

                                {/* BACK SIDE */}
                                <div
                                    className="absolute inset-0 flex flex-col justify-center rounded-3xl border border-[#7a1c1c]/10 bg-linear-to-br from-[#7a1c1c] via-[#8f2525] to-[#5c1212] p-5 text-white shadow-[0_15px_50px_rgba(122,28,28,0.25)]"
                                    style={{
                                        transform: "rotateY(180deg)",
                                        backfaceVisibility: "hidden",
                                        WebkitBackfaceVisibility: "hidden",
                                    }}
                                >
                                    <div className="text-center">
                                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-xl font-bold backdrop-blur-md">
                                            {leader.name.charAt(0)}
                                        </div>

                                        <h3 className="text-xl font-bold">{leader.name}</h3>

                                        <p className="mt-1 text-xs uppercase tracking-[2px] text-white/80">
                                            {leader.role}
                                        </p>

                                        <div className="mx-auto my-4 h-1 w-12 rounded-full bg-white/70"></div>

                                        <p className="text-sm leading-6 text-white/90">
                                            {leader.backDesc}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}