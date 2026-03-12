"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    FaCheckCircle,
    FaExternalLinkAlt,
    FaFileAlt,
    FaUniversity,
} from "react-icons/fa";

const admissionSteps = [
    {
        title: "Step 1: Registration & Choose College",
        description:
            "Visit https://mahafyjcadmissions.in/, complete registration, and choose Shri Nanasaheb Kulkarni  Junior College, Borli Panchatan during the college selection process.",
        link: "https://mahafyjcadmissions.in",
        hasLink: true,
    },
    {
        title: "Step 2: Fill Personal Form",
        description:
            "Click login at https://snk-college.vercel.app/login, then fill the personal admission form with correct student details.",
        link: "https://snk-college.vercel.app/login",
        hasLink: true,
    },
    {
        title: "Step 3: Merit List & Document Verification",
        description:
            "After form submission, check the merit list, then visit the college office to view and verify all required documents.",
        hasLink: false,
    },
    {
        title: "Step 4: Admission Confirmation",
        description:
            "After successful verification and fee payment, the admission will be confirmed and students will officially become part of the college.",
        hasLink: false,
    },
];

const requiredDocuments = [
    "10th Marksheet (SSC)",
    "School Leaving Certificate",
    "Caste Certificate (if applicable)",
    "Aadhar Card Copy",
    "Passport Size Photographs",
];

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.12,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 28 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, ease: "easeOut" },
    },
};

export default function AdmissionPage() {
    return (
        <section className="relative overflow-hidden bg-stone-100 py-2 md:py-5">
            {/* Background Decorative Blurs */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-[#7a1c1c]/10 blur-3xl" />
                <div className="absolute right-0 top-1/4 h-72 w-72 rounded-full bg-[#7a1c1c]/10 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-white/80 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6">
                {/* PAGE HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="mb-14 text-center"
                >
                    <div className="mb-4 inline-flex items-center rounded-full border border-[#7a1c1c]/15 bg-[#7a1c1c]/5 px-4 py-2 text-sm font-medium text-[#7a1c1c]">
                        Admission Guidance
                    </div>

                    <h1 className="text-xl font-bold text-slate-950 md:text-3xl">
                        Admission Process for{" "}
                        <span className="text-[#7a1c1c]">SNK Junior College</span>
                    </h1>

                    <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
                        Follow the step-by-step admission process to apply for admission to
                        Shri Nanasaheb Kulkarni Junior College, Borli Panchatan.
                    </p>
                </motion.div>

                {/* STEP GRID */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                    className="grid gap-8 md:grid-cols-2"
                >
                    {admissionSteps.map((step, index) => (
                        <motion.div key={step.title} variants={itemVariants}>
                            <motion.div
                                whileHover={{ y: -6, scale: 1.01 }}
                                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                                className="h-full rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_22px_70px_rgba(15,23,42,0.12)] backdrop-blur md:p-8"
                            >
                                <div className="mb-5 flex items-center gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#7a1c1c]/10 text-lg font-bold text-[#7a1c1c]">
                                        {index + 1}
                                    </div>

                                    <h2 className="text-xl font-bold text-[#7a1c1c] md:text-2xl">
                                        {step.title}
                                    </h2>
                                </div>

                                <p className="text-slate-600 text-justify leading-7">{step.description}</p>

                                {step.hasLink && (
                                    <Link
                                        href={step.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-5 inline-flex items-center gap-2 font-semibold text-[#7a1c1c] transition hover:text-[#9f2a2a]"
                                    >
                                        Visit Admission Portal
                                        <FaExternalLinkAlt className="text-xs" />
                                    </Link>
                                )}
                            </motion.div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* BOTTOM SECTION */}
                <div className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                    {/* REQUIRED DOCUMENTS */}
                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        viewport={{ once: true }}
                    >
                        <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_22px_70px_rgba(15,23,42,0.12)] backdrop-blur md:p-8">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7a1c1c]/10 text-[#7a1c1c]">
                                    <FaFileAlt />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
                                    Required Documents
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {requiredDocuments.map((doc) => (
                                    <motion.div
                                        key={doc}
                                        whileHover={{ x: 4 }}
                                        transition={{ type: "spring", stiffness: 220, damping: 18 }}
                                        className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3"
                                    >
                                        <FaCheckCircle className="mt-1 shrink-0 text-[#7a1c1c]" />
                                        <p className="text-slate-700">{doc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* ADMISSION HELP CARD */}
                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.65, ease: "easeOut", delay: 0.08 }}
                        viewport={{ once: true }}
                    >
                        <div className="rounded-[28px] bg-gradient-to-br from-[#7a1c1c] via-[#8f2525] to-[#5c1212] p-6 text-white shadow-[0_22px_70px_rgba(122,28,28,0.25)] md:p-8">
                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl backdrop-blur">
                                <FaUniversity />
                            </div>

                            <h3 className="text-2xl font-bold md:text-3xl">
                                Need Help with Admission?
                            </h3>

                            <p className="mt-4 leading-8 text-justify text-white/90">
                                Our admission office is available to guide you through the
                                registration process, document verification, and department
                                selection for Science, Commerce, and Arts streams.
                            </p>

                            <Link
                                href="/contact"
                                className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 font-semibold text-[#7a1c1c] transition duration-200 hover:bg-slate-100"
                            >
                                Contact Admission Office
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}