"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

/* eslint-disable react/prop-types */

const initialFormData = { name: "", rating: 5, description: "" };
const PAGE_SIZE = 10;

export default function AdminFeedbackPage() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    const [formData, setFormData] = useState(initialFormData);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState("");

    const filteredFeedbacks = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();
        if (!search) return feedbacks;
        return feedbacks.filter((fb) =>
            [fb.name, fb.description].join(" ").toLowerCase().includes(search)
        );
    }, [feedbacks, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredFeedbacks.length / PAGE_SIZE));

    const paginatedFeedbacks = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredFeedbacks.slice(start, start + PAGE_SIZE);
    }, [filteredFeedbacks, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const avgRating = useMemo(() => {
        if (!feedbacks.length) return "0.0";
        return (feedbacks.reduce((sum, fb) => sum + (fb.rating || 0), 0) / feedbacks.length).toFixed(1);
    }, [feedbacks]);

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/feedback", { cache: "no-store" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to fetch feedback");
            setFeedbacks(data.feedbacks || []);
        } catch (error) {
            toast.error(error.message || "Failed to load feedback");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchFeedbacks(); }, []);

    const openEditModal = (fb) => {
        setSelectedFeedback(fb);
        setFormData({ name: fb.name || "", rating: fb.rating || 5, description: fb.description || "" });
        setImageFile(null);
        setPreview(fb.imageUrl || "");
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setSelectedFeedback(null);
        setFormData(initialFormData);
        setImageFile(null);
        setPreview("");
        setIsEditModalOpen(false);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFeedback?.id) return;

        try {
            setIsSubmitting(true);
            const payload = new FormData();
            payload.append("id", selectedFeedback.id);
            payload.append("name", formData.name.trim());
            payload.append("rating", String(formData.rating));
            payload.append("description", formData.description.trim());
            if (imageFile) payload.append("image", imageFile);

            const res = await fetch("/api/feedback", { method: "PUT", body: payload });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update feedback");

            toast.success("Feedback updated successfully");
            closeEditModal();
            fetchFeedbacks();
        } catch (error) {
            toast.error(error.message || "Failed to update feedback");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedFeedback?.id) return;
        try {
            setIsSubmitting(true);
            const res = await fetch(`/api/feedback?id=${encodeURIComponent(selectedFeedback.id)}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to delete feedback");

            toast.success("Feedback deleted successfully");
            setIsDeleteModalOpen(false);
            setSelectedFeedback(null);
            fetchFeedbacks();
        } catch (error) {
            toast.error(error.message || "Failed to delete feedback");
        } finally {
            setIsSubmitting(false);
        }
    };

    let tableContent = null;
    if (loading) {
        tableContent = (
            <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">Loading feedback...</td>
            </tr>
        );
    } else if (filteredFeedbacks.length === 0) {
        tableContent = (
            <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">No feedback found</td>
            </tr>
        );
    } else {
        tableContent = paginatedFeedbacks.map((fb) => (
            <tr key={fb.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                    {fb.imageUrl ? (
                        <img
                            src={fb.imageUrl}
                            alt={fb.name}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-[#7a1c1c]/10 flex items-center justify-center text-[#7a1c1c] font-semibold text-sm">
                            {fb.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                    )}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{fb.name}</td>
                <td className="px-4 py-3">
                    <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <span key={s} className={s <= fb.rating ? "text-yellow-400" : "text-gray-200"}>★</span>
                        ))}
                    </div>
                </td>
                <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{fb.description}</td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : "-"}
                </td>
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => openEditModal(fb)}
                            className="px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => { setSelectedFeedback(fb); setIsDeleteModalOpen(true); }}
                            className="px-3 py-1.5 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold"
                        >
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        ));
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Feedback Management</h1>
                        <p className="text-gray-600 mt-1">View, edit, and manage all student feedback</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard label="Total Feedback" value={String(feedbacks.length)} />
                    <StatCard label="Average Rating" value={feedbacks.length ? `${avgRating} / 5` : "—"} />
                    <StatCard label="5-Star Reviews" value={String(feedbacks.filter((fb) => fb.rating === 5).length)} />
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <h2 className="text-lg font-semibold text-gray-900">All Feedback</h2>
                        <div className="relative w-full md:max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search name or feedback..."
                                className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]/30"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold">Photo</th>
                                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                                    <th className="px-4 py-3 text-left font-semibold">Rating</th>
                                    <th className="px-4 py-3 text-left font-semibold">Feedback</th>
                                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>{tableContent}</tbody>
                        </table>
                    </div>

                    {!loading && filteredFeedbacks.length > 0 && (
                        <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-gray-500">Page {currentPage} of {totalPages}</p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <FeedbackModal
                    formData={formData}
                    preview={preview}
                    isSubmitting={isSubmitting}
                    onClose={closeEditModal}
                    onChange={(e) => {
                        const { name, value } = e.target;
                        setFormData((prev) => ({ ...prev, [name]: name === "rating" ? Number.parseInt(value, 10) : value }));
                    }}
                    onImageChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (!file.type.startsWith("image/")) { toast.error("Please select a valid image file"); return; }
                        setImageFile(file);
                        setPreview(URL.createObjectURL(file));
                    }}
                    onRatingChange={(r) => setFormData((prev) => ({ ...prev, rating: r }))}
                    onSubmit={handleEditSubmit}
                />
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Delete Feedback</h3>
                        </div>
                        <div className="p-5 space-y-4">
                            <p className="text-sm text-gray-700">
                                Are you sure you want to permanently delete feedback from{" "}
                                <span className="font-semibold">{selectedFeedback?.name || "this user"}</span>?
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => { setIsDeleteModalOpen(false); setSelectedFeedback(null); }}
                                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 disabled:opacity-60"
                                >
                                    {isSubmitting ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
    );
}

function FeedbackModal({ formData, preview, isSubmitting, onClose, onChange, onImageChange, onRatingChange, onSubmit }) {
    const [hovered, setHovered] = useState(0);
    const fileInputRef = useRef(null);

    return (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Edit Feedback</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl leading-none" aria-label="Close">×</button>
                </div>

                <form onSubmit={onSubmit} className="p-5 space-y-5">
                    {/* Image */}
                    <div className="flex items-center gap-4">
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" id="edit-feedback-image" onChange={onImageChange} />
                        <label htmlFor="edit-feedback-image" className="cursor-pointer">
                            {preview ? (
                                <Image
                                    src={preview}
                                    alt="Preview"
                                    width={64}
                                    height={64}
                                    style={{ width: "64px", height: "64px" }}
                                    className="rounded-full object-cover border-2 border-[#7a1c1c]/30"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-500 text-center">
                                    Photo
                                </div>
                            )}
                        </label>
                        <label
                            htmlFor="edit-feedback-image"
                            className="cursor-pointer px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition"
                        >
                            {preview ? "Change Photo" : "Upload Photo"}
                        </label>
                    </div>

                    {/* Name */}
                    <div>
                        <label htmlFor="edit-name" className="block text-sm font-semibold text-gray-700 mb-1.5">Name</label>
                        <input
                            id="edit-name"
                            name="name"
                            value={formData.name}
                            onChange={onChange}
                            className="w-full h-11 px-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]/30 text-sm"
                            required
                        />
                    </div>

                    {/* Rating */}
                    <div>
                        <p className="block text-sm font-semibold text-gray-700 mb-2">Rating</p>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => onRatingChange(star)}
                                    onMouseEnter={() => setHovered(star)}
                                    onMouseLeave={() => setHovered(0)}
                                    className="text-2xl transition-transform hover:scale-110"
                                >
                                    <span className={(hovered || formData.rating) >= star ? "text-yellow-400" : "text-gray-300"}>
                                        ★
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="edit-description" className="block text-sm font-semibold text-gray-700 mb-1.5">Feedback</label>
                        <textarea
                            id="edit-description"
                            name="description"
                            value={formData.description}
                            onChange={onChange}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]/30 text-sm resize-none"
                            required
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end pt-1">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2 rounded-lg bg-[#7a1c1c] text-white font-semibold hover:bg-[#9f2a2a] transition disabled:opacity-60 text-sm"
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
