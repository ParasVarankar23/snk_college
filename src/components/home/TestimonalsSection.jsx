"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function TestimonialsSection() {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/feedback")
            .then((res) => res.json())
            .then((data) => {
                const top = (data.feedbacks || []).slice(0, 3);
                setTestimonials(top);
            })
            .catch(() => setTestimonials([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="bg-gray-50 py-10">

            <div className="max-w-7xl mx-auto px-6">

                {/* SECTION TITLE */}
                <div className="text-center mb-14">

                    <h2 className="text-3xl font-bold text-gray-800">
                        Student Testimonials
                    </h2>

                    <p className="text-gray-600 mt-3">
                        Hear what our students say about their experience at SNK Mahavidyalay.
                    </p>

                </div>

                {/* LOADING */}
                {loading && (
                    <div className="flex justify-center py-10">
                        <div className="w-8 h-8 border-4 border-[#7a1c1c]/30 border-t-[#7a1c1c] rounded-full animate-spin" />
                    </div>
                )}

                {/* EMPTY STATE */}
                {!loading && testimonials.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        No testimonials yet. Be the first to{" "}
                        <Link href="/feedback" className="text-[#7a1c1c] font-semibold hover:underline">
                            share your feedback
                        </Link>
                        .
                    </div>
                )}

                {/* TESTIMONIAL GRID */}
                {!loading && testimonials.length > 0 && (
                    <div className="grid md:grid-cols-3 gap-8">

                        {testimonials.map((item, index) => (

                            <div
                                key={item.id || index}
                                className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition"
                            >

                                {/* IMAGE / AVATAR */}
                                <div className="flex justify-center mb-4">
                                    {item.imageUrl ? (
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.name}
                                            width={80}
                                            height={80}
                                            style={{ width: "80px", height: "80px" }}
                                            className="object-cover rounded-full border-2 border-[#7a1c1c]/20"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-full bg-[#7a1c1c]/10 flex items-center justify-center text-[#7a1c1c] font-bold text-2xl">
                                            {item.name?.charAt(0)?.toUpperCase() || "?"}
                                        </div>
                                    )}
                                </div>

                                {/* NAME */}
                                <h3 className="text-center font-semibold text-[#7a1c1c]">
                                    {item.name}
                                </h3>

                                {/* STAR RATING */}
                                <div className="flex justify-center mt-2 mb-4">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <span key={s} className={s <= item.rating ? "text-yellow-500 text-lg" : "text-gray-200 text-lg"}>
                                            ★
                                        </span>
                                    ))}
                                </div>

                                {/* COMMENT */}
                                <p className="text-gray-600 text-sm text-center leading-relaxed">
                                    &ldquo;{item.description}&rdquo;
                                </p>

                            </div>

                        ))}

                    </div>
                )}

                {/* CTA */}
                <div className="text-center mt-10">
                    <Link
                        href="/feedback"
                        className="inline-block px-6 py-3 rounded-lg bg-[#7a1c1c] text-white font-semibold hover:bg-[#9f2a2a] transition"
                    >
                        Share Your Feedback
                    </Link>
                </div>

            </div>

        </section>
    );
}