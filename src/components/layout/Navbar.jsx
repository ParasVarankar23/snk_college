"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaBars, FaChevronDown, FaTimes } from "react-icons/fa";

export default function Navbar() {

    const [menu, setMenu] = useState(null);
    const [mobileMenu, setMobileMenu] = useState(false);
    const [mobileDropdown, setMobileDropdown] = useState(null);

    const navRef = useRef();
    const closeTimerRef = useRef(null);

    const dropdown = {
        Departments: ["Science", "Commerce", "Arts"],
        Facilities: ["Laboratories", "Library", "Sports", "Computer Lab"],
        Academics: [
            "11th Science",
            "11th Commerce",
            "11th Arts",
            "12th Science",
            "12th Commerce",
            "12th Arts",
        ],
        Events: [
            "Annual Day",
            "Science Exhibition",
            "Picnic",
            "Cultural Programs",
        ],
        Achievements: [
            "Awards",
            "Sports Achievements",
            "Academic Achievements",
        ],
    };

    const dropdownRoutes = {
        Departments: {
            Science: "/departments/science",
            Commerce: "/departments/commerce",
            Arts: "/departments/arts",
        },
        Facilities: {
            Laboratories: "/facilities/laboratory",
            Library: "/facilities/library",
            Sports: "/facilities/sports",
            "Computer Lab": "/facilities/computer",
        },
        Academics: {
            "11th Science": "/academics/11th-science",
            "11th Commerce": "/academics/11th-commerce",
            "11th Arts": "/academics/11th-arts",
            "12th Science": "/academics/12th-science",
            "12th Commerce": "/academics/12th-commerce",
            "12th Arts": "/academics/12th-arts",
        },
        Events: {
            "Annual Day": "/events/annualday",
            "Science Exhibition": "/events/scienceexhibition",
            Picnic: "/events/picinic",
            "Cultural Programs": "/events/cultural",
        },
        Achievements: {
            Awards: "/achievements/awards",
            "Sports Achievements": "/achievements/sports",
            "Academic Achievements": "/achievements/academic",
        },
    };

    const toggleMenu = (key) => {
        setMenu(menu === key ? null : key);
    };

    const openDropdown = (key) => {
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
        }
        setMenu(key);
    };

    const closeDropdownWithDelay = () => {
        closeTimerRef.current = setTimeout(() => {
            setMenu(null);
        }, 120);
    };

    const toggleMobileDropdown = (key) => {
        setMobileDropdown((prev) => (prev === key ? null : key));
    };

    /* CLOSE DROPDOWN WHEN CLICK OUTSIDE */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setMenu(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            if (closeTimerRef.current) {
                clearTimeout(closeTimerRef.current);
            }
        };
    }, []);

    return (

        <header ref={navRef} className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 shadow-[0_4px_24px_rgba(15,23,42,0.08)] backdrop-blur">

            <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-20">

                {/* LOGO */}
                <Link href="/" className="flex items-center gap-3">
                    <Image
                        src="/college/snk.png"
                        alt="College Logo"
                        width={50}
                        height={50}
                    />
                </Link>

                {/* DESKTOP MENU */}
                <nav className="hidden lg:flex items-center gap-5 xl:gap-8 font-medium text-gray-700 text-sm xl:text-base">

                    <Link href="/" className="navItem">Home</Link>
                    <Link href="/about" className="navItem">About</Link>

                    {Object.keys(dropdown).map((key) => (

                        <div key={key} className="relative">

                            <button
                                onClick={() => toggleMenu(key)}
                                onMouseEnter={() => openDropdown(key)}
                                onMouseLeave={closeDropdownWithDelay}
                                className="group flex items-center gap-1 navItem cursor-pointer"
                            >
                                {key}
                                <FaChevronDown className={`text-xs transition-transform duration-200 ${menu === key ? "rotate-180" : ""}`} />
                            </button>

                            <AnimatePresence>
                                {menu === key && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="absolute left-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_60px_rgba(2,6,23,0.24)]"
                                        onMouseEnter={() => openDropdown(key)}
                                        onMouseLeave={closeDropdownWithDelay}
                                        role="menu"
                                        tabIndex={-1}
                                    >
                                        <div className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                                            {key}
                                        </div>

                                        {dropdown[key].map((item) => (
                                            <Link
                                                key={item}
                                                href={dropdownRoutes[key][item]}
                                                className="group/item mb-1 block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 transition-all duration-200 hover:bg-[#7a1c1c]/10 hover:text-[#7a1c1c]"
                                                onClick={() => setMenu(null)}
                                            >
                                                <span className="inline-flex items-center gap-2">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 transition-colors group-hover/item:bg-[#7a1c1c]" />
                                                    {item}
                                                </span>
                                            </Link>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </div>

                    ))}

                    <Link href="/gallery" className="navItem">Gallery</Link>
                    <Link href="/admissions" className="navItem">Admissions</Link>
                    <Link href="/contact" className="navItem">Contact</Link>

                    <Link
                        href="/login"
                        className="px-5 py-2 rounded-lg bg-[#7a1c1c] text-white hover:bg-[#9f2a2a]"
                    >
                        Login
                    </Link>

                </nav>

                {/* MOBILE BUTTON */}
                <button
                    onClick={() => {
                        setMobileMenu(!mobileMenu);
                        if (mobileMenu) {
                            setMobileDropdown(null);
                        }
                    }}
                    className="lg:hidden text-xl cursor-pointer"
                >
                    {mobileMenu ? <FaTimes /> : <FaBars />}
                </button>

            </div>

            {/* MOBILE MENU */}
            {mobileMenu && (

                <div className="lg:hidden bg-white border-t px-6 py-4 space-y-3 font-medium text-gray-700">

                    <Link href="/" onClick={() => setMobileMenu(false)} className="block py-1">Home</Link>
                    <Link href="/about" onClick={() => setMobileMenu(false)} className="block py-1">About</Link>

                    {Object.keys(dropdown).map((key) => (
                        <div key={key} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <button
                                type="button"
                                onClick={() => toggleMobileDropdown(key)}
                                className="flex w-full cursor-pointer items-center justify-between bg-slate-50 px-3 py-2.5 font-semibold text-[#7a1c1c]"
                            >
                                <span>{key}</span>
                                <FaChevronDown
                                    className={`text-xs transition-transform duration-200 ${mobileDropdown === key ? "rotate-180" : ""}`}
                                />
                            </button>

                            <AnimatePresence initial={false}>
                                {mobileDropdown === key && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="overflow-hidden bg-white"
                                    >
                                        <div className="space-y-1 px-2 py-2">
                                            {dropdown[key].map((item) => (
                                                <Link
                                                    key={item}
                                                    href={dropdownRoutes[key][item]}
                                                    onClick={() => {
                                                        setMobileMenu(false);
                                                        setMobileDropdown(null);
                                                    }}
                                                    className="block cursor-pointer rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-[#7a1c1c]/8 hover:text-[#7a1c1c]"
                                                >
                                                    {item}
                                                </Link>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}

                    <Link href="/gallery" onClick={() => setMobileMenu(false)} className="block py-1">Gallery</Link>
                    <Link href="/admissions" onClick={() => setMobileMenu(false)} className="block py-1">Admissions</Link>
                    <Link href="/contact" onClick={() => setMobileMenu(false)} className="block py-1">Contact</Link>

                    <Link
                        href="/login"
                        onClick={() => setMobileMenu(false)}
                        className="block bg-[#7a1c1c] text-white text-center py-2 rounded-md"
                    >
                        Login
                    </Link>

                </div>

            )}
            {/* ================= THOUGHT MARQUEE ================= */}
            <div className="bg-[#7a1c1c] text-white py-2 text-sm font-medium">
                <marquee>
                    📚 Knowledge is the Path to Success • 🎓 Excellence in Education •
                    🌟 Building Bright Futures • Shri Nanasaheb Kulkarni
                    Junior College Borli Panchatan Shrivardhan Raigad 402403
                </marquee>
            </div>
        </header>

    );
}