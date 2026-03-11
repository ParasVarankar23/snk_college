"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import {
    FaCheckCircle,
    FaEnvelope,
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaUserTie,
} from "react-icons/fa";

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

const officeContacts = [
    {
        name: "Abhay Patil",
        phone: "+91 9876543210",
        email: "abhay@snkcollege.com",
    },
    {
        name: "Deepa Surve",
        phone: "+91 9876543211",
        email: "deepa@snkcollege.com",
    },
    {
        name: "Uttam Divekar",
        phone: "+91 9876543212",
        email: "uttam@snkcollege.com",
    },
];

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        course: "",
        department: "",
        message: "",
        agree: false,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.agree) {
            toast.error("Please agree to the terms and conditions.");
            return;
        }

        try {
            setIsSubmitting(true);

            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    course: formData.course,
                    department: formData.department,
                    message: formData.message,
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to submit inquiry");

            toast.success("Inquiry submitted successfully!");
            setSubmitted(true);
        } catch (error) {
            toast.error(error.message || "Failed to submit inquiry");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <section className="relative overflow-hidden bg-stone-100 py-14 md:py-20">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-[#7a1c1c]/10 blur-3xl" />
                    <div className="absolute right-0 top-1/4 h-72 w-72 rounded-full bg-[#7a1c1c]/10 blur-3xl" />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative mx-auto max-w-xl px-6"
                >
                    <div className="rounded-3xl border border-white/70 bg-white/90 p-10 text-center shadow-[0_22px_70px_rgba(15,23,42,0.12)] backdrop-blur md:p-12">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: [0.9, 1.08, 1], opacity: 1 }}
                            transition={{ duration: 0.6 }}
                            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#7a1c1c]/10"
                        >
                            <FaCheckCircle className="text-3xl text-[#7a1c1c]" />
                        </motion.div>

                        <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
                            Inquiry Submitted Successfully!
                        </h2>

                        <p className="mt-3 text-slate-600">
                            Thank you for your interest in SNK Junior College. Our admission
                            team will contact you shortly.
                        </p>

                        <button
                            onClick={() => {
                                setSubmitted(false);
                                setFormData({
                                    name: "",
                                    email: "",
                                    phone: "",
                                    course: "",
                                    department: "",
                                    message: "",
                                    agree: false,
                                });
                            }}
                            className="mt-7 rounded-xl bg-[#7a1c1c] px-6 py-3 font-semibold text-white shadow-lg shadow-[#7a1c1c]/20 transition duration-200 hover:bg-[#9f2a2a]"
                        >
                            Submit Another Inquiry
                        </button>
                    </div>
                </motion.div>
            </section>
        );
    }

    return (
        <section className="relative overflow-hidden bg-stone-100 py-2 md:py-5">
            {/* Background Decorative Blurs */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-[#7a1c1c]/10 blur-3xl" />
                <div className="absolute right-0 top-1/4 h-72 w-72 rounded-full bg-[#7a1c1c]/10 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-white/80 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="mb-12 text-center"
                >
                    <div className="mb-4 inline-flex items-center rounded-full border border-[#7a1c1c]/15 bg-[#7a1c1c]/5 px-4 py-2 text-sm font-medium text-[#7a1c1c]">
                        Contact Us
                    </div>
                    <h1 className="text-xl font-bold text-slate-950 md:text-3xl">
                        Admission Inquiry for{" "}
                        <span className="text-[#7a1c1c]">SNK Junior College</span>
                    </h1>

                    <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
                        Connect with our admission team for guidance related to class
                        selection, department options, and general admission information.
                    </p>
                </motion.div>

                {/* Main Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                    className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]"
                >
                    {/* ================= LEFT FORM ================= */}
                    <motion.div variants={itemVariants}>
                        <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_22px_70px_rgba(15,23,42,0.12)] backdrop-blur md:p-8">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
                                    Admission Inquiry Form
                                </h2>
                                <p className="mt-2 text-slate-500">
                                    Fill in your details and our office will get in touch with
                                    you.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* ROW 1 */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="contact-name"
                                            className="mb-2 block font-medium text-slate-700"
                                        >
                                            Student Name
                                        </label>
                                        <motion.input
                                            whileFocus={{ scale: 1.01 }}
                                            id="contact-name"
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            required
                                            onChange={handleChange}
                                            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition duration-200 focus:border-[#7a1c1c] focus:ring-4 focus:ring-[#7a1c1c]/10"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="contact-email"
                                            className="mb-2 block font-medium text-slate-700"
                                        >
                                            Email ID
                                        </label>
                                        <motion.input
                                            whileFocus={{ scale: 1.01 }}
                                            id="contact-email"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            required
                                            onChange={handleChange}
                                            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition duration-200 focus:border-[#7a1c1c] focus:ring-4 focus:ring-[#7a1c1c]/10"
                                        />
                                    </div>
                                </div>

                                {/* ROW 2 */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="contact-phone"
                                            className="mb-2 block font-medium text-slate-700"
                                        >
                                            Phone Number
                                        </label>
                                        <motion.input
                                            whileFocus={{ scale: 1.01 }}
                                            id="contact-phone"
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            required
                                            onChange={handleChange}
                                            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition duration-200 focus:border-[#7a1c1c] focus:ring-4 focus:ring-[#7a1c1c]/10"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="contact-course"
                                            className="mb-2 block font-medium text-slate-700"
                                        >
                                            Class
                                        </label>
                                        <motion.select
                                            whileFocus={{ scale: 1.01 }}
                                            id="contact-course"
                                            name="course"
                                            value={formData.course}
                                            required
                                            onChange={handleChange}
                                            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition duration-200 focus:border-[#7a1c1c] focus:ring-4 focus:ring-[#7a1c1c]/10"
                                        >
                                            <option value="">Select Class</option>
                                            <option value="11th">11th</option>
                                            <option value="12th">12th</option>
                                        </motion.select>
                                    </div>
                                </div>

                                {/* ROW 3 */}
                                <div>
                                    <label
                                        htmlFor="contact-department"
                                        className="mb-2 block font-medium text-slate-700"
                                    >
                                        Department
                                    </label>
                                    <motion.select
                                        whileFocus={{ scale: 1.01 }}
                                        id="contact-department"
                                        name="department"
                                        value={formData.department}
                                        required
                                        onChange={handleChange}
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition duration-200 focus:border-[#7a1c1c] focus:ring-4 focus:ring-[#7a1c1c]/10"
                                    >
                                        <option value="">Select Department</option>
                                        <option value="Science">Science</option>
                                        <option value="Commerce">Commerce</option>
                                        <option value="Arts">Arts</option>
                                    </motion.select>
                                </div>

                                {/* MESSAGE */}
                                <div>
                                    <label
                                        htmlFor="contact-message"
                                        className="mb-2 block font-medium text-slate-700"
                                    >
                                        Message
                                    </label>
                                    <motion.textarea
                                        whileFocus={{ scale: 1.01 }}
                                        id="contact-message"
                                        name="message"
                                        rows="4"
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-200 bg-white p-4 text-slate-800 outline-none transition duration-200 focus:border-[#7a1c1c] focus:ring-4 focus:ring-[#7a1c1c]/10 resize-none"
                                    />
                                </div>

                                {/* TERMS */}
                                <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                                    <input
                                        id="contact-agree"
                                        type="checkbox"
                                        name="agree"
                                        checked={formData.agree}
                                        onChange={handleChange}
                                        className="mt-1 accent-[#7a1c1c]"
                                    />
                                    <label
                                        htmlFor="contact-agree"
                                        className="cursor-pointer text-sm leading-6 text-slate-600"
                                    >
                                        I agree to the terms and conditions and allow the college
                                        office to contact me regarding admission details.
                                    </label>
                                </div>

                                {/* SUBMIT */}
                                <motion.button
                                    whileHover={{ y: -2, scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="h-12 w-full rounded-xl bg-[#7a1c1c] font-semibold text-white shadow-lg shadow-[#7a1c1c]/20 transition duration-200 hover:bg-[#9f2a2a] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Inquiry"}
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>

                    {/* ================= RIGHT DETAILS ================= */}
                    <motion.div variants={itemVariants}>
                        <div className="space-y-6">
                            {/* Office Contact Card */}
                            <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_22px_70px_rgba(15,23,42,0.12)] backdrop-blur md:p-8">
                                <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
                                    Office Contact
                                </h2>

                                <p className="mt-3 text-slate-600">
                                    For admission and general inquiries, please contact our office
                                    staff.
                                </p>

                                <div className="mt-6 space-y-5">
                                    {officeContacts.map((contact) => (
                                        <motion.div
                                            key={contact.email}
                                            whileHover={{ y: -4, scale: 1.01 }}
                                            transition={{ type: "spring", stiffness: 220, damping: 18 }}
                                            className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-[#7a1c1c]/10 text-[#7a1c1c]">
                                                    <FaUserTie />
                                                </div>

                                                <div>
                                                    <h3 className="font-semibold text-[#7a1c1c]">
                                                        {contact.name}
                                                    </h3>

                                                    <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                                                        <FaPhoneAlt className="text-xs text-[#7a1c1c]" />
                                                        {contact.phone}
                                                    </p>

                                                    <p className="mt-1 flex items-center gap-2 text-sm text-slate-600 break-all">
                                                        <FaEnvelope className="text-xs text-[#7a1c1c]" />
                                                        {contact.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Address Card */}
                            <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_22px_70px_rgba(15,23,42,0.12)] backdrop-blur md:p-8">
                                <h3 className="flex items-center gap-3 text-xl font-bold text-slate-900">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7a1c1c]/10 text-[#7a1c1c]">
                                        <FaMapMarkerAlt />
                                    </span>
                                    College Address
                                </h3>

                                <div className="mt-5 space-y-2 text-slate-600 leading-7">
                                    <p className="font-medium text-[#7a1c1c]">
                                        Shri Nanasaheb Kulkarni Kanishta Mahavidyalay
                                    </p>
                                    <p>Borli Panchatan, Near Government Hospital</p>
                                    <p>Shrivardhan, Raigad</p>
                                    <p>Maharashtra – 402403</p>
                                </div>
                            </div>

                            {/* Quick Info Card */}
                            <div className="rounded-[28px] border border-white/70 bg-gradient-to-br from-[#7a1c1c] via-[#8f2525] to-[#5c1212] p-6 text-white shadow-[0_22px_70px_rgba(122,28,28,0.25)] md:p-8">
                                <h3 className="text-xl font-bold">Need Admission Guidance?</h3>
                                <p className="mt-3 text-white/90 leading-7">
                                    Our admission team is available to help you choose the right
                                    class and department for your academic journey.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}