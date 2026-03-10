"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

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

            // Store auth token
            localStorage.setItem("authToken", data.idToken);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Redirect to admin events dashboard
            router.push("/admin/events");
        } catch (err) {
            setError(err.message || "An error occurred during login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="min-h-screen flex items-center justify-center bg-gray-100">

            <div className="max-w-6xl w-full bg-white shadow-lg rounded-xl grid md:grid-cols-2 overflow-hidden">

                {/* LEFT SIDE IMAGE */}
                <div className="hidden md:block relative">

                    <Image
                        src="/college/college.jpg"
                        alt="College Login"
                        fill
                        className="object-cover"
                    />

                </div>

                {/* RIGHT SIDE FORM */}
                <div className="p-10">

                    <h2 className="text-3xl font-bold text-gray-800 mb-6">
                        Login
                    </h2>

                    <p className="text-gray-500 mb-8">
                        Login to access your college account.
                    </p>

                    {/* ERROR MESSAGE */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* EMAIL */}
                        <div>

                            <label className="block text-gray-700 mb-2 font-medium">
                                Email Address
                            </label>

                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-[#7a1c1c] disabled:bg-gray-100"
                            />

                        </div>

                        {/* PASSWORD */}
                        <div>

                            <label className="block text-gray-700 mb-2 font-medium">
                                Password
                            </label>

                            <div className="relative">

                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    className="w-full border border-gray-300 p-3 rounded-lg pr-10 focus:outline-none focus:border-[#7a1c1c] disabled:bg-gray-100"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-500"
                                    disabled={loading}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>

                            </div>

                        </div>

                        {/* FORGOT PASSWORD */}
                        <div className="text-right">

                            <Link
                                href="/forgot-password"
                                className="text-sm text-[#7a1c1c] hover:underline"
                            >
                                Forgot Password?
                            </Link>

                        </div>

                        {/* LOGIN BUTTON */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#7a1c1c] text-white py-3 rounded-lg hover:bg-[#9f2a2a] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>

                    </form>

                    {/* SIGNUP LINK */}
                    <p className="text-center text-gray-600 mt-6">
                        Don't have an account?{" "}
                        <Link
                            href="/signup"
                            className="text-[#7a1c1c] hover:underline font-medium"
                        >
                            Sign up here
                        </Link>
                    </p>

                </div>

            </div>

        </section>
    );
}