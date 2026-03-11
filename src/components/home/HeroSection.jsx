"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HeroSection() {

    const slides = [
        {
            src: "/college/college.jpg",
            title: "Shri Nanasaheb Kulkarni",
            subtitle: "Kanishta Mahavidyalay",
            location: "Borli Panchatan",
            description:
                "Empowering students through academic excellence, disciplined learning, and future-ready opportunities in Arts, Commerce, and Science.",
        },
        {
            src: "/college/college.jpg",
            title: "Inspiring Young Minds",
            subtitle: "A Culture Of Values",
            location: "Excellence In Every Classroom",
            description:
                "From strong fundamentals to modern teaching practices, our campus supports growth, confidence, and meaningful student achievement.",
        },
        {
            src: "/college/college.jpg",
            title: "Admissions Open",
            subtitle: "Build Your Next Chapter",
            location: "Join A Trusted Institution",
            description:
                "Explore merit-focused admissions, dedicated faculty mentorship, and a supportive college environment that helps students thrive.",
        },
    ];

    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % slides.length);
        }, 2000);

        return () => clearInterval(interval);
    }, [slides.length]);

    return (
        <section className="relative isolate min-h-[78vh] md:min-h-[84vh] overflow-hidden">
            <div className="absolute inset-0 -z-20">
                {slides.map((slide, i) => (
                    <div
                        key={slide.title}
                        className={`absolute inset-0 transition-opacity duration-1000 ${i === index ? "opacity-100" : "opacity-0"
                            }`}
                    >
                        <Image
                            src={slide.src}
                            alt={slide.title}
                            fill
                            priority={i === 0}
                            sizes="100vw"
                            className="object-cover"
                        />
                    </div>
                ))}
            </div>

            <div className="absolute inset-0 -z-10 bg-linear-to-r from-black/70 via-black/50 to-black/30" />

            <div className="mx-auto flex min-h-[78vh] md:min-h-[84vh] max-w-7xl items-center px-4 py-14 sm:px-6 lg:px-8">
                <div
                    key={index}
                    className="w-full max-w-3xl rounded-2xl border border-white/20 bg-white/10 p-6 text-white shadow-2xl backdrop-blur-sm sm:p-8 md:p-10"
                >
                    <p className="slide-in-up text-xs font-semibold uppercase tracking-[0.35em] text-white/80 sm:text-sm">
                        Welcome To Our College
                    </p>

                    <h1 className="slide-in-up mt-3 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
                        {slides[index].title}
                        <span className="mt-1 block text-[#ffcf9f]">{slides[index].subtitle}</span>
                        <span className="mt-1 block text-2xl font-semibold text-white sm:text-3xl">
                            {slides[index].location}
                        </span>
                    </h1>

                    <p className="slide-in-up mt-5 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base md:text-lg">
                        {slides[index].description}
                    </p>

                    <div className="slide-in-up mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
                        <Link
                            href="/admissions"
                            className="group rounded-lg bg-[#7a1c1c] px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-[#9f2a2a] hover:shadow-xl sm:px-6 sm:text-base"
                        >
                            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                                Apply Admission
                            </span>
                        </Link>

                        <Link
                            href="/about"
                            className="rounded-lg border border-white/60 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-white/20 sm:px-6 sm:text-base"
                        >
                            Learn More
                        </Link>
                    </div>

                    <div className="mt-8 flex items-center gap-2 sm:gap-3">
                        {slides.map((slide, dotIndex) => (
                            <button
                                key={`dot-${slide.title}`}
                                type="button"
                                aria-label={`Go to slide ${dotIndex + 1}`}
                                onClick={() => setIndex(dotIndex)}
                                className={`h-2.5 rounded-full transition-all duration-300 sm:h-3 ${dotIndex === index
                                        ? "w-7 bg-white sm:w-9"
                                        : "w-2.5 bg-white/50 hover:bg-white/80 sm:w-3"
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .slide-in-up {
                    animation: slideInUp 0.7s ease both;
                }

                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(24px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </section>
    );
}