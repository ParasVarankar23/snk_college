"use client";

import Image from "next/image";
import Link from "next/link";
import {
    FaArrowRight,
    FaEnvelope,
    FaFacebook,
    FaInstagram,
    FaLinkedin,
    FaMapMarkerAlt,
    FaPhone,
    FaWhatsapp,
    FaYoutube,
} from "react-icons/fa";

const quickLinks = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Admissions", href: "/admissions" },
    { label: "Gallery", href: "/gallery" },
    { label: "Events", href: "/events" },
    { label: "Contact", href: "/contact" },
    { label: "Feedback", href: "/feedback" },
];

const academicLinks = [
    { label: "11th Science", href: "/academics/11th-science" },
    { label: "11th Commerce", href: "/academics/11th-commerce" },
    { label: "11th Arts", href: "/academics/11th-arts" },
    { label: "12th Science", href: "/academics/12th-science" },
    { label: "12th Commerce", href: "/academics/12th-commerce" },
    { label: "12th Arts", href: "/academics/12th-arts" },
];

const socialLinks = [
    { icon: <FaFacebook />, href: "#", label: "Facebook", color: "hover:bg-blue-600" },
    { icon: <FaInstagram />, href: "#", label: "Instagram", color: "hover:bg-pink-600" },
    { icon: <FaYoutube />, href: "#", label: "YouTube", color: "hover:bg-red-600" },
    { icon: <FaWhatsapp />, href: "#", label: "WhatsApp", color: "hover:bg-green-600" },
    { icon: <FaLinkedin />, href: "#", label: "LinkedIn", color: "hover:bg-blue-700" },
];

export default function Footer() {
    return (
        <footer className="bg-gradient-to-b from-[#6b1a1a] to-[#4a1010] text-white">

            {/* TOP ACCENT BAR */}
            <div className="h-1 bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-50" />

            <div className="max-w-7xl mx-auto px-6 pt-14 pb-10">
                <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-10">

                    {/* COLLEGE INFO */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="bg-white/10 p-2 rounded-xl ring-1 ring-white/20 backdrop-blur-sm">
                                <Image
                                    src="/college/snk.png"
                                    alt="College Logo"
                                    width={44}
                                    height={44}
                                    className="rounded-lg"
                                />
                            </div>
                            <div>
                                <h2 className="font-bold text-base leading-tight">SNK Mahavidyalay</h2>
                                <p className="text-xs text-red-300 font-medium tracking-wide">Est. Borli Panchatan</p>
                            </div>
                        </div>

                        <p className="text-sm text-red-100/80 leading-relaxed mb-6">
                            Shri Nanasaheb Kulkarni Kanishta Mahavidyalay, Borli Panchatan,
                            Shrivardhan, Raigad. Committed to quality education and nurturing
                            students toward academic excellence.
                        </p>

                        {/* SOCIAL MEDIA */}
                        <div className="flex gap-2 flex-wrap">
                            {socialLinks.map(({ icon, href, label, color }) => (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    className={`w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm transition-all duration-300 ${color} hover:scale-110 hover:shadow-lg ring-1 ring-white/10`}
                                >
                                    {icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* QUICK LINKS */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-red-300 mb-5 flex items-center gap-2">
                            <span className="w-5 h-0.5 bg-red-400 rounded-full inline-block" />
                            Quick Links
                        </h3>
                        <ul className="space-y-2.5">
                            {quickLinks.map(({ label, href }) => (
                                <li key={href}>
                                    <Link
                                        href={href}
                                        className="group flex items-center gap-2 text-sm text-red-100/80 hover:text-white transition-all duration-200"
                                    >
                                        <FaArrowRight className="text-xs text-red-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                                        <span className="group-hover:translate-x-1 transition-transform duration-200">{label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ACADEMICS */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-red-300 mb-5 flex items-center gap-2">
                            <span className="w-5 h-0.5 bg-red-400 rounded-full inline-block" />
                            Academics
                        </h3>
                        <ul className="space-y-2.5">
                            {academicLinks.map(({ label, href }) => (
                                <li key={href}>
                                    <Link
                                        href={href}
                                        className="group flex items-center gap-2 text-sm text-red-100/80 hover:text-white transition-all duration-200"
                                    >
                                        <FaArrowRight className="text-xs text-red-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                                        <span className="group-hover:translate-x-1 transition-transform duration-200">{label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* CONTACT */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-red-300 mb-5 flex items-center gap-2">
                            <span className="w-5 h-0.5 bg-red-400 rounded-full inline-block" />
                            Contact Us
                        </h3>

                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 group">
                                <span className="mt-0.5 w-8 h-8 min-w-[2rem] rounded-lg bg-white/10 flex items-center justify-center text-red-300 group-hover:bg-red-700/50 transition-colors duration-200">
                                    <FaMapMarkerAlt className="text-xs" />
                                </span>
                                <span className="text-sm text-red-100/80 leading-snug">
                                    Borli Panchatan, Shrivardhan,<br />Raigad, Maharashtra
                                </span>
                            </li>

                            <li className="flex items-center gap-3 group">
                                <span className="w-8 h-8 min-w-[2rem] rounded-lg bg-white/10 flex items-center justify-center text-red-300 group-hover:bg-red-700/50 transition-colors duration-200">
                                    <FaPhone className="text-xs" />
                                </span>
                                <a href="tel:+919421160366" className="text-sm text-red-100/80 hover:text-white transition-colors duration-200">
                                    +91 94211 60366
                                </a>
                            </li>

                            <li className="flex items-center gap-3 group">
                                <span className="w-8 h-8 min-w-[2rem] rounded-lg bg-white/10 flex items-center justify-center text-red-300 group-hover:bg-red-700/50 transition-colors duration-200">
                                    <FaEnvelope className="text-xs" />
                                </span>
                                <a href="mailto:snkcollege@gmail.com" className="text-sm text-red-100/80 hover:text-white transition-colors duration-200 break-all">
                                    snkcollege@gmail.com
                                </a>
                            </li>
                        </ul>

                        {/* MAP BADGE */}
                        <a
                            href="https://maps.app.goo.gl/j7QZPn6Su4oxTJkh6"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-5 inline-flex items-center gap-2 text-xs bg-white/10 hover:bg-white/20 border border-white/10 text-red-200 px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
                        >
                            <FaMapMarkerAlt className="text-red-400" />
                            View on Google Maps
                        </a>
                    </div>

                </div>

                {/* DIVIDER */}
                <div className="mt-12 mb-6 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                {/* COPYRIGHT */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-red-200/60">
                    <p>
                        © {new Date().getFullYear()} Shri Nanasaheb Kulkarni Kanishta Mahavidyalay, Borli Panchatan. All Rights Reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <Link href="/privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</Link>
                        <span className="w-1 h-1 bg-red-400/40 rounded-full" />
                        <Link href="/terms" className="hover:text-white transition-colors duration-200">Terms of Use</Link>
                    </div>
                </div>
            </div>

        </footer>
    );
}