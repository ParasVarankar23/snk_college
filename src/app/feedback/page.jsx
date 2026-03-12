"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

export default function FeedbackPage() {
    const [name, setName] = useState("");
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image file");
            return;
        }
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const removeImage = () => {
        setImageFile(null);
        setPreview("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) { toast.error("Please enter your name"); return; }
        if (rating === 0) { toast.error("Please select a rating"); return; }
        if (!description.trim()) { toast.error("Please write your feedback"); return; }

        try {
            setIsSubmitting(true);
            const payload = new FormData();
            payload.append("name", name.trim());
            payload.append("rating", String(rating));
            payload.append("description", description.trim());
            if (imageFile) payload.append("image", imageFile);

            const res = await fetch("/api/feedback", { method: "POST", body: payload });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to submit feedback");

            toast.success("Thank you for your feedback!");
            setSubmitted(true);
        } catch (error) {
            toast.error(error.message || "Failed to submit feedback");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-[#7a1c1c]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-[#7a1c1c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Feedback Submitted!</h2>
                    <p className="text-gray-500 mb-6">Thank you for sharing your experience with SNK Junior College.</p>
                    <button
                        onClick={() => {
                            setSubmitted(false);
                            setName(""); setRating(0); setDescription("");
                            setImageFile(null); setPreview("");
                        }}
                        className="px-6 py-2.5 rounded-lg bg-[#7a1c1c] text-white font-semibold hover:bg-[#9f2a2a] transition"
                    >
                        Submit Another
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-xl mx-auto">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Share Your Feedback</h1>
                    <p className="text-gray-500 mt-2">
                        Let us know about your experience at SNK Junior College
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-8 space-y-6">

                    {/* Image Upload */}
                    <div>
                        <p className="block text-sm font-semibold text-gray-700 mb-2">
                            Your Photo <span className="text-gray-400 font-normal">(optional)</span>
                        </p>
                        <div className="flex items-center gap-4">
                            {preview ? (
                                <div className="relative">
                                    <Image
                                        src={preview}
                                        alt="Preview"
                                        width={80}
                                        height={80}
                                        style={{ width: "80px", height: "80px" }}
                                        className="rounded-full object-cover border-2 border-[#7a1c1c]/30"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-rose-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                                    <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            )}
                            <div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="feedback-image"
                                    onChange={handleImageChange}
                                />
                                <label
                                    htmlFor="feedback-image"
                                    className="cursor-pointer px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition"
                                >
                                    {preview ? "Change Photo" : "Upload Photo"}
                                </label>
                                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP up to 5MB</p>
                            </div>
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            className="w-full h-11 px-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]/30 focus:border-[#7a1c1c] transition text-sm"
                            maxLength={80}
                        />
                    </div>

                    {/* Star Rating */}
                    <div>
                        <p className="block text-sm font-semibold text-gray-700 mb-2">
                            Rating <span className="text-rose-500">*</span>
                        </p>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHovered(star)}
                                    onMouseLeave={() => setHovered(0)}
                                    className="text-3xl transition-transform hover:scale-110"
                                >
                                    <span className={(hovered || rating) >= star ? "text-yellow-400" : "text-gray-300"}>
                                        ★
                                    </span>
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
                            </p>
                        )}
                    </div>


                    {/* Description */}
                    <div>
                        <label htmlFor="feedback-description" className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Your Feedback <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            id="feedback-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Share your experience at SNK Junior College..."
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]/30 focus:border-[#7a1c1c] transition text-sm resize-none"
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-400 text-right mt-1">{description.length}/500</p>
                    </div>

                    {/* Submit */}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full h-11 rounded-lg bg-[#7a1c1c] text-white font-semibold hover:bg-[#9f2a2a] transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Submitting..." : "Submit Feedback"}
                    </button>

                </div>
            </div>
        </div>
    );
}
