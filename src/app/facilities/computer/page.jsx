"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const infoItems = [
    { label: "Head of Department", value: "Patange Madam" },
    { label: "Total Computers", value: "20 Systems" },
];

const paragraphs = [
    "The Computer Laboratory at Shri Nanasaheb Kulkarni Junior College provides students with modern computing facilities to enhance their digital knowledge and technical skills.",
    "The lab is equipped with 20 computers that help students learn computer fundamentals, internet usage, and basic software applications essential for modern education.",
    "The department is guided by Patange Madam, who serves as the Head of the Computer Section and ensures that students receive proper guidance in computer education.",
];

export default function ComputerSection() {
    return (
        <section className="relative overflow-hidden bg-gray-50 py-5 md:py-5">
            <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 md:grid-cols-2 lg:px-8">

                {/* IMAGE — slides in from left */}
                <motion.div
                    initial={{ opacity: 0, x: -60 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.75, ease: "easeOut" }}
                    viewport={{ once: true }}
                >
                    <Image
                        src="/college/computer-lab.jpg"
                        alt="Computer Lab"
                        width={600}
                        height={400}
                        className="rounded-2xl shadow-xl"
                    />
                </motion.div>

                {/* TEXT — slides in from right */}
                <motion.div
                    initial={{ opacity: 0, x: 60 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.75, ease: "easeOut", delay: 0.12 }}
                    viewport={{ once: true }}
                    className="px-2 md:px-4"
                >

                    <h2 className="mt-4 mb-5 text-3xl font-bold text-gray-800 md:text-4xl">
                        Computer Laboratory
                    </h2>

                    {paragraphs.map((text, i) => (
                        <motion.p
                            key={text.slice(0, 24)}
                            className="mb-4 text-justify leading-relaxed text-gray-600"
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.28 + i * 0.13 }}
                            viewport={{ once: true }}
                        >
                            {text}
                        </motion.p>
                    ))}

                    <motion.div
                        className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md divide-y divide-gray-100"
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.58 }}
                        viewport={{ once: true }}
                    >
                        {infoItems.map((item) => (
                            <div key={item.label} className="flex items-center justify-between px-6 py-4">
                                <span className="text-sm font-semibold text-[#7a1c1c]">{item.label}</span>
                                <span className="text-sm font-medium text-gray-700">{item.value}</span>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

            </div>
        </section>
    );
}