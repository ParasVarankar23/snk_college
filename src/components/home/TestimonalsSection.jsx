"use client";
/* eslint-disable react/prop-types */

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const PAGE_SIZE = 3;

const groupVariants = {
    enter: (dir) => ({
        x: dir > 0 ? "35%" : "-35%",
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
    },
    exit: (dir) => ({
        x: dir > 0 ? "-35%" : "35%",
        opacity: 0,
        transition: { duration: 0.35, ease: [0.55, 0, 1, 0.45] },
    }),
};

const cardVariants = {
    hidden: { opacity: 0, y: 28 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" },
    }),
};

function StarRating({ rating }) {
    return (
        <div className="flex justify-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <span
                    key={s}
                    className={s <= rating ? "text-amber-400 text-lg" : "text-gray-200 text-lg"}
                >
                    ★
                </span>
            ))}
        </div>
    );
}

StarRating.defaultProps = { rating: 0 };

function ArrowButton({ onClick, disabled, direction }) {
    const hoverAnim = disabled ? {} : { scale: 1.1 };
    const tapAnim = disabled ? {} : { scale: 0.95 };
    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            whileHover={hoverAnim}
            whileTap={tapAnim}
            aria-label={direction === "prev" ? "Previous testimonials" : "Next testimonials"}
            className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-200 ${disabled
                ? "cursor-not-allowed border-gray-200 bg-white text-gray-300"
                : "border-[#7a1c1c]/30 bg-white text-[#7a1c1c] shadow-md hover:border-[#7a1c1c] hover:bg-[#7a1c1c] hover:text-white hover:shadow-lg"
                }`}
        >
            {direction === "prev" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                </svg>
            )}
        </motion.button>
    );
}
function getGridClass(count) {
    if (count === 1) return "max-w-lg mx-auto";
    if (count === 2) return "grid md:grid-cols-2 max-w-3xl mx-auto gap-7";
    return "grid md:grid-cols-3 gap-7";
}

export default function TestimonialsSection() {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [direction, setDirection] = useState(1);

    useEffect(() => {
        fetch("/api/feedback")
            .then((res) => res.json())
            .then((data) => setTestimonials(data.feedbacks || []))
            .catch(() => setTestimonials([]))
            .finally(() => setLoading(false));
    }, []);

    const totalPages = Math.ceil(testimonials.length / PAGE_SIZE);
    const currentItems = testimonials.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

    const goNext = () => {
        if (page < totalPages - 1) {
            setDirection(1);
            setPage((p) => p + 1);
        }
    };

    const goPrev = () => {
        if (page > 0) {
            setDirection(-1);
            setPage((p) => p - 1);
        }
    };

    const gridClass = getGridClass(currentItems.length);

    return (
        <section className="relative overflow-hidden bg-gray-50">

            {/* Decorative blobs */}
            <div className="pointer-events-none absolute -top-10 left-1/4 h-64 w-64 rounded-full bg-[#7a1c1c]/6 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 right-1/4 h-64 w-64 rounded-full bg-[#7a1c1c]/6 blur-3xl" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* SECTION TITLE */}
                <motion.div
                    className="mb-12 text-center"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65 }}
                    viewport={{ once: true }}
                >
                    <h2 className="mt-4 text-3xl font-bold text-gray-800 md:text-5xl">
                        Student <span className="text-[#7a1c1c]">Testimonials</span>
                    </h2>

                    <p className="mx-auto mt-4 max-w-xl text-base text-gray-500 md:text-lg">
                        Hear what our students say about their experience at SNK Mahavidyalay.
                    </p>
                </motion.div>

                {/* LOADING */}
                {loading && (
                    <div className="flex justify-center py-14">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7a1c1c]/20 border-t-[#7a1c1c]" />
                    </div>
                )}

                {/* EMPTY STATE */}
                {!loading && testimonials.length === 0 && (
                    <motion.div
                        className="py-14 text-center text-gray-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        No testimonials yet. Be the first to{" "}
                        <Link href="/feedback" className="font-semibold text-[#7a1c1c] hover:underline">
                            share your feedback
                        </Link>
                        .
                    </motion.div>
                )}

                {/* SLIDER */}
                {!loading && testimonials.length > 0 && (
                    <>
                        {/* ANIMATED GRID */}
                        <div className="overflow-hidden">
                            <AnimatePresence mode="wait" custom={direction}>
                                <motion.div
                                    key={page}
                                    custom={direction}
                                    variants={groupVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    className={gridClass}
                                >
                                    {currentItems.map((item, i) => (
                                        <motion.div
                                            key={item.id || i}
                                            custom={i}
                                            variants={cardVariants}
                                            initial="hidden"
                                            animate="visible"
                                            whileHover={{ y: -6, scale: 1.02 }}
                                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                            className="group relative rounded-2xl border border-gray-100 bg-white p-7 shadow-[0_8px_30px_rgba(15,23,42,0.07)] transition-shadow duration-300 hover:shadow-[0_20px_50px_rgba(122,28,28,0.12)]"
                                        >
                                            {/* top accent */}
                                            <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-linear-to-r from-[#7a1c1c] to-[#b84040] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                            {/* COMMENT */}
                                            <p className="mb-5 text-sm leading-relaxed text-gray-600 md:text-base">
                                                &ldquo;{item.description}&rdquo;
                                            </p>

                                            <div className="mx-auto mb-5 h-px w-full bg-gray-100" />

                                            {/* AVATAR + NAME */}
                                            <div className="flex items-center gap-3">
                                                {item.imageUrl ? (
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        width={48}
                                                        height={48}
                                                        className="h-12 w-12 rounded-full object-cover border-2 border-[#7a1c1c]/15"
                                                    />
                                                ) : (
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#7a1c1c]/10 text-[#7a1c1c] text-lg font-bold">
                                                        {item.name?.charAt(0)?.toUpperCase() || "?"}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-gray-800">{item.name}</p>
                                                    <StarRating rating={item.rating} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* ARROW / PAGE CONTROLS */}
                        {totalPages > 1 && (
                            <div className="mt-4 flex flex-col items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <ArrowButton onClick={goPrev} disabled={page === 0} direction="prev" />
                                    <span className="min-w-12 text-center text-sm font-medium text-gray-400">
                                        {page + 1} / {totalPages}
                                    </span>
                                    <ArrowButton onClick={goNext} disabled={page === totalPages - 1} direction="next" />
                                </div>
                                <div className="flex justify-center gap-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                        <button
                                            key={`dot-page-${pageNum}`}
                                            onClick={() => { setDirection(pageNum - 1 > page ? 1 : -1); setPage(pageNum - 1); }}
                                            aria-label={`Go to page ${pageNum}`}
                                            className={`h-2.5 rounded-full transition-all duration-300 ${pageNum - 1 === page ? "w-7 bg-[#7a1c1c]" : "w-2.5 bg-[#7a1c1c]/25 hover:bg-[#7a1c1c]/50"
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* CTA */}
                <motion.div
                    className="py-6 text-center"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    <Link
                        href="/feedback"
                        className="inline-block rounded-lg bg-[#7a1c1c] px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-[#952929] hover:shadow-xl"
                    >
                        Share Your Feedback
                    </Link>
                </motion.div>

            </div>
        </section>
    );
}