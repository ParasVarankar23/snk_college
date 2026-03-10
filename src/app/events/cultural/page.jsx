"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function CulturalPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/events?category=cultural")
            .then((r) => r.json())
            .then((d) => setEvents(d.events || []))
            .catch(() => setEvents([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="bg-gray-50 py-10">
            <div className="max-w-7xl mx-auto px-6">

                {/* PAGE TITLE */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800">Cultural Programs</h1>
                    <p className="text-gray-600 mt-4">
                        Our college encourages students to showcase their talents through
                        various cultural activities and performances.
                    </p>
                </div>

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
        <div className="space-y-16">
            {events.map((ev) => (
                <div key={ev.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
                    {ev.imageUrl && (
                        <div className="relative w-full h-72 md:h-96">
                            <Image src={ev.imageUrl} alt={ev.title} fill className="object-cover" />
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
                </div>
            ))}
        </div>
    );
}
