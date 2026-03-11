"use client";

import { Filter, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

/* eslint-disable react/prop-types */

const initialFormData = {
    description: "",
};
const PAGE_SIZE = 100;

export default function AdminGalleryPage() {
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [timeFilter, setTimeFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const [formData, setFormData] = useState(initialFormData);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState("");

    const stats = useMemo(() => {
        const now = Date.now();
        const dayStart = new Date();
        dayStart.setHours(0, 0, 0, 0);
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
        const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

        return items.reduce(
            (acc, item) => {
                const ts = new Date(item.createdAt || item.updatedAt || now).getTime();
                acc.total += 1;
                if (ts >= dayStart.getTime()) acc.today += 1;
                if (ts >= weekAgo) acc.week += 1;
                if (ts >= monthAgo) acc.month += 1;
                return acc;
            },
            { total: 0, today: 0, week: 0, month: 0 }
        );
    }, [items]);

    const filteredItems = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();
        const now = Date.now();

        return items.filter((item) => {
            const matchesSearch = !search || item.description.toLowerCase().includes(search);

            const itemTs = new Date(item.createdAt || item.updatedAt || now).getTime();
            const matchesTime =
                timeFilter === "all" ||
                (timeFilter === "today" && itemTs >= new Date(new Date().setHours(0, 0, 0, 0)).getTime()) ||
                (timeFilter === "week" && itemTs >= now - 7 * 24 * 60 * 60 * 1000) ||
                (timeFilter === "month" && itemTs >= now - 30 * 24 * 60 * 60 * 1000);

            return matchesSearch && matchesTime;
        });
    }, [items, searchTerm, timeFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));

    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredItems.slice(start, start + PAGE_SIZE);
    }, [filteredItems, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, timeFilter]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const hasActiveFilters = Boolean(searchTerm.trim() || timeFilter !== "all");

    let tableContent = null;
    if (loading) {
        tableContent = (
            <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">Loading gallery...</td>
            </tr>
        );
    } else if (filteredItems.length === 0) {
        tableContent = (
            <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">No gallery items found</td>
            </tr>
        );
    } else {
        tableContent = paginatedItems.map((item) => (
            <tr key={item.id} className="border-t border-gray-100 hover:bg-stone-50">
                <td className="px-4 py-4">
                    <img src={item.imageUrl} alt="Gallery" className="h-16 w-24 rounded-xl object-cover border border-gray-200" />
                </td>
                <td className="px-4 py-4 text-gray-700 max-w-xl">{item.description}</td>
                <td className="px-4 py-4 text-gray-500">{new Date(item.updatedAt || item.createdAt || Date.now()).toLocaleDateString()}</td>
                <td className="px-4 py-4">
                    <a href={item.imageUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-slate-700 hover:text-[#7a1c1c]">
                        View Image
                    </a>
                </td>
                <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                        <button onClick={() => openEditModal(item)} className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50">Edit</button>
                        <button onClick={() => openDeleteModal(item)} className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700 hover:bg-rose-100">Delete</button>
                    </div>
                </td>
            </tr>
        ));
    }

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/gallery", { cache: "no-store" });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch gallery items");
            }

            setItems(data.items || []);
        } catch (error) {
            toast.error(error.message || "Failed to load gallery items");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const resetForm = () => {
        setFormData(initialFormData);
        setImageFile(null);
        setPreview("");
    };

    const closeAddModal = () => {
        resetForm();
        setIsAddModalOpen(false);
    };

    const closeEditModal = () => {
        resetForm();
        setSelectedItem(null);
        setIsEditModalOpen(false);
    };

    const openEditModal = (item) => {
        setSelectedItem(item);
        setFormData({ description: item.description || "" });
        setImageFile(null);
        setPreview(item.imageUrl || "");
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (item) => {
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleFieldChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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

    const buildPayload = (includeId = false) => {
        const payload = new FormData();
        if (includeId && selectedItem?.id) {
            payload.append("id", selectedItem.id);
        }
        payload.append("description", formData.description.trim());
        if (imageFile) {
            payload.append("image", imageFile);
        }
        return payload;
    };

    const handleCreate = async (event) => {
        event.preventDefault();

        if (!imageFile) {
            toast.error("Gallery image is required");
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await fetch("/api/gallery", {
                method: "POST",
                body: buildPayload(),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to add gallery item");
            }

            toast.success("Gallery item added successfully");
            closeAddModal();
            fetchItems();
        } catch (error) {
            toast.error(error.message || "Failed to add gallery item");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (event) => {
        event.preventDefault();

        try {
            setIsSubmitting(true);
            const response = await fetch("/api/gallery", {
                method: "PUT",
                body: buildPayload(true),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to update gallery item");
            }

            toast.success("Gallery item updated successfully");
            closeEditModal();
            fetchItems();
        } catch (error) {
            toast.error(error.message || "Failed to update gallery item");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedItem?.id) return;

        try {
            setIsSubmitting(true);
            const response = await fetch(`/api/gallery?id=${encodeURIComponent(selectedItem.id)}`, {
                method: "DELETE",
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to delete gallery item");
            }

            toast.success("Gallery item deleted permanently");
            setIsDeleteModalOpen(false);
            setSelectedItem(null);
            fetchItems();
        } catch (error) {
            toast.error(error.message || "Failed to delete gallery item");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f6f3f1] p-4 md:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <section className="rounded-[28px] border border-stone-200 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">Media Records</p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">Gallery Management</h1>
                            <p className="mt-2 text-sm text-slate-500">Manage gallery images, descriptions, and visual history.</p>
                        </div>

                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#7a1c1c] px-5 font-semibold text-white transition hover:bg-[#9f2a2a]"
                        >
                            Add Gallery
                        </button>
                    </div>
                </section>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <GalleryStatCard label="Total Images" value={String(stats.total)} />
                    <GalleryStatCard label="Added Today" value={String(stats.today)} />
                    <GalleryStatCard label="Last 7 Days" value={String(stats.week)} />
                    <GalleryStatCard label="Last 30 Days" value={String(stats.month)} />
                </div>

                <section className="rounded-[28px] border border-stone-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)] overflow-hidden">
                    <div className="border-b border-stone-200 px-6 py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">Gallery Records</h2>
                            <p className="mt-1 text-sm text-slate-500">Showing {filteredItems.length} of {items.length} records.</p>
                        </div>

                        <div className="grid w-full gap-3 md:max-w-2xl md:grid-cols-[minmax(0,1fr)_180px_auto]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="Search description..."
                                    className="h-11 w-full rounded-2xl border border-stone-200 bg-stone-50 pl-10 pr-4 outline-none transition focus:border-[#7a1c1c]/30 focus:bg-white"
                                />
                            </div>

                            <div className="relative">
                                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Filter size={16} />
                                </div>
                                <select
                                    value={timeFilter}
                                    onChange={(event) => setTimeFilter(event.target.value)}
                                    className="h-11 w-full appearance-none rounded-2xl border border-stone-200 bg-stone-50 pl-9 pr-4 outline-none transition focus:border-[#7a1c1c]/30 focus:bg-white"
                                >
                                    <option value="all">All Time</option>
                                    <option value="today">Today</option>
                                    <option value="week">Last 7 Days</option>
                                    <option value="month">Last 30 Days</option>
                                </select>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setSearchTerm("");
                                    setTimeFilter("all");
                                }}
                                disabled={!hasActiveFilters}
                                className="h-11 rounded-2xl border border-stone-200 px-4 text-sm font-medium text-slate-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-stone-50 text-slate-600">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold">Preview</th>
                                    <th className="px-4 py-3 text-left font-semibold">Description</th>
                                    <th className="px-4 py-3 text-left font-semibold">Updated</th>
                                    <th className="px-4 py-3 text-left font-semibold">Image</th>
                                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>{tableContent}</tbody>
                        </table>
                    </div>

                    {!loading && filteredItems.length > 0 && (
                        <div className="flex flex-col gap-3 border-t border-stone-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-500">Page {currentPage} of {totalPages}</p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="rounded-2xl border border-stone-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="rounded-2xl border border-stone-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            {isAddModalOpen && (
                <GalleryModal
                    title="Add Gallery Item"
                    description={formData.description}
                    preview={preview}
                    isSubmitting={isSubmitting}
                    submitLabel="Save Image"
                    onClose={closeAddModal}
                    onSubmit={handleCreate}
                    onChange={handleFieldChange}
                    onImageChange={handleImageChange}
                />
            )}

            {isEditModalOpen && (
                <GalleryModal
                    title="Edit Gallery Item"
                    description={formData.description}
                    preview={preview}
                    isSubmitting={isSubmitting}
                    submitLabel="Update Image"
                    onClose={closeEditModal}
                    onSubmit={handleUpdate}
                    onChange={handleFieldChange}
                    onImageChange={handleImageChange}
                />
            )}

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-[28px] border border-stone-200 bg-white p-6 shadow-2xl">
                        <h3 className="text-xl font-semibold text-slate-900">Delete Gallery Item</h3>
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                            This will permanently delete the selected gallery image and remove it from Cloudinary.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="rounded-2xl border border-stone-200 px-4 py-2 font-medium text-slate-700 hover:bg-stone-50">Cancel</button>
                            <button onClick={handleDelete} disabled={isSubmitting} className="rounded-2xl bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-700 disabled:opacity-60">
                                {isSubmitting ? "Deleting..." : "Delete Permanently"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function GalleryModal({ title, description, preview, isSubmitting, submitLabel, onClose, onSubmit, onChange, onImageChange }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-[28px] border border-stone-200 bg-white shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
                    <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
                    <button onClick={onClose} className="rounded-xl px-3 py-2 text-slate-500 hover:bg-stone-100 hover:text-slate-800">X</button>
                </div>

                <form onSubmit={onSubmit} className="space-y-5 p-6">
                    <div className="flex justify-center">
                        <label className="flex h-44 w-full cursor-pointer items-center justify-center rounded-3xl border border-dashed border-stone-300 bg-stone-50 overflow-hidden">
                            {preview ? (
                                <img src={preview} alt="Gallery preview" className="h-full w-full object-cover" />
                            ) : (
                                <div className="px-6 text-center text-sm text-slate-500">
                                    Upload image
                                </div>
                            )}
                            <input type="file" accept="image/*" className="hidden" onChange={onImageChange} />
                        </label>
                    </div>

                    <div>
                        <label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={description}
                            onChange={onChange}
                            rows={4}
                            placeholder="Write a short description for this gallery image"
                            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-[#7a1c1c]/30 focus:ring-2 focus:ring-[#7a1c1c]/10 resize-none"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="rounded-2xl border border-stone-200 px-4 py-2 font-medium text-slate-700 hover:bg-stone-50">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="rounded-2xl bg-[#7a1c1c] px-5 py-2 font-semibold text-white hover:bg-[#9f2a2a] disabled:opacity-60">
                            {isSubmitting ? "Saving..." : submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function GalleryStatCard({ label, value }) {
    return (
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        </div>
    );
}
