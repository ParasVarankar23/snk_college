"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaBars, FaChevronDown, FaTimes } from "react-icons/fa";

export default function Navbar() {

    const [menu, setMenu] = useState(null);
    const [mobileMenu, setMobileMenu] = useState(false);

    const navRef = useRef();

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
        };
    }, []);

    return (

        <header ref={navRef} className="w-full bg-white border-b shadow-sm sticky top-0 z-50">

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
                <nav className="hidden lg:flex items-center gap-8 font-medium text-gray-700">

                    <Link href="/" className="navItem">Home</Link>
                    <Link href="/about" className="navItem">About</Link>

                    {Object.keys(dropdown).map((key) => (

                        <div
                            key={key}
                            className="relative"
                            onMouseEnter={() => setMenu(key)}
                            onMouseLeave={() => setMenu(null)}
                        >

                            <button
                                onClick={() => toggleMenu(key)}
                                className="flex items-center gap-1 navItem"
                            >
                                {key}
                                <FaChevronDown className="text-xs" />
                            </button>

                            {menu === key && (

                                <div className="absolute left-0 top-full mt-2 w-56 bg-white border rounded-lg shadow-lg py-2 z-50">

                                    {dropdown[key].map((item) => (

                                        <Link
                                            key={item}
                                            href={dropdownRoutes[key][item]}
                                            className="block px-4 py-2 hover:bg-gray-100"
                                            onClick={() => setMenu(null)}
                                        >
                                            {item}
                                        </Link>

                                    ))}

                                </div>

                            )}

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
                    onClick={() => setMobileMenu(!mobileMenu)}
                    className="lg:hidden text-xl"
                >
                    {mobileMenu ? <FaTimes /> : <FaBars />}
                </button>

            </div>

            {/* MOBILE MENU */}
            {mobileMenu && (

                <div className="lg:hidden bg-white border-t px-6 py-4 space-y-4 font-medium">

                    <Link href="/" className="block">Home</Link>
                    <Link href="/about" className="block">About</Link>
                    <Link href="/academics" className="block">Academics</Link>
                    <Link href="/gallery" className="block">Gallery</Link>
                    <Link href="/admissions" className="block">Admissions</Link>
                    <Link href="/contact" className="block">Contact</Link>

                    <Link
                        href="/login"
                        className="block bg-[#7a1c1c] text-white text-center py-2 rounded-md"
                    >
                        Login
                    </Link>

                </div>

            )}
            {/* ================= THOUGHT MARQUEE ================= */}
            <div className="bg-[#7a1c1c] text-white py-2 text-sm font-medium">
                <marquee scrollamount="6">
                    📚 Knowledge is the Path to Success • 🎓 Excellence in Education •
                    🌟 Building Bright Futures • Shri Nanasaheb Kulkarni Kanishta
                    Mahavidyalay Borli Panchatan Shrivardhan Raigad 402403
                </marquee>
            </div>

        </header>

    );
}