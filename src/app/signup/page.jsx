"use client";

import { getFirebaseAuth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaCheckCircle } from "react-icons/fa";

export default function SignupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
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

    const normalizeRole = (role) => String(role || "").trim().toLowerCase();

    const redirectToDashboard = (role) => {
        const normalizedRole = normalizeRole(role) || "student";
        const targetPath = normalizedRole === "admin" ? "/admin/events" : "/user/admission";
        globalThis.location.replace(targetPath);
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
                const errorMessage = data.error || "Signup failed";
                setError(errorMessage);
                toast.error(errorMessage);
                return;
            }

            setSuccess("Account created successfully! Check your email for login credentials.");
            setGeneratedPassword(data.generatedPassword);
            toast.success("Account created successfully");
            setFormData({ name: "", email: "" });

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err) {
            const errorMessage = err.message || "An error occurred during signup";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setGoogleLoading(true);
        setError("");
        setSuccess("");

        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: "select_account" });
            const auth = getFirebaseAuth();

            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();

            const response = await fetch("/api/auth/google-login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    idToken,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.error || "Google signup failed";
                setError(errorMessage);
                toast.error(errorMessage);
                return;
            }

            localStorage.setItem("authToken", data.authToken);
            globalThis.dispatchEvent(new Event("auth-changed"));
            toast.success("Google signup/login successful");
            redirectToDashboard(data?.user?.role);
        } catch (err) {
            const errorMessage = err.message || "Google signup failed";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <section className="flex items-center justify-center bg-gray-100 px-4 md:px-6 py-10">
            <div className="max-w-7xl w-full grid md:grid-cols-2 gap-12 items-center">
                {/* LEFT SIDE INFORMATION - HIDDEN ON MOBILE */}
                <div className="hidden md:block">
                    <div className="relative h-107.5 w-full rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                        <Image
                            src="/college/college.jpg"
                            alt="College Signup"
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

                        <div className="absolute top-25 left-5 p-8 text-white">
                            <h1 className="text-4xl font-bold leading-tight">
                                Join SNK Junior College
                            </h1>
                            <p className="mt-3 text-sm md:text-base text-white max-w-lg">
                                Start your academic journey with a secure account and stay connected
                                with announcements, updates, and activities.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 space-y-5">
                        <div className="flex items-start gap-3 text-gray-700">
                            <FaCheckCircle className="text-[#7a1c1c] mt-1" />
                            <p>Quick account creation for students and staff members.</p>
                        </div>

                        <div className="flex items-start gap-3 text-gray-700">
                            <FaCheckCircle className="text-[#7a1c1c] mt-1" />
                            <p>Auto-generated credentials sent securely to your email address.</p>
                        </div>

                        <div className="flex items-start gap-3 text-gray-700">
                            <FaCheckCircle className="text-[#7a1c1c] mt-1" />
                            <p>Access academics, events, facilities, and college updates in one place.</p>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE FORM */}
                <div className="bg-white shadow-xl border border-gray-200 rounded-2xl p-8 md:p-10 max-w-md w-full mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 text-center">Create Account</h2>

                    <p className="text-center text-gray-500 mt-2 mb-8">
                        Sign up to access your college account
                    </p>

                    {/* SUCCESS MESSAGE */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                            <p>{success}</p>
                            {generatedPassword && (
                                <p className="mt-2 font-mono font-semibold break-all">
                                    Generated Password: {generatedPassword}
                                </p>
                            )}
                        </div>
                    )}

                    {/* ERROR MESSAGE */}
                    {error && (
                        <div className="mb-6 p-3 text-sm bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                disabled={loading || googleLoading}
                                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:border-[#7a1c1c] focus:ring-2 focus:ring-[#7a1c1c] outline-none disabled:bg-gray-100"
                            />
                        </div>

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
                                disabled={loading || googleLoading}
                                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:border-[#7a1c1c] focus:ring-2 focus:ring-[#7a1c1c] outline-none disabled:bg-gray-100"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || googleLoading}
                            className="w-full h-12 bg-[#7a1c1c] text-white font-semibold rounded-lg hover:bg-[#9f2a2a] transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Creating Account..." : "Sign Up"}
                        </button>

                        <button
                            type="button"
                            onClick={handleGoogleSignup}
                            disabled={loading || googleLoading}
                            className="w-full h-12 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {googleLoading ? "Signing up with Google..." : "Continue with Google"}
                        </button>
                    </form>

                    <p className="text-center text-gray-600 mt-6">
                        Already have an account?{" "}
                        <Link href="/login" className="text-[#7a1c1c] font-semibold hover:underline">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    );
}
