"use client";

import { getFirebaseAuth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaCheckCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const featurePoints = [
    "Secure login access for students, teachers, and administration.",
    "Access academic records, announcements, and institutional updates.",
    "Centralized platform for managing events, admissions, and student information.",
    "Promoting knowledge, discipline, and excellence in education.",
];

const introVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
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

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        loginId: "",
        password: "",
    });

    const normalizeRole = (role) => String(role || "").trim().toLowerCase();

    const redirectToDashboard = (role) => {
        const normalizedRole = normalizeRole(role) || "student";
        let targetPath = "/user/admission";
        if (normalizedRole === "admin") {
            targetPath = "/admin/events";
        } else if (normalizedRole === "teacher") {
            targetPath = "/teacher/students";
        }
        globalThis.location.replace(targetPath);
    };

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
                const errorMessage = data.error || "Login failed";
                setError(errorMessage);
                toast.error(errorMessage);
                return;
            }

            localStorage.setItem("authToken", data.authToken);
            globalThis.dispatchEvent(new Event("auth-changed"));

            toast.success("Login successful");
            redirectToDashboard(data?.user?.role);
        } catch (err) {
            const errorMessage = err.message || "Login error";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        setError("");

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
                const errorMessage = data.error || "Google login failed";
                setError(errorMessage);
                toast.error(errorMessage);
                return;
            }

            localStorage.setItem("authToken", data.authToken);
            globalThis.dispatchEvent(new Event("auth-changed"));
            toast.success("Google login successful");
            redirectToDashboard(data?.user?.role);
        } catch (err) {
            const errorMessage = err.message || "Google login failed";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <section className="relative overflow-hidden bg-stone-100">
            {/* Background Decorative Blurs */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-[#7a1c1c]/10 blur-3xl" />
                <div className="absolute right-0 top-1/4 h-72 w-72 rounded-full bg-[#7a1c1c]/10 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-white/80 blur-3xl" />
            </div>

            <div className="relative mx-auto grid min-h-[calc(100svh-7rem)] max-w-7xl items-start gap-8 px-4 pb-8 pt-3 sm:px-6 sm:pt-4 md:pb-10 md:pt-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:px-8">
                {/* LEFT CONTENT */}
                <motion.div
                    className="order-2 text-left md:order-1"
                    variants={introVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.h1
                        variants={itemVariants}
                        className="max-w-2xl text-2xl font-bold leading-tight text-slate-950 sm:text-3xl xl:text-4xl"
                    >
                        Welcome to{" "}
                        <span className="text-[#7a1c1c]">SNK Juinor College</span>
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="mt-5 max-w-2xl text-justify text-base leading-8 text-slate-600 md:text-lg"
                    >
                        Shri Nanasaheb Kulkarni Juinor College, Borli Panchatan is
                        committed to providing quality education and building a strong
                        academic foundation for students. Our institution focuses on
                        academic excellence, discipline, and holistic development.
                    </motion.p>

                    <motion.div
                        variants={itemVariants}
                        className="mt-7 grid gap-4 sm:grid-cols-2"
                    >
                        {featurePoints.map((point, index) => (
                            <motion.div
                                key={point}
                                variants={itemVariants}
                                whileHover={{ y: -6, scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                                className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/85 p-4 text-slate-700 shadow-sm backdrop-blur"
                            >
                                <FaCheckCircle className="mt-1 shrink-0 text-[#7a1c1c]" />
                                <p className="text-sm text-justify leading-6">{point}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* RIGHT LOGIN CARD */}
                <motion.div
                    initial={{ opacity: 0, x: 60, y: 20 }}
                    animate={{
                        opacity: 1,
                        x: 0,
                        y: [0, -6, 0], // floating effect
                    }}
                    transition={{
                        opacity: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                        x: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                        y: {
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                        },
                    }}
                    className="order-1 w-full md:order-2"
                >
                    <div className="relative mx-auto w-full max-w-md">
                        {/* Glow behind form */}
                        <div className="absolute inset-0 rounded-[30px] bg-[#7a1c1c]/10 blur-2xl"></div>

                        <div className="relative rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_22px_70px_rgba(15,23,42,0.12)] backdrop-blur md:p-8">
                            <div className="text-center">
                                <motion.h2
                                    initial={{ opacity: 0, y: -12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                    className="text-3xl font-bold text-slate-950"
                                >
                                    Login
                                </motion.h2>

                                <p className="mt-2 text-sm text-slate-500 md:text-base">
                                    Enter your login credentials
                                </p>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                                <motion.div
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25, duration: 0.4 }}
                                >
                                    <label
                                        htmlFor="loginId"
                                        className="mb-2 block font-medium text-slate-700"
                                    >
                                        Email / Phone / Application ID
                                    </label>

                                    <motion.input
                                        whileFocus={{ scale: 1.01 }}
                                        id="loginId"
                                        type="text"
                                        name="loginId"
                                        placeholder="Enter email, phone number, or app ID"
                                        value={formData.loginId}
                                        onChange={handleChange}
                                        required
                                        disabled={loading || googleLoading}
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 focus:border-[#7a1c1c] focus:ring-4 focus:ring-[#7a1c1c]/10"
                                    />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.32, duration: 0.4 }}
                                >
                                    <label
                                        htmlFor="password"
                                        className="mb-2 block font-medium text-slate-700"
                                    >
                                        Password
                                    </label>

                                    <div className="relative">
                                        <motion.input
                                            whileFocus={{ scale: 1.01 }}
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="Enter your password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            disabled={loading || googleLoading}
                                            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 focus:border-[#7a1c1c] focus:ring-4 focus:ring-[#7a1c1c]/10"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-[#7a1c1c]"
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.38, duration: 0.4 }}
                                    className="text-right"
                                >
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm font-medium text-[#7a1c1c] transition hover:text-[#9f2a2a] hover:underline"
                                    >
                                        Forgot Password?
                                    </Link>
                                </motion.div>

                                <motion.button
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.45, duration: 0.4 }}
                                    whileHover={{ y: -2, scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading || googleLoading}
                                    className="h-12 w-full rounded-xl bg-[#7a1c1c] font-semibold text-white shadow-lg shadow-[#7a1c1c]/20 transition duration-200 hover:bg-[#9f2a2a] disabled:opacity-70"
                                >
                                    {loading ? "Signing in..." : "Sign In"}
                                </motion.button>

                                <motion.button
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.52, duration: 0.4 }}
                                    whileHover={{ y: -2, scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    disabled={loading || googleLoading}
                                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 transition duration-200 hover:bg-slate-50 disabled:opacity-60"
                                >
                                    <FcGoogle className="text-base" />
                                    {googleLoading
                                        ? "Signing in with Google..."
                                        : "Continue with Google"}
                                </motion.button>

                                <motion.p
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.58, duration: 0.4 }}
                                    className="pt-1 text-center text-sm text-slate-600 md:text-base"
                                >
                                    Don't have an account?{" "}
                                    <Link
                                        href="/signup"
                                        className="font-semibold text-[#7a1c1c] transition hover:text-[#9f2a2a] hover:underline"
                                    >
                                        Signup
                                    </Link>
                                </motion.p>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}