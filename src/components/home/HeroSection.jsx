"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {

    const images = [
        "/college/college.jpg",
        "/college/college2.jpg",
        "/college/college3.jpg",
    ];

    const [index, setIndex] = useState(0);

    /* AUTO CHANGE IMAGE EVERY 3 SECONDS */
    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="bg-gray-100 relative overflow-hidden">

            {/* ================= THOUGHT MARQUEE ================= */}
            <div className="bg-[#7a1c1c] text-white py-2 text-sm font-medium">
                <marquee scrollamount="6">
                    📚 Knowledge is the Path to Success • 🎓 Excellence in Education •
                    🌟 Building Bright Futures • Shri Nanasaheb Kulkarni Kanishta
                    Mahavidyalay Borli Panchatan Shrivardhan Raigad 402403
                </marquee>
            </div>

            {/* ================= HERO ================= */}
            <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">

                {/* LEFT SIDE TEXT */}
                <div>

                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
                        Shri Nanasaheb Kulkarni
                        <span className="text-[#7a1c1c] block">
                            Kanishta Mahavidyalay
                        </span>
                        Borli Panchatan
                    </h1>

                    <p className="mt-6 text-gray-600 text-lg">
                        Providing quality education and shaping the future of students
                        through knowledge, discipline, and innovation.
                    </p>

                    <div className="mt-8 flex gap-4">

                        <Link
                            href="/admission"
                            className="px-6 py-3 bg-[#7a1c1c] text-white rounded-lg
              shadow-md transition-all duration-300
              hover:bg-[#9f2a2a] hover:scale-105"
                        >
                            Apply Admission
                        </Link>

                        <Link
                            href="/about"
                            className="px-6 py-3 border border-gray-400 rounded-lg
              hover:bg-gray-200 transition"
                        >
                            Learn More
                        </Link>

                    </div>

                </div>

                {/* RIGHT SIDE IMAGE SLIDER */}
                <div className="relative w-full h-[350px]">

                    <Image
                        src={images[index]}
                        alt="SNK College"
                        fill
                        className="object-cover rounded-xl shadow-lg transition-opacity duration-700"
                    />

                </div>

            </div>

        </section>
    );
}