"use client";

import { useEffect, useState } from "react";

const gallerySkeletonKeys = [
    "gallery-skeleton-1",
    "gallery-skeleton-2",
    "gallery-skeleton-3",
    "gallery-skeleton-4",
    "gallery-skeleton-5",
    "gallery-skeleton-6",
];

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
        <main className="min-h-screen bg-white">
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
               
                {loading && (
                    <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {gallerySkeletonKeys.map((key) => (
                            <div key={key} className="h-90 animate-pulse rounded-[30px] bg-white/70 shadow-[0_16px_40px_rgba(15,23,42,0.08)]" />
                        ))}
                    </div>
                )}

                {!loading && error && (
                    <div className="mt-14 rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-8 text-center text-rose-700 shadow-sm">
                        {error}
                    </div>
                )}

                {!loading && !error && items.length === 0 && (
                    <div className="mt-14 rounded-[28px] border border-stone-200 bg-white/90 px-6 py-10 text-center text-slate-500 shadow-sm">
                        No gallery images have been uploaded yet.
                    </div>
                )}

                {!loading && !error && items.length > 0 && (
                    <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {items.map((item, index) => (
                            <article
                                key={item.id}
                                className="group relative overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-[0_22px_55px_rgba(15,23,42,0.12)] transition duration-500 hover:-translate-y-2 hover:shadow-[0_30px_80px_rgba(122,28,28,0.18)]"
                                style={{ animationDelay: `${index * 90}ms` }}
                            >
                                <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/70 opacity-80 transition duration-500 group-hover:opacity-100" />
                                <div className="overflow-hidden">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.description || "Gallery image"}
                                        className="h-90 w-full object-cover transition duration-700 group-hover:scale-110"
                                    />
                                </div>

                                <div className="absolute inset-x-0 bottom-0 z-10 p-6">
                                    <div className="translate-y-10 transition duration-500 group-hover:translate-y-0">
                                        <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/85 backdrop-blur">
                                            Gallery
                                        </span>
                                        <p className="mt-4 text-base leading-7 text-white/95 md:text-lg">{item.description}</p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}