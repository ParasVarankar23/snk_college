"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

const historyMilestones = [
    {
        title: "Foundation And Vision",
        text: "SNK Mahavidyalay was founded with a clear mission: provide quality higher-secondary education to rural and semi-urban students and create equal opportunities for academic growth.",
    },
    {
        title: "Growth In Streams",
        text: "Over the years, the institution expanded its academic offerings across Science, Commerce, and Arts for 11th and 12th standards, helping students choose diverse career paths.",
    },
    {
        title: "Student-Centered Culture",
        text: "The college strengthened its focus on discipline, value-based education, mentorship, and practical learning to support confidence, communication, and leadership development.",
    },
    {
        title: "Modern Learning Approach",
        text: "By integrating updated teaching methods, co-curricular activities, and guidance programs, SNK Mahavidyalay continues to prepare students for higher studies and responsible citizenship.",
    },
];

const descriptionLines = [
    "Shri Nanasaheb Kulkarni Kanishta Mahavidyalay, Borli Panchatan, has built a strong academic identity by combining disciplined learning with student-friendly guidance.",
    "The institution emphasizes balanced growth through classroom excellence, cultural participation, and character-building values that shape confident young learners.",
    "With dedicated faculty support and stream-wise focus in Science, Commerce, and Arts, the college creates a dependable pathway for 11th and 12th students to achieve their future goals.",
];

export default function AboutSection() {
    const pathname = usePathname();
    const isAboutPage = pathname === "/about";
    const [expanded, setExpanded] = useState(false);

    const visibleParagraphs = useMemo(() => {
        if (isAboutPage || expanded) return descriptionLines;
        return descriptionLines.slice(0, 1);
    }, [expanded, isAboutPage]);

    return (
        <section className="relative isolate overflow-hidden py-5 md:py-10">

            <div className="absolute inset-0 -z-20">
                <Image
                    src="/college/college.jpg"
                    alt="SNK College Campus"
                    fill
                    sizes="100vw"
                    className="object-cover"
                />
            </div>

            <div className="absolute inset-0 -z-10 bg-linear-to-r from-black/80 via-black/65 to-black/45" />
            <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/70 via-transparent to-transparent" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="slide-in-up w-full rounded-3xl border border-white/20 bg-black/25 p-6 text-white shadow-2xl backdrop-blur-sm sm:p-8 md:p-10 lg:p-12">
                    <div className="mb-4 inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/85">
                        Our Story
                    </div>

                    <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                        About SNK Mahavidyalay
                    </h2>

                    <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-10">
                        <div>
                            {visibleParagraphs.map((line) => (
                                <p
                                    key={line}
                                    className="fade-item mb-4 leading-relaxed text-white/90 md:text-lg"
                                >
                                    {line}
                                </p>
                            ))}

                            <div className="fade-item mt-6 flex flex-wrap items-center gap-3">                                
                                {!isAboutPage && (
                                    <Link
                                        href="/about"
                                        className="inline-block rounded-lg bg-[#7a1c1c] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-[#952929] hover:shadow-xl"
                                    >
                                        Read More
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="fade-item rounded-2xl border border-white/20 bg-white/10 p-5 sm:p-6">
                            <h3 className="text-xl font-bold text-white">Highlights</h3>
                            <ul className="mt-4 space-y-3 text-sm text-white/90 sm:text-base">
                                <li className="rounded-lg border border-white/15 bg-black/15 px-3 py-2">Academic streams in Science, Commerce, and Arts</li>
                                <li className="rounded-lg border border-white/15 bg-black/15 px-3 py-2">Focused preparation for higher studies</li>
                                <li className="rounded-lg border border-white/15 bg-black/15 px-3 py-2">Discipline, values, and leadership development</li>
                                <li className="rounded-lg border border-white/15 bg-black/15 px-3 py-2">Supportive faculty mentorship and guidance</li>
                            </ul>
                        </div>
                    </div>

                    {(isAboutPage || expanded) && (
                        <div className="fade-item mt-10">
                            <h3 className="text-2xl font-bold text-[#ffd6b0] md:text-3xl">Institution History</h3>
                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                {historyMilestones.map((milestone, idx) => (
                                    <article
                                        key={milestone.title}
                                        className="rounded-2xl border border-white/20 bg-white/10 p-5"
                                    >
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                                            Chapter {idx + 1}
                                        </p>
                                        <h4 className="mt-2 text-lg font-bold text-white">{milestone.title}</h4>
                                        <p className="mt-2 text-sm leading-6 text-white/90 md:text-base">
                                            {milestone.text}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

            </div>

            <style jsx>{`
                .slide-in-up {
                    animation: slideInUp 0.8s ease both;
                }

                .fade-item {
                    opacity: 0;
                    animation: fadeLift 0.65s ease forwards;
                    animation-delay: 0.18s;
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