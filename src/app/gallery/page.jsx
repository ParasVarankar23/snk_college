"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const gallerySkeletonKeys = [
    "gallery-skeleton-1",
    "gallery-skeleton-2",
    "gallery-skeleton-3",
    "gallery-skeleton-4",
    "gallery-skeleton-5",
    "gallery-skeleton-6",
];

function getGalleryGridClass(count) {
    if (count === 1) {
        return "mx-auto grid max-w-md gap-6";
    }

    if (count === 2) {
        return "mx-auto grid max-w-4xl gap-6 md:grid-cols-2";
    }

    return "grid gap-6 sm:grid-cols-2 xl:grid-cols-3";
}

export default function GalleryPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch("/api/gallery", { cache: "no-store" });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to fetch gallery items");
                }

                setItems(data.items || []);
            } catch (fetchError) {
                setError(fetchError.message || "Unable to load gallery right now");
            } finally {
                setLoading(false);
            }
        };

        fetchGallery();
    }, []);

    return (
        <main className="min-h-screen bg-stone-100">
            <section className="relative mx-auto max-w-7xl overflow-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
                <div className="pointer-events-none absolute -left-20 top-8 h-56 w-56 rounded-full bg-[#7a1c1c]/10 blur-3xl" />
                <div className="pointer-events-none absolute right-0 top-1/3 h-64 w-64 rounded-full bg-amber-200/35 blur-3xl" />

                <motion.div
                    className="relative mb-10 text-center"
                    initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <span className="inline-flex rounded-full border border-[#7a1c1c]/15 bg-[#7a1c1c]/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#7a1c1c]">
                        Gallery
                    </span>
                    <h1 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl">Campus Moments</h1>
                    <p className="mx-auto mt-3 max-w-2xl text-slate-600">
                        Explore student life, celebrations, and memorable events from SNK Junior College.
                    </p>
                </motion.div>

                {loading && (
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {gallerySkeletonKeys.map((key) => (
                            <div key={key} className="h-90 animate-pulse rounded-[30px] bg-white/70 shadow-[0_16px_40px_rgba(15,23,42,0.08)]" />
                        ))}
                    </div>
                )}

                {!loading && error && (
                    <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-8 text-center text-rose-700 shadow-sm">
                        {error}
                    </div>
                )}

                {!loading && !error && items.length === 0 && (
                    <div className="rounded-[28px] border border-stone-200 bg-white/90 px-6 py-10 text-center text-slate-500 shadow-sm">
                        No gallery images have been uploaded yet.
                    </div>
                )}

                {!loading && !error && items.length > 0 && (
                    <div className={getGalleryGridClass(items.length)}>
                        {items.map((item, index) => (
                            <motion.article
                                key={item.id}
                                className="group relative overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-[0_22px_55px_rgba(15,23,42,0.12)] transition duration-500 hover:-translate-y-2 hover:shadow-[0_30px_80px_rgba(122,28,28,0.18)]"
                                initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
                                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                viewport={{ once: true, amount: 0.15 }}
                                transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
                            >
                                <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/70 opacity-80 transition duration-500 group-hover:opacity-100" />
                                <div className="overflow-hidden">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.description || "Gallery image"}
                                        className="h-90 w-full object-cover transition duration-700 group-hover:scale-110"
                                    />
                                </div>

                                <div className="absolute inset-0 z-10 flex items-center justify-center p-6 text-center">
                                    <div className="transition duration-500 group-hover:scale-[1.02]">
                                        <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/85 backdrop-blur">
                                            Gallery
                                        </span>
                                        <p className="mt-4 text-base leading-7 text-white/95 md:text-lg">{item.description}</p>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}