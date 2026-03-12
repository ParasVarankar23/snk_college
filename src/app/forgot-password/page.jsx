"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaCheckCircle, FaEye, FaEyeSlash } from "react-icons/fa";

const featurePoints = [
    "Secure OTP verification sent directly to your registered email address.",
    "Reset your password safely with protected verification flow.",
    "Quick access recovery for students, teachers, and administration.",
    "Stay connected with your academic portal without losing access.",
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
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" },
    },
};

export default function ForgotPassword() {
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
    };

    const sendOTP = async () => {
        setError("");
        setMessage("");

        if (!formData.email.trim()) {
            const errorMessage = "Please enter your email";
            setError(errorMessage);
            toast.error(errorMessage);
            return;
        }

        try {
            setLoading(true);

            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "send-otp",
                    email: formData.email.trim().toLowerCase(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.error || "Failed to send OTP/reset code";
                setError(errorMessage);
                toast.error(errorMessage);
                return;
            }

            const successMessage = data.message || "OTP/reset code sent to your email";
            setMessage(successMessage);
            toast.success(successMessage);
            setStep(2);
        } catch {
            const errorMessage = "Network error. Please try again.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async () => {
        setError("");
        setMessage("");

        if (!formData.otp.trim()) {
            const errorMessage = "Please enter the 6-digit OTP sent to your email";
            setError(errorMessage);
            toast.error(errorMessage);
            return;
        }

        if (!formData.newPassword || !formData.confirmPassword) {
            const errorMessage = "Please fill new password and confirm password";
            setError(errorMessage);
            toast.error(errorMessage);
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            const errorMessage = "Passwords do not match";
            setError(errorMessage);
            toast.error(errorMessage);
            return;
        }

        try {
            setLoading(true);

            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "reset-password",
                    email: formData.email.trim().toLowerCase(),
                    otp: formData.otp.trim(),
                    newPassword: formData.newPassword,
                    confirmPassword: formData.confirmPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.error || "Failed to reset password";
                setError(errorMessage);
                toast.error(errorMessage);
                return;
            }

            const successMessage = data.message || "Password reset successful";
            setMessage(successMessage);
            toast.success(successMessage);

            setTimeout(() => {
                router.push("/login");
            }, 1200);
        } catch {
            const errorMessage = "Network error. Please try again.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
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

            <div className="relative mx-auto grid min-h-[calc(100svh-7rem)] max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 md:py-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:px-8">
                {/* LEFT CONTENT */}
                <motion.div
                    className="order-2 text-left md:order-1"
                    variants={introVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants}>
                        <div className="mb-4 inline-flex items-center rounded-full border border-[#7a1c1c]/15 bg-[#7a1c1c]/5 px-4 py-2 text-sm font-medium text-[#7a1c1c]">
                            Account Recovery Portal
                        </div>
                    </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        className="max-w-2xl text-2xl font-bold leading-tight text-slate-950 sm:text-3xl xl:text-4xl"
                    >
                        Reset Access to{" "}
                        <span className="text-[#7a1c1c]">SNK Juinor College</span>
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="mt-5 max-w-2xl text-justify text-base leading-8 text-slate-600 md:text-lg"
                    >
                        Recover your college account securely through email verification.
                        Use the OTP sent to your registered email address to create a new
                        password and regain access to admissions, academic updates, events,
                        and institutional services.
                    </motion.p>

                    <motion.div
                        variants={itemVariants}
                        className="mt-7 grid gap-4 sm:grid-cols-2"
                    >
                        {featurePoints.map((point) => (
                            <motion.div
                                key={point}
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

                {/* RIGHT FORM CARD */}
                <motion.div
                    initial={{ opacity: 0, x: 50, y: 18 }}
                    animate={{
                        opacity: 1,
                        x: 0,
                        y: [0, -6, 0],
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
                        {/* Glow */}
                        <div className="absolute inset-0 rounded-[30px] bg-[#7a1c1c]/10 blur-2xl"></div>

                        <div className="relative rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_22px_70px_rgba(15,23,42,0.12)] backdrop-blur md:p-8">
                            <div className="text-center">
                                <motion.h2
                                    initial={{ opacity: 0, y: -12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                    className="text-3xl font-bold text-slate-950"
                                >
                                    Forgot Password
                                </motion.h2>

                                <p className="mt-2 text-sm text-slate-500 md:text-base">
                                    Reset your account password securely
                                </p>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
                                >
                                    {message}
                                </motion.div>
                            )}

                            {/* STEP 1 */}
                            {step === 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25, duration: 0.4 }}
                                    className="mt-6 space-y-5"
                                >
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="mb-2 block font-medium text-slate-700"
                                        >
                                            Email Address
                                        </label>

                                        <motion.input
                                            whileFocus={{ scale: 1.01 }}
                                            id="email"
                                            type="email"
                                            name="email"
                                            placeholder="Enter your registered email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 focus:border-[#7a1c1c] focus:ring-4 focus:ring-[#7a1c1c]/10"
                                        />
                                    </div>

                                    <motion.button
                                        whileHover={{ y: -2, scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={sendOTP}
                                        disabled={loading}
                                        className="h-12 w-full rounded-xl bg-[#7a1c1c] font-semibold text-white shadow-lg shadow-[#7a1c1c]/20 transition duration-200 hover:bg-[#9f2a2a] disabled:opacity-70"
                                    >
                                        {loading ? "Sending..." : "Send OTP"}
                                    </motion.button>
                                </motion.div>
                            )}

                            {/* STEP 2 */}
                            {step === 2 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.4 }}
                                    className="mt-6 space-y-5"
                                >
                                    <div>
                                        <label
                                            htmlFor="otp"
                                            className="mb-2 block font-medium text-slate-700"
                                        >
                                            Enter 6-Digit OTP
                                        </label>

                                        <motion.input
                                            whileFocus={{ scale: 1.01 }}
                                            id="otp"
                                            type="text"
                                            name="otp"
                                            placeholder="Enter the 6-digit OTP from your email"
                                            value={formData.otp}
                                            onChange={handleChange}
                                            maxLength={6}
                                            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 focus:border-[#7a1c1c] focus:ring-4 focus:ring-[#7a1c1c]/10"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="newPassword"
                                            className="mb-2 block font-medium text-slate-700"
                                        >
                                            New Password
                                        </label>

                                        <div className="relative">
                                            <motion.input
                                                whileFocus={{ scale: 1.01 }}
                                                id="newPassword"
                                                type={showPassword ? "text" : "password"}
                                                name="newPassword"
                                                placeholder="Enter new password"
                                                value={formData.newPassword}
                                                onChange={handleChange}
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
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="confirmPassword"
                                            className="mb-2 block font-medium text-slate-700"
                                        >
                                            Confirm Password
                                        </label>

                                        <div className="relative">
                                            <motion.input
                                                whileFocus={{ scale: 1.01 }}
                                                id="confirmPassword"
                                                type={showConfirm ? "text" : "password"}
                                                name="confirmPassword"
                                                placeholder="Confirm password"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 focus:border-[#7a1c1c] focus:ring-4 focus:ring-[#7a1c1c]/10"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => setShowConfirm(!showConfirm)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-[#7a1c1c]"
                                            >
                                                {showConfirm ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ y: -2, scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={resetPassword}
                                        disabled={loading}
                                        className="h-12 w-full rounded-xl bg-[#7a1c1c] font-semibold text-white shadow-lg shadow-[#7a1c1c]/20 transition duration-200 hover:bg-[#9f2a2a] disabled:opacity-70"
                                    >
                                        {loading ? "Resetting..." : "Reset Password"}
                                    </motion.button>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}