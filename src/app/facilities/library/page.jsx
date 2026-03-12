/* eslint-disable react/prop-types */
"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

function CountUp({ to, suffix = "" }) {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (v) => Math.round(v) + suffix);
    const started = useRef(false);

    return (
        <motion.span
            ref={(el) => {
                if (!el || started.current) return;
                const observer = new IntersectionObserver(
                    ([entry]) => {
                        if (entry.isIntersecting) {
                            started.current = true;
                            animate(count, to, { duration: 1.8, ease: "easeOut" });
                            observer.disconnect();
                        }
                    },
                    { threshold: 0.5 }
                );
                observer.observe(el);
            }}
        >
            {rounded}
        </motion.span>
    );
}

const paragraphs = [
    "The library at Shri Nanasaheb Kulkarni Junior College is an important center of learning that supports students and teachers in their academic activities.",
    "The library provides a collection of textbooks, reference books, journals, and other educational resources that help students gain deeper knowledge in their respective subjects.",
    "A quiet and comfortable reading environment encourages students to develop reading habits and improve their academic performance. A quiet and comfortable reading environment encourages students to develop reading habits and improve their academic performance.",
];

export default function LibrarySection() {
    return (
        <section className="relative overflow-hidden bg-white py-5 md:py-10">
            <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 md:grid-cols-2 lg:px-8">

                {/* IMAGE — zoom-reveal */}
                <motion.div
                    initial={{ opacity: 0, scale: 1.1 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                    viewport={{ once: true }}
                    className="overflow-hidden rounded-2xl shadow-xl"
                >
                    <Image
                        src="/college/library.jpg"
                        alt="College Library"
                        width={600}
                        height={400}
                        className="h-full w-full object-cover"
                    />
                </motion.div>

                {/* TEXT — staggered fade-up */}
                <div className="px-2 md:px-4">
                    <motion.h2
                        className="mt-4 mb-5 text-3xl font-bold text-gray-800 md:text-4xl"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.1 }}
                        viewport={{ once: true }}
                    >
                        College Library
                    </motion.h2>

                    {paragraphs.map((text, i) => (
                        <motion.p
                            key={text.slice(0, 24)}
                            className="mb-4 text-justify leading-relaxed text-gray-600"
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.18 + i * 0.14 }}
                            viewport={{ once: true }}
                        >
                            {text}
                        </motion.p>
                    ))}

                    {/* STAT CARDS — count-up animation */}
                    <div className="mt-6 grid grid-cols-2 gap-5">
                        <motion.div
                            className="rounded-xl border border-gray-100 bg-gray-50 p-5 shadow-sm"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.55 }}
                            viewport={{ once: true }}
                        >
                            <p className="text-2xl font-bold text-[#7a1c1c]">
                                <CountUp to={1000} suffix="+" />
                            </p>
                            <p className="mt-1 text-sm text-gray-500">Books Available</p>
                        </motion.div>

                        <motion.div
                            className="rounded-xl border border-gray-100 bg-gray-50 p-5 shadow-sm"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.68 }}
                            viewport={{ once: true }}
                        >
                            <p className="text-2xl font-bold text-[#7a1c1c]">Reading</p>
                            <p className="mt-1 text-sm text-gray-500">Quiet Study Space</p>
                        </motion.div>
                    </div>
                </div>

            </div>
        </section>
    );
}