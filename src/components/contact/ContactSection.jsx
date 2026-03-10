"use client";

import { useState } from "react";

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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.agree) {
            alert("Please agree to the terms.");
            return;
        }

        console.log(formData);

        alert("Inquiry Submitted Successfully!");
    };

    return (
        <section className="bg-gray-50 py-20">

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
                                <label className="block text-gray-700 mb-2">
                                    Student Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    required
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:border-[#7a1c1c]"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-2">
                                    Email ID
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    required
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:border-[#7a1c1c]"
                                />
                            </div>

                        </div>

                        {/* ROW 2 */}
                        <div className="grid md:grid-cols-2 gap-4">

                            <div>
                                <label className="block text-gray-700 mb-2">
                                    Phone Number
                                </label>

                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:border-[#7a1c1c]"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-2">
                                    Class
                                </label>

                                <select
                                    name="course"
                                    required
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 p-3 rounded-lg"
                                >
                                    <option value="">Select Class</option>
                                    <option value="11th">11th</option>
                                    <option value="12th">12th</option>
                                </select>
                            </div>

                        </div>

                        {/* ROW 3 */}
                        <div>

                            <label className="block text-gray-700 mb-2">
                                Department
                            </label>

                            <select
                                name="department"
                                required
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-3 rounded-lg"
                            >
                                <option value="">Select Department</option>
                                <option value="Science">Science</option>
                                <option value="Commerce">Commerce</option>
                                <option value="Arts">Arts</option>
                            </select>

                        </div>

                        {/* MESSAGE */}
                        <div>

                            <label className="block text-gray-700 mb-2">
                                Message
                            </label>

                            <textarea
                                name="message"
                                rows="4"
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-3 rounded-lg"
                            ></textarea>

                        </div>

                        {/* TERMS CHECKBOX */}
                        <div className="flex items-center gap-2">

                            <input
                                type="checkbox"
                                name="agree"
                                onChange={handleChange}
                            />

                            <span className="text-sm text-gray-600">
                                I agree to the terms and conditions.
                            </span>

                        </div>

                        {/* SUBMIT */}
                        <button
                            type="submit"
                            className="w-full bg-[#7a1c1c] text-white py-3 rounded-lg hover:bg-[#9f2a2a]"
                        >
                            Submit Inquiry
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