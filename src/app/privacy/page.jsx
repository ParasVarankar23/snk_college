import Link from "next/link";
import { FaChevronRight, FaDatabase, FaEnvelope, FaLock, FaShieldAlt, FaUserShield } from "react-icons/fa";

export const metadata = {
    title: "Privacy Policy | SNK Juinor College",
    description: "Privacy Policy for Shri Nanasaheb Kulkarni Juinor College, Borli Panchatan.",
};

const sections = [
    {
        id: "information-we-collect",
        icon: <FaDatabase className="text-red-500" />,
        title: "Information We Collect",
        content: [
            {
                subtitle: "Personal Information",
                text: "We may collect personal information that you voluntarily provide when you interact with our website, including but not limited to: your full name, email address, phone number, postal address, date of birth, academic records, and admission-related documents.",
            },
            {
                subtitle: "Automatically Collected Information",
                text: "When you visit our website, certain information is automatically collected by our servers, including your IP address, browser type and version, operating system, referring URLs, pages visited, and the date and time of your visit. This data helps us understand how visitors use our site and improve our services.",
            },
            {
                subtitle: "Cookies & Tracking Technologies",
                text: "Our website uses cookies and similar tracking technologies to enhance your browsing experience, remember your preferences, and analyze website traffic. You can control cookie settings through your browser; however, disabling cookies may affect certain features of the site.",
            },
        ],
    },
    {
        id: "how-we-use",
        icon: <FaUserShield className="text-red-500" />,
        title: "How We Use Your Information",
        content: [
            {
                subtitle: "Academic & Administrative Purposes",
                text: "Information collected is primarily used to process admission applications, maintain student records, communicate important academic updates, manage fee payments, and deliver the educational services offered by the college.",
            },
            {
                subtitle: "Communication",
                text: "We use your contact details to send notifications about academic events, examination schedules, result announcements, college news, and other relevant communications. You may opt out of non-essential communications at any time.",
            },
            {
                subtitle: "Website Improvement",
                text: "Aggregate, anonymized data is used to analyze usage patterns, diagnose technical issues, improve website functionality, and tailor content to better serve our students, parents, and visitors.",
            },
        ],
    },
    {
        id: "data-sharing",
        icon: <FaLock className="text-red-500" />,
        title: "Data Sharing & Disclosure",
        content: [
            {
                subtitle: "We Do Not Sell Your Data",
                text: "SNK Juinor College does not sell, trade, or rent your personal information to third parties for commercial purposes.",
            },
            {
                subtitle: "Trusted Third Parties",
                text: "We may share information with carefully selected service providers who assist in operating our website and delivering college services (e.g., payment processors, cloud storage providers). These parties are bound by confidentiality agreements and are prohibited from using your data for any other purpose.",
            },
            {
                subtitle: "Legal Requirements",
                text: "We may disclose your information if required to do so by law, court order, or governmental authority, or if we believe disclosure is necessary to protect the rights, property, or safety of the college, students, or the public.",
            },
        ],
    },
    {
        id: "data-security",
        icon: <FaShieldAlt className="text-red-500" />,
        title: "Data Security",
        content: [
            {
                subtitle: "Security Measures",
                text: "We implement industry-standard security measures including SSL/TLS encryption, secure servers, access controls, and regular security audits to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
            },
            {
                subtitle: "Limitation",
                text: "While we take every reasonable precaution to protect your data, no method of internet transmission or electronic storage is 100% secure. We cannot guarantee absolute security but are committed to continuously improving our practices.",
            },
        ],
    },
    {
        id: "your-rights",
        icon: <FaUserShield className="text-red-500" />,
        title: "Your Rights",
        content: [
            {
                subtitle: "Access & Correction",
                text: "You have the right to access, correct, or update the personal information we hold about you. Students and parents may contact the college administration to request changes to their records.",
            },
            {
                subtitle: "Deletion",
                text: "In certain circumstances, you may request the deletion of your personal data. Requests are subject to the college's legal and regulatory obligations regarding record retention.",
            },
            {
                subtitle: "Withdrawal of Consent",
                text: "Where processing is based on your consent, you may withdraw it at any time without affecting the lawfulness of processing before withdrawal.",
            },
        ],
    },
];

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-gray-50">

            {/* HERO BANNER */}
            <section className="relative bg-gradient-to-br from-[#7a1c1c] via-[#6b1a1a] to-[#4a1010] text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }}
                />
                <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl ring-1 ring-white/20 mb-6 backdrop-blur-sm">
                        <FaShieldAlt className="text-3xl text-red-300" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Privacy Policy</h1>
                    <p className="text-red-200/80 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                        Your privacy matters to us. This policy explains how SNK Juinor College collects,
                        uses, and protects your personal information.
                    </p>
                    <p className="mt-5 text-xs text-red-300/60 uppercase tracking-widest">Last updated: March 2026</p>

                    {/* BREADCRUMB */}
                    <nav className="mt-6 flex items-center justify-center gap-2 text-xs text-red-300/70">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <FaChevronRight className="text-[10px]" />
                        <span className="text-red-200">Privacy Policy</span>
                    </nav>
                </div>
            </section>

            {/* CONTENT */}
            <section className="max-w-5xl mx-auto px-6 py-14">

                {/* INTRO CARD */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-10">
                    <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                        Welcome to the official website of{" "}
                        <span className="font-semibold text-gray-800">Shri Nanasaheb Kulkarni Juinor College</span>,
                        Borli Panchatan, Shrivardhan, Raigad. We are committed to protecting the personal
                        information of our students, parents, staff, and website visitors. Please read this
                        Privacy Policy carefully to understand how we handle your data.
                    </p>
                </div>

                {/* TABLE OF CONTENTS */}
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-10">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-red-700 mb-4">Table of Contents</h2>
                    <ul className="grid sm:grid-cols-2 gap-2">
                        {sections.map((s, i) => (
                            <li key={s.id}>
                                <a
                                    href={`#${s.id}`}
                                    className="flex items-center gap-2 text-sm text-red-700 hover:text-red-900 transition-colors group"
                                >
                                    <span className="w-5 h-5 rounded-full bg-red-100 group-hover:bg-red-200 flex items-center justify-center text-xs font-bold text-red-700 transition-colors">
                                        {i + 1}
                                    </span>
                                    {s.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* SECTIONS */}
                <div className="space-y-8">
                    {sections.map((section, i) => (
                        <div
                            key={section.id}
                            id={section.id}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden scroll-mt-24"
                        >
                            {/* Section Header */}
                            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                                    {section.icon}
                                </div>
                                <h2 className="font-bold text-gray-800 text-base md:text-lg">
                                    <span className="text-red-400 mr-2">{String(i + 1).padStart(2, "0")}.</span>
                                    {section.title}
                                </h2>
                            </div>

                            {/* Section Body */}
                            <div className="px-6 py-5 space-y-5">
                                {section.content.map((item, j) => (
                                    <div key={j}>
                                        <h3 className="text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                                            {item.subtitle}
                                        </h3>
                                        <p className="text-sm text-gray-600 leading-relaxed pl-3.5">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* CHILDREN'S PRIVACY */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                                <FaUserShield className="text-red-500" />
                            </div>
                            <h2 className="font-bold text-gray-800 text-base md:text-lg">
                                <span className="text-red-400 mr-2">06.</span>
                                Children&apos;s Privacy
                            </h2>
                        </div>
                        <div className="px-6 py-5">
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Our website services are directed at students of Juinor College age (typically 15–18 years).
                                We do not knowingly collect personal information from children under the age of 13 without
                                verifiable parental consent. If you believe a minor&apos;s information has been collected
                                without proper consent, please contact us immediately.
                            </p>
                        </div>
                    </div>

                    {/* CHANGES TO POLICY */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                                <FaShieldAlt className="text-red-500" />
                            </div>
                            <h2 className="font-bold text-gray-800 text-base md:text-lg">
                                <span className="text-red-400 mr-2">07.</span>
                                Changes to This Policy
                            </h2>
                        </div>
                        <div className="px-6 py-5">
                            <p className="text-sm text-gray-600 leading-relaxed">
                                We reserve the right to update this Privacy Policy at any time. Changes will be posted
                                on this page with a revised "Last Updated" date. We encourage you to review this policy
                                periodically to stay informed about how we protect your information.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CONTACT CARD */}
                <div className="mt-12 bg-gradient-to-br from-[#7a1c1c] to-[#4a1010] text-white rounded-2xl p-8 text-center">
                    <FaEnvelope className="text-3xl text-red-300 mx-auto mb-3" />
                    <h3 className="text-xl font-bold mb-2">Have Questions?</h3>
                    <p className="text-red-200/80 text-sm mb-6 max-w-md mx-auto">
                        If you have any questions or concerns about this Privacy Policy or how we handle
                        your personal data, please reach out to us.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <a
                            href="mailto:snkcollege@gmail.com"
                            className="inline-flex items-center gap-2 bg-white text-[#7a1c1c] font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-red-50 transition-all duration-200 hover:scale-105 shadow"
                        >
                            <FaEnvelope />
                            snkcollege@gmail.com
                        </a>
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium px-6 py-2.5 rounded-full transition-all duration-200"
                        >
                            Contact Page
                        </Link>
                    </div>
                </div>

            </section>
        </main>
    );
}
