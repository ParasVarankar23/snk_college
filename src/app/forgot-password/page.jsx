"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";

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
        confirmPassword: ""
    });

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });

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

        <section className="flex items-center justify-center bg-gray-100 px-4 py-22">

            <div className="bg-white shadow-xl border border-gray-200 rounded-2xl p-10 max-w-md w-full">

                <h2 className="text-3xl font-bold text-center text-gray-900">
                    Forgot Password
                </h2>

                <p className="text-center text-gray-500 mt-2 mb-8">
                    Reset your account password
                </p>

                {error && (
                    <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {message}
                    </div>
                )}


                {/* STEP 1 EMAIL */}

                {step === 1 && (

                    <div className="space-y-6">

                        <div>

                            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                                Email Address
                            </label>

                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Enter your registered email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full h-12 px-4 border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-[#7a1c1c] focus:border-[#7a1c1c]"
                            />

                        </div>

                        <button
                            onClick={sendOTP}
                            disabled={loading}
                            className="w-full h-12 bg-[#7a1c1c] text-white rounded-lg
              hover:bg-[#9f2a2a] font-medium transition disabled:opacity-60"
                        >
                            {loading ? "Sending..." : "Send OTP"}
                        </button>

                    </div>

                )}


                {/* STEP 2 OTP + NEW PASSWORD */}

                {step === 2 && (

                    <div className="space-y-6">

                        {/* OTP */}

                        <div>

                            <label htmlFor="otp" className="block text-gray-700 font-medium mb-2">
                                Enter 6-Digit OTP
                            </label>

                            <input
                                id="otp"
                                type="text"
                                name="otp"
                                placeholder="Enter the 6-digit OTP from your email"
                                value={formData.otp}
                                onChange={handleChange}
                                maxLength={6}
                                className="w-full h-12 px-4 border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-[#7a1c1c]"
                            />

                        </div>


                        {/* NEW PASSWORD */}

                        <div>

                            <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-2">
                                New Password
                            </label>

                            <div className="relative">

                                <input
                                    id="newPassword"
                                    type={showPassword ? "text" : "password"}
                                    name="newPassword"
                                    placeholder="Enter new password"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-[#7a1c1c]"
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


                        {/* CONFIRM PASSWORD */}

                        <div>

                            <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                                Confirm Password
                            </label>

                            <div className="relative">

                                <input
                                    id="confirmPassword"
                                    type={showConfirm ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Confirm password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-[#7a1c1c]"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                                >
                                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                                </button>

                            </div>

                        </div>


                        {/* RESET BUTTON */}

                        <button
                            onClick={resetPassword}
                            disabled={loading}
                            className="w-full h-12 bg-[#7a1c1c] text-white rounded-lg
              hover:bg-[#9f2a2a] font-medium transition disabled:opacity-60"
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>

                    </div>

                )}

            </div>

        </section>

    );
}