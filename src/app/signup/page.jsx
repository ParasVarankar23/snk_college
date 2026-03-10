"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [generatedPassword, setGeneratedPassword] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
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
        setSuccess("");
        setGeneratedPassword("");

        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Signup failed");
                return;
            }

            setSuccess("Account created successfully! Check your email for login credentials.");
            setGeneratedPassword(data.generatedPassword);
            setFormData({ name: "", email: "" });

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err) {
            setError(err.message || "An error occurred during signup");
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
                        alt="College Signup"
                        fill
                        className="object-cover"
                    />
                </div>

                {/* RIGHT SIDE FORM */}
                <div className="p-10">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        Create Account
                    </h2>

                    <p className="text-gray-500 mb-8">
                        Sign up to access your college account
                    </p>

                    {/* SUCCESS MESSAGE */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                            {success}
                            {generatedPassword && (
                                <p className="mt-2 font-mono font-bold">
                                    Generated Password: {generatedPassword}
                                </p>
                            )}
                        </div>
                    )}

                    {/* ERROR MESSAGE */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* NAME */}
                        <div>
                            <label className="block text-gray-700 mb-2 font-medium">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-[#7a1c1c] disabled:bg-gray-100"
                            />
                        </div>

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

                        <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                            ℹ️ Your password will be generated and sent to your email.
                        </p>

                        {/* SIGNUP BUTTON */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#7a1c1c] text-white py-3 rounded-lg hover:bg-[#9f2a2a] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Creating Account..." : "Sign Up"}
                        </button>

                    </form>

                    {/* LOGIN LINK */}
                    <p className="text-center text-gray-600 mt-6">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-[#7a1c1c] hover:underline font-medium"
                        >
                            Login here
                        </Link>
                    </p>

                </div>

            </div>
        </section>
    );
}
