"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

/* eslint-disable react/prop-types */

const categoryOptions = [
    { label: "Academic", value: "academic" },
    { label: "Awards", value: "awards" },
    { label: "Sports", value: "sports" },
];
const PAGE_SIZE = 100;

const initialFormData = {
    title: "",
    description: "",
    category: "academic",
};

export default function AdminAchievementsPage() {
    const [achievements, setAchievements] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAchievement, setSelectedAchievement] = useState(null);

    const [formData, setFormData] = useState(initialFormData);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState("");

    const filteredAchievements = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();
        if (!search) return achievements;

        return achievements.filter((achievement) =>
            [achievement.title, achievement.description, achievement.category]
                .join(" ")
                .toLowerCase()
                .includes(search)
        );
    }, [achievements, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredAchievements.length / PAGE_SIZE));

    const paginatedAchievements = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredAchievements.slice(start, start + PAGE_SIZE);
    }, [filteredAchievements, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const stats = useMemo(() => {
        return achievements.reduce(
            (acc, achievement) => {
                acc[achievement.category] = (acc[achievement.category] || 0) + 1;
                return acc;
            },
            { academic: 0, awards: 0, sports: 0 }
        );
    }, [achievements]);

    let tableContent = null;
    if (loading) {
        tableContent = (
            <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                    Loading achievements...
                </td>
            </tr>
        );
    } else if (filteredAchievements.length === 0) {
        tableContent = (
            <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                    No achievements found
                </td>
            </tr>
        );
    } else {
        tableContent = paginatedAchievements.map((achievement) => (
            <tr key={achievement.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                    <img
                        src={achievement.imageUrl}
                        alt={achievement.title}
                        className="w-14 h-14 rounded-lg object-cover border border-gray-200"
                    />
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{achievement.title}</td>
                <td className="px-4 py-3 text-gray-600 max-w-sm">{achievement.description}</td>
                <td className="px-4 py-3 capitalize">{achievement.category}</td>
                <td className="px-4 py-3 text-gray-500">
                    {achievement.createdAt ? new Date(achievement.createdAt).toLocaleDateString() : "-"}
                </td>
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => openEditModal(achievement)}
                            className="px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => openDeleteModal(achievement)}
                            className="px-3 py-1.5 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold"
                        >
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        ));
    }

    const fetchAchievements = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/achievements", { cache: "no-store" });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch achievements");
            }

            setAchievements(data.achievements || []);
        } catch (error) {
            toast.error(error.message || "Failed to load achievements");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAchievements();
    }, []);

    const resetFormState = () => {
        setFormData(initialFormData);
        setImageFile(null);
        setPreview("");
    };

    const closeAddModal = () => {
        resetFormState();
        setIsAddModalOpen(false);
    };

    const closeEditModal = () => {
        resetFormState();
        setSelectedAchievement(null);
        setIsEditModalOpen(false);
    };

    const openEditModal = (achievement) => {
        setSelectedAchievement(achievement);
        setFormData({
            title: achievement.title || "",
            description: achievement.description || "",
            category: achievement.category || "academic",
        });
        setImageFile(null);
        setPreview(achievement.imageUrl || "");
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (achievement) => {
        setSelectedAchievement(achievement);
        setIsDeleteModalOpen(true);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image file");
            return;
        }

        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const buildFormData = (includeId = false) => {
        const payload = new FormData();
        if (includeId && selectedAchievement?.id) {
            payload.append("id", selectedAchievement.id);
        }

        payload.append("title", formData.title.trim());
        payload.append("description", formData.description.trim());
        payload.append("category", formData.category);

        if (imageFile) {
            payload.append("image", imageFile);
        }

        return payload;
    };

    const handleAddSubmit = async (event) => {
        event.preventDefault();

        if (!imageFile) {
            toast.error("Achievement image is required");
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await fetch("/api/achievements", {
                method: "POST",
                body: buildFormData(),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to add achievement");
            }

            toast.success("Achievement added successfully");
            closeAddModal();
            fetchAchievements();
        } catch (error) {
            toast.error(error.message || "Failed to add achievement");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditSubmit = async (event) => {
        event.preventDefault();

        if (!selectedAchievement?.id) {
            toast.error("Achievement not found");
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await fetch("/api/achievements", {
                method: "PUT",
                body: buildFormData(true),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to update achievement");
            }

            toast.success("Achievement updated successfully");
            closeEditModal();
            fetchAchievements();
        } catch (error) {
            toast.error(error.message || "Failed to update achievement");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedAchievement?.id) {
            toast.error("Achievement not found");
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await fetch(`/api/achievements?id=${encodeURIComponent(selectedAchievement.id)}`, {
                method: "DELETE",
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to delete achievement");
            }

            toast.success("Achievement permanently deleted");
            setIsDeleteModalOpen(false);
            setSelectedAchievement(null);
            fetchAchievements();
        } catch (error) {
            toast.error(error.message || "Failed to delete achievement");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Achievements Management</h1>
                        <p className="text-gray-600 mt-1">Upload achievement images, descriptions, and manage all categories</p>
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="h-11 px-5 rounded-lg bg-[#7a1c1c] text-white font-semibold hover:bg-[#9f2a2a] transition"
                    >
                        Add Achievement
                    </button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Achievements" value={String(achievements.length)} />
                    <StatCard label="Academic" value={String(stats.academic || 0)} />
                    <StatCard label="Awards" value={String(stats.awards || 0)} />
                    <StatCard label="Sports" value={String(stats.sports || 0)} />
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <h2 className="text-lg font-semibold text-gray-900">All Achievements</h2>

                        <div className="relative w-full md:max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search title, description, category..."
                                className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]/30"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold">Image</th>
                                    <th className="px-4 py-3 text-left font-semibold">Title</th>
                                    <th className="px-4 py-3 text-left font-semibold">Description</th>
                                    <th className="px-4 py-3 text-left font-semibold">Category</th>
                                    <th className="px-4 py-3 text-left font-semibold">Added</th>
                                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>{tableContent}</tbody>
                        </table>
                    </div>

                    {!loading && filteredAchievements.length > 0 && (
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

            {isAddModalOpen && (
                <AchievementModal
                    title="Add Achievement"
                    formData={formData}
                    preview={preview}
                    isSubmitting={isSubmitting}
                    submitLabel="Save Achievement"
                    onClose={closeAddModal}
                    onChange={handleInputChange}
                    onImageChange={handleImageChange}
                    onSubmit={handleAddSubmit}
                />
            )}

            {isEditModalOpen && (
                <AchievementModal
                    title="Edit Achievement"
                    formData={formData}
                    preview={preview}
                    isSubmitting={isSubmitting}
                    submitLabel="Update Achievement"
                    onClose={closeEditModal}
                    onChange={handleInputChange}
                    onImageChange={handleImageChange}
                    onSubmit={handleEditSubmit}
                />
            )}

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Permanent Delete</h3>
                        </div>

                        <div className="p-5 space-y-4">
                            <p className="text-sm text-gray-700">
                                Are you sure you want to permanently delete {" "}
                                <span className="font-semibold">{selectedAchievement?.title || "this achievement"}</span>?
                                This will remove the database record and Cloudinary image.
                            </p>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => {
                                        setIsDeleteModalOpen(false);
                                        setSelectedAchievement(null);
                                    }}
                                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 disabled:opacity-60"
                                >
                                    {isSubmitting ? "Deleting..." : "Delete Permanently"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function AchievementModal({
    title,
    formData,
    preview,
    isSubmitting,
    submitLabel,
    onClose,
    onChange,
    onImageChange,
    onSubmit,
}) {
    return (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Close modal">
                        X
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-5 space-y-4">
                    <div className="flex justify-center">
                        <label className="cursor-pointer">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Achievement preview"
                                    className="w-28 h-28 rounded-xl object-cover border border-gray-300"
                                />
                            ) : (
                                <div className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-500 text-center px-2">
                                    Upload Image
                                </div>
                            )}

                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={onImageChange}
                            />
                        </label>
                    </div>

                    <InputField
                        id="achievement-title"
                        name="title"
                        label="Title"
                        value={formData.title}
                        onChange={onChange}
                        placeholder="Enter achievement title"
                    />

                    <div>
                        <label htmlFor="achievement-description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            id="achievement-description"
                            name="description"
                            value={formData.description}
                            onChange={onChange}
                            placeholder="Enter achievement description"
                            rows={4}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]/30 resize-none"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="achievement-category" className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                        </label>
                        <select
                            id="achievement-category"
                            name="category"
                            value={formData.category}
                            onChange={onChange}
                            className="w-full h-11 px-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]/30"
                            required
                        >
                            {categoryOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-11 rounded-lg bg-[#7a1c1c] text-white font-semibold hover:bg-[#9f2a2a] transition disabled:opacity-60"
                    >
                        {isSubmitting ? "Saving..." : submitLabel}
                    </button>
                </form>
            </div>
        </div>
    );
}

function StatCard({ label, value }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
    );
}

function InputField({ id, name, label, value, onChange, placeholder }) {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <input
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full h-11 px-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]/30"
                required
            />
        </div>
    );
}
