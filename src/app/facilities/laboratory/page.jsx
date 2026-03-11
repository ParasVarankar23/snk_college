"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const labs = [
    {
        id: "physics",
        src: "/college/physics-lab.jpg",
        alt: "Physics Laboratory",
        title: "Physics Laboratory",
        desc: "The Physics Laboratory helps students understand fundamental concepts of physics through practical experiments related to mechanics, electricity, magnetism, and optics.",
    },
    {
        id: "chemistry",
        src: "/college/chemistry-lab.jpg",
        alt: "Chemistry Laboratory",
        title: "Chemistry Laboratory",
        desc: "The Chemistry Laboratory is equipped for various experiments in organic, inorganic, and physical chemistry, helping students develop practical skills and scientific understanding.",
    },
    {
        id: "biology",
        src: "/college/biology-lab.jpg",
        alt: "Biology Laboratory",
        title: "Biology Laboratory",
        desc: "The Biology Laboratory provides facilities for studying plant and animal biology, microscopic observations, and practical experiments that enhance students' understanding of life sciences.",
    },
];

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.18 } },
};

const flipCardVariant = {
    hidden: { opacity: 0, rotateX: -80, y: 40 },
    visible: {
        opacity: 1,
        rotateX: 0,
        y: 0,
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
};

export default function LaboratoryPage() {
    return (
        <section className="relative overflow-hidden bg-gray-50 py-1 md:py-2" style={{ perspective: "1200px" }}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* TITLE */}
                <motion.div
                    className="mb-14 text-center"
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65 }}
                    viewport={{ once: true }}
                >
                    <h1 className="mt-4 text-4xl font-bold text-gray-800">
                        Science Laboratories
                    </h1>
                    <p className="mx-auto mt-3 max-w-xl text-gray-500">
                        Well-equipped laboratories for Science students to perform experiments and gain practical knowledge.
                    </p>
                </motion.div>

                {/* LAB CARDS — flip-in from bottom */}
                <motion.div
                    className="grid gap-10 md:grid-cols-3"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                    style={{ transformStyle: "preserve-3d" }}
                >
                    {labs.map((lab) => (
                        <motion.div
                            key={lab.id}
                            variants={flipCardVariant}
                            whileHover={{ y: -8, scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.08)] hover:shadow-[0_20px_50px_rgba(122,28,28,0.13)] transition-shadow duration-300"
                        >
                            <div className="relative h-56 w-full overflow-hidden">
                                <motion.div
                                    whileHover={{ scale: 1.07 }}
                                    transition={{ duration: 0.45 }}
                                    className="h-full w-full"
                                >
                                    <Image
                                        src={lab.src}
                                        alt={lab.alt}
                                        fill
                                        className="object-cover"
                                    />
                                </motion.div>
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-[#7a1c1c] to-[#b84040] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            </div>
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-[#7a1c1c]">{lab.title}</h2>
                                <p className="mt-3 text-sm leading-relaxed text-gray-600">{lab.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

            </div>
        </section>
    );
}