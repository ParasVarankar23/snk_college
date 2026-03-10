import Image from "next/image";
import Link from "next/link";
import { FaEnvelope, FaFacebook, FaInstagram, FaMapMarkerAlt, FaPhone, FaYoutube } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="bg-[#7a1c1c] text-white">

            <div className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-4 md:grid-cols-2 gap-10">

                {/* COLLEGE INFO */}
                <div>

                    <div className="flex items-center gap-3 mb-4">

                        <Image
                            src="/college/snk.png"
                            alt="College Logo"
                            width={50}
                            height={50}
                        />

                        <h2 className="font-semibold text-lg">
                            SNK Mahavidyalay
                        </h2>

                    </div>

                    <p className="text-sm text-gray-200 text-justify leading-relaxed">
                        Shri Nanasaheb Kulkarni Kanishta Mahavidyalay, Borli Panchatan,
                        Shrivardhan, Raigad. Our mission is to provide quality education
                        and inspire students to achieve excellence.
                    </p>

                </div>

                {/* QUICK LINKS */}
                <div>

                    <h3 className="text-lg font-semibold mb-4">Quick Links</h3>

                    <ul className="space-y-2 text-gray-200">

                        <li><Link href="/">Home</Link></li>
                        <li><Link href="/about">About Us</Link></li>
                        <li><Link href="/admissions">Admissions</Link></li>
                        <li><Link href="/gallery">Gallery</Link></li>
                        <li><Link href="/contact">Contact</Link></li>

                    </ul>

                </div>

                {/* ACADEMICS */}
                <div>

                    <h3 className="text-lg font-semibold mb-4">Academics</h3>

                    <ul className="space-y-2 text-gray-200 cursor-pointer">

                        <li><Link href="/academics">All Programs</Link></li>
                        <li><Link href="/academics/11th-science">11th Science</Link></li>
                        <li><Link href="/academics/11th-commerce">11th Commerce</Link></li>
                        <li><Link href="/academics/11th-arts">11th Arts</Link></li>
                        <li><Link href="/academics/12th-science">12th Science</Link></li>
                        <li><Link href="/academics/12th-commerce">12th Commerce</Link></li>
                        <li><Link href="/academics/12th-arts">12th Arts</Link></li>

                    </ul>

                </div>

                {/* CONTACT */}
                <div>

                    <h3 className="text-lg font-semibold mb-4">Contact Us</h3>

                    <ul className="space-y-3 text-gray-200">

                        <li className="flex items-center gap-2">
                            <FaMapMarkerAlt />
                            Borli Panchatan, Shrivardhan, Raigad
                        </li>

                        <li className="flex items-center gap-2">
                            <FaPhone />
                            +91 94211 60366
                        </li>

                        <li className="flex items-center gap-2">
                            <FaEnvelope />
                            snkcollege@gmail.com
                        </li>

                    </ul>

                    {/* SOCIAL MEDIA */}
                    <div className="flex gap-4 mt-5 text-xl">

                        <FaFacebook className="cursor-pointer hover:text-gray-300" />
                        <FaInstagram className="cursor-pointer hover:text-gray-300" />
                        <FaYoutube className="cursor-pointer hover:text-gray-300" />

                    </div>

                </div>

            </div>

            {/* COPYRIGHT */}
            <div className="border-t border-red-900 text-center py-4 text-sm text-gray-200">

                © {new Date().getFullYear()} Shri Nanasaheb Kulkarni Kanishta
                Mahavidyalay Borli Panchatan. All Rights Reserved.

            </div>

        </footer>
    );
}