"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function ContactPage() {

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        course: "",
        department: "",
        message: "",
        agree: false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
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
            <section className="bg-gray-50 py-10">
                <div className="max-w-xl mx-auto px-6">
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="w-16 h-16 bg-[#7a1c1c]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-[#7a1c1c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Inquiry Submitted!</h2>
                        <p className="text-gray-500 mb-6">
                            Thank you for your interest. Our team will contact you shortly.
                        </p>
                        <button
                            onClick={() => {
                                setSubmitted(false);
                                setFormData({ name: "", email: "", phone: "", course: "", department: "", message: "", agree: false });
                            }}
                            className="px-6 py-2.5 rounded-lg bg-[#7a1c1c] text-white font-semibold hover:bg-[#9f2a2a] transition"
                        >
                            Submit Another
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-gray-50 py-10">

            <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">

                {/* ================= CONTACT FORM ================= */}
                <div className="bg-white p-10 rounded-xl shadow-lg">

                    <h2 className="text-3xl font-bold text-gray-800 mb-8">
                        Admission Inquiry
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* ROW 1 */}
                        <div className="grid md:grid-cols-2 gap-4">

                            <div>
                                <label htmlFor="contact-name" className="block text-gray-700 mb-2">
                                    Student Name
                                </label>
                                <input
                                    id="contact-name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    required
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-[#7a1c1c] focus:ring-2 focus:ring-[#7a1c1c]/20"
                                />
                            </div>

                            <div>
                                <label htmlFor="contact-email" className="block text-gray-700 mb-2">
                                    Email ID
                                </label>
                                <input
                                    id="contact-email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    required
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-[#7a1c1c] focus:ring-2 focus:ring-[#7a1c1c]/20"
                                />
                            </div>

                        </div>

                        {/* ROW 2 */}
                        <div className="grid md:grid-cols-2 gap-4">

                            <div>
                                <label htmlFor="contact-phone" className="block text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    id="contact-phone"
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    required
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-[#7a1c1c] focus:ring-2 focus:ring-[#7a1c1c]/20"
                                />
                            </div>

                            <div>
                                <label htmlFor="contact-course" className="block text-gray-700 mb-2">
                                    Class
                                </label>
                                <select
                                    id="contact-course"
                                    name="course"
                                    value={formData.course}
                                    required
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-[#7a1c1c] focus:ring-2 focus:ring-[#7a1c1c]/20"
                                >
                                    <option value="">Select Class</option>
                                    <option value="11th">11th</option>
                                    <option value="12th">12th</option>
                                </select>
                            </div>

                        </div>

                        {/* ROW 3 */}
                        <div>
                            <label htmlFor="contact-department" className="block text-gray-700 mb-2">
                                Department
                            </label>
                            <select
                                id="contact-department"
                                name="department"
                                value={formData.department}
                                required
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-[#7a1c1c] focus:ring-2 focus:ring-[#7a1c1c]/20"
                            >
                                <option value="">Select Department</option>
                                <option value="Science">Science</option>
                                <option value="Commerce">Commerce</option>
                                <option value="Arts">Arts</option>
                            </select>
                        </div>

                        {/* MESSAGE */}
                        <div>
                            <label htmlFor="contact-message" className="block text-gray-700 mb-2">
                                Message
                            </label>
                            <textarea
                                id="contact-message"
                                name="message"
                                rows="4"
                                value={formData.message}
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-[#7a1c1c] focus:ring-2 focus:ring-[#7a1c1c]/20 resize-none"
                            />
                        </div>

                        {/* TERMS CHECKBOX */}
                        <div className="flex items-center gap-2">
                            <input
                                id="contact-agree"
                                type="checkbox"
                                name="agree"
                                checked={formData.agree}
                                onChange={handleChange}
                                className="accent-[#7a1c1c]"
                            />
                            <label htmlFor="contact-agree" className="text-sm text-gray-600 cursor-pointer">
                                I agree to the terms and conditions.
                            </label>
                        </div>

                        {/* SUBMIT */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#7a1c1c] text-white py-3 rounded-lg hover:bg-[#9f2a2a] transition font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Submitting..." : "Submit Inquiry"}
                        </button>

                    </form>

                </div>

                {/* ================= CONTACT DETAILS ================= */}
                <div className="bg-white p-10 rounded-xl shadow-lg">

                    <h2 className="text-3xl font-bold text-gray-800 mb-8">
                        Office Contact
                    </h2>

                    <p className="text-gray-600 mb-6">
                        For admission and general inquiries, please contact our office staff.
                    </p>

                    <div className="space-y-6">

                        <div>
                            <h3 className="font-semibold text-[#7a1c1c]">
                                Abhay Patil
                            </h3>
                            <p className="text-gray-600">Phone: +91 9876543210</p>
                            <p className="text-gray-600">Email: abhay@snkcollege.com</p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-[#7a1c1c]">
                                Deepa Surve
                            </h3>
                            <p className="text-gray-600">Phone: +91 9876543211</p>
                            <p className="text-gray-600">Email: deepa@snkcollege.com</p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-[#7a1c1c]">
                                Uttam Divekar
                            </h3>
                            <p className="text-gray-600">Phone: +91 9876543212</p>
                            <p className="text-gray-600">Email: uttam@snkcollege.com</p>
                        </div>

                        {/* COLLEGE LOCATION */}
                        <div className="pt-6 border-t">

                            <h3 className="font-semibold text-[#7a1c1c] mb-2">
                                College Address
                            </h3>

                            <p className="text-gray-600 leading-relaxed">
                                Shri Nanasaheb Kulkarni Kanishta Mahavidyalay
                            </p>

                            <p className="text-gray-600">
                                Borli Panchatan, Near Government Hospital
                            </p>

                            <p className="text-gray-600">
                                Shrivardhan, Raigad
                            </p>

                            <p className="text-gray-600">
                                Maharashtra – 402403
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </section>
    );
}