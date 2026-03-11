"use client";
/* eslint-disable react/prop-types */

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function PicnicPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/events?category=picnic")
            .then((r) => r.json())
            .then((d) => setEvents(d.events || []))
            .catch(() => setEvents([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="bg-gray-50 py-10">
            <div className="max-w-7xl mx-auto px-6">

                {/* PAGE TITLE */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    viewport={{ once: true }}
                >
                    <h1 className="text-4xl font-bold text-gray-800">College Picnic</h1>
                    <p className="text-gray-600 mt-4">
                        A memorable and enjoyable outing for students organized by
                        Shri Nanasaheb Kulkarni Kanishta Mahavidyalay, Borli Panchatan.
                    </p>
                </motion.div>

                <EventList events={events} loading={loading} />
            </div>
        </section>
    );
}

function EventList({ events, loading }) {
    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#7a1c1c]/30 border-t-[#7a1c1c] rounded-full animate-spin" />
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="text-center py-20 text-gray-400">
                <p className="text-lg">No events have been added yet.</p>
            </div>
        );
    }

    return (
        <motion.div
            className="grid gap-8 md:grid-cols-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.45 }}
            viewport={{ once: true, amount: 0.1 }}
        >
            {events.map((ev) => (
                <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    viewport={{ once: true, amount: 0.2 }}
                    className="h-full overflow-hidden rounded-2xl bg-white shadow-md"
                >
                    {ev.imageUrl && (
                        <div className="relative aspect-video w-full bg-gray-100">
                            <Image
                                src={ev.imageUrl}
                                alt={ev.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 1200px"
                                quality={95}
                                className="object-cover object-center"
                            />
                        </div>
                    )}
                    <div className="p-8">
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                            <h2 className="text-2xl font-bold text-gray-800">{ev.title}</h2>
                            {ev.date && (
                                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                    {new Date(ev.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                                </span>
                            )}
                        </div>
                        <p className="text-gray-600 leading-relaxed">{ev.description}</p>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
}
