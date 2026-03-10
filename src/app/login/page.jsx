"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaCheckCircle, FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginPage() {
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Login failed");
                return;
            }

            localStorage.setItem("authToken", data.idToken);
            localStorage.setItem("user", JSON.stringify(data.user));

            router.push("/admin/events");
        } catch (err) {
            setError(err.message || "Login error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="flex items-center justify-center bg-gray-100 px-4 md:px-6 py-10">
            <div className="max-w-7xl w-full grid md:grid-cols-2 gap-12 items-center">
                {/* LEFT SIDE INFORMATION - HIDDEN ON MOBILE */}
                <div className="hidden md:block text-justify">
                    <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                        Welcome to <br />
                        <span className="text-[#7a1c1c] block">SNK Junior College</span>
                        {" "}
                        Borli Panchatan
                    </h1>

                    <p className="mt-6 text-gray-600 text-lg leading-relaxed">
                        Shri Nanasaheb Kulkarni Kanishta Mahavidyalay, Borli Panchatan is
                        committed to providing quality education and building a strong
                        academic foundation for students. Our institution focuses on
                        academic excellence, discipline, and holistic development.
                    </p>

                    <div className="mt-8 space-y-5">
                        <div className="flex items-start gap-3 text-gray-700">
                            <FaCheckCircle className="text-[#7a1c1c] mt-1" />
                            <p>Secure login access for students, teachers, and administration.</p>
                        </div>

                        <div className="flex items-start gap-3 text-gray-700">
                            <FaCheckCircle className="text-[#7a1c1c] mt-1" />
                            <p>Access academic records, announcements, and institutional updates.</p>
                        </div>

                        <div className="flex items-start gap-3 text-gray-700">
                            <FaCheckCircle className="text-[#7a1c1c] mt-1" />
                            <p>
                                Centralized platform for managing events, admissions, and student
                                information.
                            </p>
                        </div>

                            <div className="flex items-start gap-3 text-gray-700">
                                <FaCheckCircle className="text-[#7a1c1c] mt-1" />
                                <p>Promoting knowledge, discipline, and excellence in education.</p>
                            </div>
                    </div>
                </div>

                {/* RIGHT SIDE LOGIN FORM */}
                <div className="bg-white shadow-xl border border-gray-200 rounded-2xl p-8 md:p-10 max-w-md w-full mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 text-center">Login</h2>

                    <p className="text-center text-gray-500 mt-2 mb-8">
                        Enter your login credentials
                    </p>

                    {error && (
                        <div className="mb-6 p-3 text-sm bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block font-medium text-gray-700 mb-2">
                                Email Address
                            </label>

                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:border-[#7a1c1c] focus:ring-2 focus:ring-[#7a1c1c] outline-none"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block font-medium text-gray-700 mb-2">
                                Password
                            </label>

                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-lg focus:border-[#7a1c1c] focus:ring-2 focus:ring-[#7a1c1c] outline-none"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div className="text-right">
                            <Link href="/forgot-password" className="text-sm text-[#7a1c1c] hover:underline">
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-[#7a1c1c] text-white font-semibold rounded-lg hover:bg-[#9f2a2a] transition"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <p className="text-center text-gray-600 mt-6">
                        Don't have an account?{" "}
                        <Link href="/signup" className="text-[#7a1c1c] font-semibold hover:underline">
                            Signup
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    );
}
