"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaCheckCircle, FaTimes } from "react-icons/fa";

export default function AdmissionEnquiryWidget() {
    const [open, setOpen] = useState(false);
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

    const resetAndClose = () => {
        setOpen(false);
        setTimeout(() => {
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
        }, 300);
    };

    return (
        <>
            {/* Fixed right-side button */}
            <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[990]">
                <button
                    onClick={() => setOpen(true)}
                    className="flex items-center justify-center bg-[#7a1c1c] text-white shadow-xl hover:bg-[#9f2a2a] transition-all duration-300"
                    style={{
                        writingMode: "vertical-rl",
                        textOrientation: "mixed",
                        padding: "18px 10px",
                        borderRadius: "10px 0 0 10px",
                        fontSize: "13px",
                        fontWeight: "600",
                        letterSpacing: "0.05em",
                        transform: "translateY(-50%)",
                    }}
                    aria-label="Open Admission Enquiry"
                >
                    Admission Enquiry
                </button>
            </div>

            {/* Modal Overlay */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[995] flex items-center justify-center bg-black/50 px-4 py-6"
                        onClick={(e) => { if (e.target === e.currentTarget) resetAndClose(); }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 24 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 24 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[28px] border border-white/70 bg-white shadow-[0_22px_70px_rgba(15,23,42,0.2)]"
                        >
                            {/* Close button */}
                            <button
                                onClick={resetAndClose}
                                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow transition hover:bg-slate-50 hover:text-slate-800"
                                aria-label="Close"
                            >
                                <FaTimes />
                            </button>

                            <div className="p-6 md:p-8">
                                {submitted ? (
                                    /* Success State */
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="flex flex-col items-center py-10 text-center"
                                    >
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: [0.9, 1.08, 1], opacity: 1 }}
                                            transition={{ duration: 0.6 }}
                                            className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#7a1c1c]/10"
                                        >
                                            <FaCheckCircle className="text-3xl text-[#7a1c1c]" />
                                        </motion.div>
                                        <h2 className="text-2xl font-bold text-slate-900">
                                            Inquiry Submitted Successfully!
                                        </h2>
                                        <p className="mt-3 max-w-sm text-slate-600">
                                            Thank you for your interest in SNK Juinor College. Our
                                            admission team will contact you shortly.
                                        </p>
                                        <div className="mt-7 flex gap-3">
                                            <button
                                                onClick={() => {
                                                    setSubmitted(false);
                                                    setFormData({
                                                        name: "", email: "", phone: "",
                                                        course: "", department: "", message: "", agree: false,
                                                    });
                                                }}
                                                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                            >
                                                Submit Another
                                            </button>
                                            <button
                                                onClick={resetAndClose}
                                                className="rounded-xl bg-[#7a1c1c] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#7a1c1c]/20 transition hover:bg-[#9f2a2a]"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    /* Form */
                                    <>
                                        {/* Header */}
                                        <div className="mb-6">
                                            <div className="mb-3 inline-flex items-center rounded-full border border-[#7a1c1c]/15 bg-[#7a1c1c]/5 px-3 py-1.5 text-xs font-medium text-[#7a1c1c]">
                                                Contact Us
                                            </div>
                                            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
                                                Admission Inquiry Form
                                            </h2>
                                            <p className="mt-1.5 text-slate-500">
                                                Fill in your details and our office will get in touch with you.
                                            </p>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            {/* Row 1 */}
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div>
                                                    <label htmlFor="enq-name" className="mb-2 block text-sm font-medium text-slate-700">
                                                        Student Name
                                                    </label>
                                                    <input
                                                        id="enq-name"
                                                        type="text"
                                                        name="name"
                                                        value={formData.name}
                                                        required
                                                        onChange={handleChange}
                                                        placeholder="Enter full name"
                                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition focus:border-[#7a1c1c] focus:ring-4 focus:ring-[#7a1c1c]/10"
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="enq-email" className="mb-2 block text-sm font-medium text-slate-700">
                                                        Email ID
                                                    </label>
                                                    <input
                                                        id="enq-email"
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        required
                                                        onChange={handleChange}
                                                        placeholder="Enter email"
                                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition focus:border-[#7a1c1c] focus:ring-4 focus:ring-[#7a1c1c]/10"
                                                    />
                                                </div>
                                            </div>

                                            {/* Row 2 */}
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div>
                                                    <label htmlFor="enq-phone" className="mb-2 block text-sm font-medium text-slate-700">
                                                        Phone Number
                                                    </label>
                                                    <input
                                                        id="enq-phone"
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        required
                                                        onChange={handleChange}
                                                        placeholder="Enter phone"
                                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition focus:border-[#7a1c1c] focus:ring-4 focus:ring-[#7a1c1c]/10"
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="enq-course" className="mb-2 block text-sm font-medium text-slate-700">
                                                        Class
                                                    </label>
                                                    <select
                                                        id="enq-course"
                                                        name="course"
                                                        value={formData.course}
                                                        required
                                                        onChange={handleChange}
                                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition focus:border-[#7a1c1c] focus:ring-4 focus:ring-[#7a1c1c]/10"
                                                    >
                                                        <option value="">Select Class</option>
                                                        <option value="11th">11th</option>
                                                        <option value="12th">12th</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Department */}
                                            <div>
                                                <label htmlFor="enq-department" className="mb-2 block text-sm font-medium text-slate-700">
                                                    Department
                                                </label>
                                                <select
                                                    id="enq-department"
                                                    name="department"
                                                    value={formData.department}
                                                    required
                                                    onChange={handleChange}
                                                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition focus:border-[#7a1c1c] focus:ring-4 focus:ring-[#7a1c1c]/10"
                                                >
                                                    <option value="">Select Department</option>
                                                    <option value="Science">Science</option>
                                                    <option value="Commerce">Commerce</option>
                                                    <option value="Arts">Arts</option>
                                                </select>
                                            </div>

                                            {/* Message */}
                                            <div>
                                                <label htmlFor="enq-message" className="mb-2 block text-sm font-medium text-slate-700">
                                                    Message
                                                </label>
                                                <textarea
                                                    id="enq-message"
                                                    name="message"
                                                    rows={3}
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    placeholder="Any additional message..."
                                                    className="w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-slate-800 outline-none transition focus:border-[#7a1c1c] focus:ring-4 focus:ring-[#7a1c1c]/10"
                                                />
                                            </div>

                                            {/* Terms */}
                                            <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                                                <input
                                                    id="enq-agree"
                                                    type="checkbox"
                                                    name="agree"
                                                    checked={formData.agree}
                                                    onChange={handleChange}
                                                    className="mt-1 accent-[#7a1c1c]"
                                                />
                                                <label htmlFor="enq-agree" className="cursor-pointer text-sm leading-6 text-slate-600">
                                                    I agree to the terms and conditions and allow the college
                                                    office to contact me regarding admission details.
                                                </label>
                                            </div>

                                            {/* Submit */}
                                            <motion.button
                                                whileHover={{ y: -2, scale: 1.01 }}
                                                whileTap={{ scale: 0.98 }}
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="h-12 w-full rounded-xl bg-[#7a1c1c] font-semibold text-white shadow-lg shadow-[#7a1c1c]/20 transition hover:bg-[#9f2a2a] disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {isSubmitting ? "Submitting..." : "Submit Inquiry"}
                                            </motion.button>
                                        </form>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
