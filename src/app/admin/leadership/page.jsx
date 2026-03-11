"use client";

import { Search, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

/* eslint-disable react/prop-types */

const PAGE_SIZE = 10;

const initialFormData = {
    name: "",
    role: "",
    frontDesc: "",
    backDesc: "",
};

export default function AdminLeadershipPage() {
    const [leaders, setLeaders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedLeader, setSelectedLeader] = useState(null);

    const [formData, setFormData] = useState(initialFormData);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState("");

    const filteredLeaders = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();
        if (!search) return leaders;

        return leaders.filter((leader) =>
            [leader.name, leader.role, leader.frontDesc, leader.backDesc]
                .join(" ")
                .toLowerCase()
                .includes(search)
        );
    }, [leaders, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredLeaders.length / PAGE_SIZE));

    const paginatedLeaders = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredLeaders.slice(start, start + PAGE_SIZE);
    }, [filteredLeaders, currentPage]);

    const stats = useMemo(() => {
        return leaders.reduce(
            (acc, leader) => {
                const role = String(leader.role || "").toLowerCase();
                acc.total += 1;
                if (role.includes("chairman")) acc.chairman += 1;
                if (role.includes("principal") && !role.includes("vice")) acc.principal += 1;
                if (role.includes("vice")) acc.vicePrincipal += 1;
                return acc;
            },
            { total: 0, chairman: 0, principal: 0, vicePrincipal: 0 }
        );
    }, [leaders]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const fetchLeaders = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/leadership", { cache: "no-store" });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch leadership records");
            }

            setLeaders(data.leaders || []);
        } catch (error) {
            toast.error(error.message || "Failed to load leadership records");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaders();
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
        setSelectedLeader(null);
        setIsEditModalOpen(false);
    };

    const openEditModal = (leader) => {
        setSelectedLeader(leader);
        setFormData({
            name: leader.name || "",
            role: leader.role || "",
            frontDesc: leader.frontDesc || "",
            backDesc: leader.backDesc || "",
        });
        setImageFile(null);
        setPreview(leader.imageUrl || "");
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (leader) => {
        setSelectedLeader(leader);
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
        if (includeId && selectedLeader?.id) {
            payload.append("id", selectedLeader.id);
        }

        payload.append("name", formData.name.trim());
        payload.append("role", formData.role.trim());
        payload.append("frontDesc", formData.frontDesc.trim());
        payload.append("backDesc", formData.backDesc.trim());

        if (imageFile) {
            payload.append("image", imageFile);
        }

        return payload;
    };

    const handleCreate = async (event) => {
        event.preventDefault();

        if (!imageFile) {
            toast.error("Leader image is required");
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await fetch("/api/leadership", {
                method: "POST",
                body: buildPayload(),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to add leadership profile");
            }

            toast.success("Leadership profile added successfully");
            closeAddModal();
            fetchLeaders();
        } catch (error) {
            toast.error(error.message || "Failed to add leadership profile");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (event) => {
        event.preventDefault();

        try {
            setIsSubmitting(true);
            const response = await fetch("/api/leadership", {
                method: "PUT",
                body: buildPayload(true),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to update leadership profile");
            }

            toast.success("Leadership profile updated successfully");
            closeEditModal();
            fetchLeaders();
        } catch (error) {
            toast.error(error.message || "Failed to update leadership profile");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedLeader?.id) return;

        try {
            setIsSubmitting(true);
            const response = await fetch(`/api/leadership?id=${encodeURIComponent(selectedLeader.id)}`, {
                method: "DELETE",
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to delete leadership profile");
            }

            toast.success("Leadership profile deleted successfully");
            setIsDeleteModalOpen(false);
            setSelectedLeader(null);
            fetchLeaders();
        } catch (error) {
            toast.error(error.message || "Failed to delete leadership profile");
        } finally {
            setIsSubmitting(false);
        }
    };

    let tableContent = null;
    if (loading) {
        tableContent = (
            <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">Loading leadership records...</td>
            </tr>
        );
    } else if (filteredLeaders.length === 0) {
        tableContent = (
            <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">No leadership records found</td>
            </tr>
        );
    } else {
        tableContent = paginatedLeaders.map((leader) => (
            <tr key={leader.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                    <img
                        src={leader.imageUrl}
                        alt={leader.name}
                        className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                    />
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{leader.name}</td>
                <td className="px-4 py-3 text-gray-700">{leader.role}</td>
                <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{leader.frontDesc}</td>
                <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{leader.backDesc}</td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {leader.createdAt ? new Date(leader.createdAt).toLocaleDateString() : "-"}
                </td>
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => openEditModal(leader)}
                            className="px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => openDeleteModal(leader)}
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
        <div className="min-h-screen bg-[#f6f3f1] p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="rounded-[28px] border border-stone-200 bg-white/90 p-5 md:p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Leadership Management</h1>
                        <p className="text-slate-600 mt-1">Add, update, and remove leadership profiles shown on the home page.</p>
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="h-11 px-5 rounded-xl bg-[#7a1c1c] text-white font-semibold hover:bg-[#9f2a2a] transition inline-flex items-center gap-2"
                    >
                        <Users size={16} /> Add Leader
                    </button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Leaders" value={String(stats.total)} />
                    <StatCard label="Chairman" value={String(stats.chairman)} />
                    <StatCard label="Principal" value={String(stats.principal)} />
                    <StatCard label="Vice Principal" value={String(stats.vicePrincipal)} />
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <h2 className="text-lg font-semibold text-gray-900">All Leadership Profiles</h2>

                        <div className="relative w-full md:max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search name, role, description..."
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
                                    <th className="px-4 py-3 text-left font-semibold">Role</th>
                                    <th className="px-4 py-3 text-left font-semibold">Front Description</th>
                                    <th className="px-4 py-3 text-left font-semibold">Back Description</th>
                                    <th className="px-4 py-3 text-left font-semibold">Added</th>
                                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>{tableContent}</tbody>
                        </table>
                    </div>

                    {!loading && filteredLeaders.length > 0 && (
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
                <LeaderModal
                    title="Add Leadership Profile"
                    formData={formData}
                    preview={preview}
                    isSubmitting={isSubmitting}
                    submitLabel="Save Profile"
                    onClose={closeAddModal}
                    onSubmit={handleCreate}
                    onChange={handleFieldChange}
                    onImageChange={handleImageChange}
                />
            )}

            {isEditModalOpen && (
                <LeaderModal
                    title="Edit Leadership Profile"
                    formData={formData}
                    preview={preview}
                    isSubmitting={isSubmitting}
                    submitLabel="Update Profile"
                    onClose={closeEditModal}
                    onSubmit={handleUpdate}
                    onChange={handleFieldChange}
                    onImageChange={handleImageChange}
                />
            )}

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Delete Leadership Profile</h3>
                        </div>
                        <div className="p-5 space-y-4">
                            <p className="text-sm text-gray-700">
                                Are you sure you want to permanently delete{" "}
                                <span className="font-semibold">{selectedLeader?.name || "this profile"}</span>?
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => {
                                        setIsDeleteModalOpen(false);
                                        setSelectedLeader(null);
                                    }}
                                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 disabled:opacity-60 text-sm"
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
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        </div>
    );
}

function LeaderModal({ title, formData, preview, isSubmitting, submitLabel, onClose, onSubmit, onChange, onImageChange }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl leading-none" aria-label="Close">
                        x
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-5 space-y-4">
                    <div className="flex justify-center">
                        <label className="cursor-pointer">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Leader preview"
                                    className="w-24 h-24 rounded-xl object-cover border border-gray-300"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-500 text-center px-2">
                                    Upload Photo
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

                    <div className="grid gap-4 md:grid-cols-2">
                        <InputField
                            id="leader-name"
                            name="name"
                            label="Name"
                            value={formData.name}
                            onChange={onChange}
                            placeholder="Enter leader name"
                        />

                        <InputField
                            id="leader-role"
                            name="role"
                            label="Role"
                            value={formData.role}
                            onChange={onChange}
                            placeholder="Enter role (Chairman, Principal, etc.)"
                        />
                    </div>

                    <TextAreaField
                        id="leader-front"
                        name="frontDesc"
                        label="Front Description"
                        value={formData.frontDesc}
                        onChange={onChange}
                        placeholder="Short intro for front card"
                    />

                    <TextAreaField
                        id="leader-back"
                        name="backDesc"
                        label="Back Description"
                        value={formData.backDesc}
                        onChange={onChange}
                        placeholder="Detailed text for back card"
                    />

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

function InputField({ id, name, label, value, onChange, placeholder }) {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
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

function TextAreaField({ id, name, label, value, onChange, placeholder }) {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <textarea
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]/30 resize-none"
                required
            />
        </div>
    );
}
