import Link from "next/link";
import { FaBan, FaChevronRight, FaEnvelope, FaExclamationTriangle, FaFileContract, FaGavel, FaUserCheck } from "react-icons/fa";

export const metadata = {
    title: "Terms of Use | SNK Junior College",
    description: "Terms and Conditions for using the SNK Junior College website and services.",
};

const sections = [
    {
        id: "acceptance",
        icon: <FaUserCheck className="text-red-500" />,
        title: "Acceptance of Terms",
        content: [
            {
                subtitle: "Agreement to Terms",
                text: "By accessing or using the website of Shri Nanasaheb Kulkarni Junior College ('the College', 'we', 'us', or 'our'), you agree to be legally bound by these Terms of Use. If you do not agree with any part of these terms, please discontinue use of the website immediately.",
            },
            {
                subtitle: "Eligibility",
                text: "This website is intended for use by prospective and current students, parents, guardians, faculty, staff, and general visitors. By using this site, you confirm that you are at least 13 years of age or are accessing the website under parental/guardian supervision.",
            },
        ],
    },
    {
        id: "use-of-website",
        icon: <FaFileContract className="text-red-500" />,
        title: "Use of the Website",
        content: [
            {
                subtitle: "Permitted Use",
                text: "You may use this website for lawful purposes only. This includes accessing information about the college, academic programs, events, admissions, and contacting the college administration. You agree to use the site in a manner consistent with all applicable laws and regulations.",
            },
            {
                subtitle: "Account Responsibility",
                text: "If you create a student/parent account on our portal, you are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.",
            },
            {
                subtitle: "Accuracy of Information",
                text: "When submitting forms, admission applications, or any information through our website, you agree to provide accurate, current, and complete information. Submitting false or misleading information may result in cancellation of admission or services without refund.",
            },
        ],
    },
    {
        id: "prohibited-activities",
        icon: <FaBan className="text-red-500" />,
        title: "Prohibited Activities",
        content: [
            {
                subtitle: "You Must NOT",
                text: "Use the website to transmit or upload any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, obscene, or otherwise objectionable; attempt to gain unauthorized access to any portion or feature of the website or any systems connected to it; use automated tools, bots, or scripts to scrape, crawl, or extract data from the website; impersonate any person, student, faculty member, or college official; or interfere with the proper working of the website.",
            },
            {
                subtitle: "Intellectual Property Violations",
                text: "You may not copy, reproduce, distribute, modify, or create derivative works from any content on this website without prior written permission from the College. All logos, photographs, text, graphics, and other materials on this site are the intellectual property of SNK Junior College or their respective owners.",
            },
        ],
    },
    {
        id: "intellectual-property",
        icon: <FaGavel className="text-red-500" />,
        title: "Intellectual Property",
        content: [
            {
                subtitle: "College Ownership",
                text: "All content published on this website, including but not limited to text, images, logos, video, audio, data, and software, is the property of Shri Nanasaheb Kulkarni Junior College or its content suppliers and is protected under applicable Indian intellectual property laws.",
            },
            {
                subtitle: "Limited License",
                text: "You are granted a limited, non-exclusive, non-transferable license to access and view the content on this website for personal, non-commercial, and informational purposes only. This license does not include the right to download, reproduce, or distribute any material without express written consent.",
            },
        ],
    },
    {
        id: "admissions-fees",
        icon: <FaFileContract className="text-red-500" />,
        title: "Admissions & Fee Payments",
        content: [
            {
                subtitle: "Online Admission Applications",
                text: "Submission of an online admission application does not guarantee admission. All applications are subject to review, eligibility verification, and the availability of seats. The College reserves the right to accept or reject any application in accordance with the Maharashtra HSC Board regulations and the College admission policy.",
            },
            {
                subtitle: "Fee Payments",
                text: "Online fee payments processed through our portal are subject to the terms of the respective payment gateway provider. The College is not responsible for transaction failures due to network issues or third-party payment processor downtime. All fee-related disputes must be raised with the college administration within 7 working days of the transaction.",
            },
            {
                subtitle: "Refund Policy",
                text: "Fees once paid are generally non-refundable except in cases where the College cancels the admission or as mandated by the Maharashtra State Government's fee refund policies. Students seeking refunds must apply in writing to the Principal's office.",
            },
        ],
    },
    {
        id: "disclaimers",
        icon: <FaExclamationTriangle className="text-red-500" />,
        title: "Disclaimers & Limitation of Liability",
        content: [
            {
                subtitle: "No Warranty",
                text: "This website and its content are provided on an 'as is' and 'as available' basis without warranties of any kind, either express or implied. The College does not warrant that the website will be error-free, uninterrupted, secure, or that it will meet your requirements.",
            },
            {
                subtitle: "Third-Party Links",
                text: "Our website may contain links to third-party websites for convenience and informational purposes. The College does not endorse or assume any responsibility for the content, privacy policies, or practices of any third-party websites. We encourage you to review the terms and privacy policies of any external sites you visit.",
            },
            {
                subtitle: "Limitation of Liability",
                text: "To the maximum extent permitted by law, the College shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of or inability to use this website or its content.",
            },
        ],
    },
    {
        id: "governing-law",
        icon: <FaGavel className="text-red-500" />,
        title: "Governing Law & Jurisdiction",
        content: [
            {
                subtitle: "Applicable Law",
                text: "These Terms of Use shall be governed by and construed in accordance with the laws of India. Any disputes arising from or in connection with these terms or your use of the website shall be subject to the exclusive jurisdiction of the courts located in Raigad District, Maharashtra.",
            },
        ],
    },
];

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-gray-50">

            {/* HERO BANNER */}
            <section className="relative bg-gradient-to-br from-[#7a1c1c] via-[#6b1a1a] to-[#4a1010] text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }}
                />
                <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl ring-1 ring-white/20 mb-6 backdrop-blur-sm">
                        <FaFileContract className="text-3xl text-red-300" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Terms of Use</h1>
                    <p className="text-red-200/80 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                        Please read these Terms of Use carefully before using the SNK Junior College
                        website and online services.
                    </p>
                    <p className="mt-5 text-xs text-red-300/60 uppercase tracking-widest">Last updated: March 2026</p>

                    {/* BREADCRUMB */}
                    <nav className="mt-6 flex items-center justify-center gap-2 text-xs text-red-300/70">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <FaChevronRight className="text-[10px]" />
                        <span className="text-red-200">Terms of Use</span>
                    </nav>
                </div>
            </section>

            {/* CONTENT */}
            <section className="max-w-5xl mx-auto px-6 py-14">

                {/* IMPORTANT NOTICE */}
                <div className="flex items-start gap-4 bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-10">
                    <FaExclamationTriangle className="text-amber-500 text-xl mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-800 leading-relaxed">
                        <span className="font-bold">Important:</span> These Terms of Use constitute a legally binding agreement
                        between you and Shri Nanasaheb Kulkarni Junior College. By continuing to use this website,
                        you acknowledge that you have read, understood, and agree to these terms.
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

                    {/* MODIFICATIONS */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                                <FaFileContract className="text-red-500" />
                            </div>
                            <h2 className="font-bold text-gray-800 text-base md:text-lg">
                                <span className="text-red-400 mr-2">08.</span>
                                Modifications to Terms
                            </h2>
                        </div>
                        <div className="px-6 py-5">
                            <p className="text-sm text-gray-600 leading-relaxed">
                                The College reserves the right to modify these Terms of Use at any time without prior notice.
                                Updates will be posted on this page with a revised "Last Updated" date. Your continued use of the
                                website after any changes constitutes your acceptance of the revised terms. We encourage you
                                to check this page periodically.
                            </p>
                        </div>
                    </div>
                </div>

                {/* RELATED LINK */}
                <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                        <FaGavel className="text-red-500 text-xl" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <p className="font-semibold text-gray-800 text-sm">Also read our Privacy Policy</p>
                        <p className="text-xs text-gray-500 mt-0.5">Understand how we collect, use, and protect your personal information.</p>
                    </div>
                    <Link
                        href="/privacy"
                        className="inline-flex items-center gap-2 bg-[#7a1c1c] hover:bg-[#6b1a1a] text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-200 hover:scale-105 shadow"
                    >
                        Privacy Policy
                    </Link>
                </div>

                {/* CONTACT CARD */}
                <div className="mt-8 bg-gradient-to-br from-[#7a1c1c] to-[#4a1010] text-white rounded-2xl p-8 text-center">
                    <FaEnvelope className="text-3xl text-red-300 mx-auto mb-3" />
                    <h3 className="text-xl font-bold mb-2">Questions About These Terms?</h3>
                    <p className="text-red-200/80 text-sm mb-6 max-w-md mx-auto">
                        If you have any questions or require clarification about these Terms of Use,
                        our administrative team is here to help.
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
