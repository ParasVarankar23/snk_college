"use client";

import Image from "next/image";
import Link from "next/link";

export default function AboutSection() {
    return (
        <section className="relative isolate overflow-hidden py-14 md:py-20">

            <div className="absolute inset-0 -z-20">
                <Image
                    src="/college/college.jpg"
                    alt="SNK College Campus"
                    fill
                    sizes="100vw"
                    className="object-cover"
                />
            </div>

            <div className="absolute inset-0 -z-10 bg-linear-to-r from-black/75 via-black/60 to-black/40" />
            <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/70 via-transparent to-transparent" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="slide-in-up w-full max-w-4xl rounded-2xl border border-white/20 bg-black/25 p-6 text-white shadow-2xl backdrop-blur-sm sm:p-8 md:p-10">
                    <h2 className="mt-4 mb-5 text-3xl font-bold text-white md:text-4xl">
                        About SNK Mahavidyalay
                    </h2>

                    <p className="fade-item mb-5 leading-relaxed text-white/90">
                        Shri Nanasaheb Kulkarni Kanishta Mahavidyalay Borli Panchatan is
                        dedicated to providing quality education and fostering academic
                        excellence among students. The college focuses on holistic
                        development through modern education, cultural activities, and
                        discipline.
                    </p>

                    <p className="fade-item mb-7 leading-relaxed text-white/90">
                        Our institution provides education in Science, Commerce, and Arts
                        streams for 11th and 12th standards while encouraging innovation,
                        leadership, and social responsibility among students.
                    </p>

                    <Link
                        href="/about"
                        className="fade-item inline-block rounded-lg bg-[#7a1c1c] px-6 py-3 text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-[#952929] hover:shadow-xl"
                    >
                        Read More
                    </Link>

                </div>

            </div>

            <style jsx>{`
                .slide-in-up {
                    animation: slideInUp 0.8s ease both;
                }

                .fade-item {
                    opacity: 0;
                    animation: fadeLift 0.7s ease forwards;
                }

                .fade-item:nth-of-type(1) {
                    animation-delay: 0.15s;
                }

                .fade-item:nth-of-type(2) {
                    animation-delay: 0.28s;
                }

                .fade-item:nth-of-type(3) {
                    animation-delay: 0.4s;
                }

                .fade-item:nth-of-type(4) {
                    animation-delay: 0.52s;
                }

                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(26px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeLift {
                    from {
                        opacity: 0;
                        transform: translateY(16px);
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