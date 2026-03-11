"use client";

import { Filter, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

/* eslint-disable react/prop-types */

const departmentOptions = [
    { label: "Science", value: "science" },
    { label: "Commerce", value: "commerce" },
    { label: "Arts", value: "arts" },
];
const PAGE_SIZE = 10;

const initialFormData = {
    name: "",
    subject: "",
    education: "",
    department: "science",
};

export default function DepartmentsAdminPage() {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [formData, setFormData] = useState(initialFormData);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState("");

    const totalCount = teachers.length;

    const groupedCounts = useMemo(() => {
        return teachers.reduce(
            (acc, teacher) => {
                acc[teacher.department] = (acc[teacher.department] || 0) + 1;
                return acc;
            },
            { science: 0, commerce: 0, arts: 0 }
        );
    }, [teachers]);

    const filteredTeachers = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return teachers.filter((teacher) => {
            const matchesDepartment = !departmentFilter || teacher.department === departmentFilter;
            const matchesSearch = !search || [
                teacher.name,
                teacher.department,
                teacher.subject,
                teacher.education,
            ]
                .join(" ")
                .toLowerCase()
                .includes(search);

            return matchesDepartment && matchesSearch;
        });
    }, [teachers, searchTerm, departmentFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredTeachers.length / PAGE_SIZE));

    const paginatedTeachers = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredTeachers.slice(start, start + PAGE_SIZE);
    }, [filteredTeachers, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, departmentFilter]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    let tableContent = null;
    if (loading) {
        tableContent = (
            <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                    Loading teachers...
                </td>
            </tr>
        );
    } else if (filteredTeachers.length === 0) {
        tableContent = (
            <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                    No teacher records found
                </td>
            </tr>
        );
    } else {
        tableContent = paginatedTeachers.map((teacher) => (
            <tr key={teacher.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                    <img
                        src={teacher.imageUrl}
                        alt={teacher.name}
                        className="w-12 h-12 rounded-full object-cover border border-gray-200"
                    />
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{teacher.name}</td>
                <td className="px-4 py-3 capitalize">{teacher.department}</td>
                <td className="px-4 py-3">{teacher.subject}</td>
                <td className="px-4 py-3">{teacher.education}</td>
                <td className="px-4 py-3 text-gray-500">
                    {teacher.createdAt
                        ? new Date(teacher.createdAt).toLocaleDateString()
                        : "-"}
                </td>
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => openEditModal(teacher)}
                            className="px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => openDeleteModal(teacher)}
                            className="px-3 py-1.5 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold"
                        >
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        ));
    }

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/departments", { cache: "no-store" });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch teachers");
            }

            setTeachers(data.teachers || []);
        } catch (error) {
            toast.error(error.message || "Failed to load teachers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const resetModal = () => {
        setFormData(initialFormData);
        setImageFile(null);
        setPreview("");
        setIsModalOpen(false);
    };

    const resetEditModal = () => {
        setSelectedTeacher(null);
        setFormData(initialFormData);
        setImageFile(null);
        setPreview("");
        setIsEditModalOpen(false);
    };

    const openEditModal = (teacher) => {
        setSelectedTeacher(teacher);
        setFormData({
            name: teacher.name || "",
            subject: teacher.subject || "",
            education: teacher.education || "",
            department: teacher.department || "science",
        });
        setImageFile(null);
        setPreview(teacher.imageUrl || "");
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (teacher) => {
        setSelectedTeacher(teacher);
        setIsDeleteModalOpen(true);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImage = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image file");
            return;
        }

        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleEditSubmit = async (event) => {
        event.preventDefault();

        if (!selectedTeacher?.id) {
            toast.error("Teacher not found");
            return;
        }

        try {
            setIsSubmitting(true);

            const payload = new FormData();
            payload.append("id", selectedTeacher.id);
            payload.append("name", formData.name.trim());
            payload.append("subject", formData.subject.trim());
            payload.append("education", formData.education.trim());
            payload.append("department", formData.department);

            if (imageFile) {
                payload.append("image", imageFile);
            }

            const response = await fetch("/api/departments", {
                method: "PUT",
                body: payload,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to update teacher");
            }

            toast.success("Teacher updated successfully");
            resetEditModal();
            fetchTeachers();
        } catch (error) {
            toast.error(error.message || "Failed to update teacher");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTeacher = async () => {
        if (!selectedTeacher?.id) {
            toast.error("Teacher not found");
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await fetch(`/api/departments?id=${encodeURIComponent(selectedTeacher.id)}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to delete teacher");
            }

            toast.success("Teacher permanently deleted");
            setIsDeleteModalOpen(false);
            setSelectedTeacher(null);
            fetchTeachers();
        } catch (error) {
            toast.error(error.message || "Failed to delete teacher");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!imageFile) {
            toast.error("Teacher image is required");
            return;
        }

        try {
            setIsSubmitting(true);

            const payload = new FormData();
            payload.append("name", formData.name.trim());
            payload.append("subject", formData.subject.trim());
            payload.append("education", formData.education.trim());
            payload.append("department", formData.department);
            payload.append("image", imageFile);

            const response = await fetch("/api/departments", {
                method: "POST",
                body: payload,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to add teacher");
            }

            toast.success("Teacher added successfully");
            resetModal();
            fetchTeachers();
        } catch (error) {
            toast.error(error.message || "Failed to add teacher");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f6f3f1] p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="rounded-[28px] border border-stone-200 bg-white/90 p-5 md:p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Departments Management</h1>
                        <p className="text-slate-600 mt-1">Manage all department teachers and profile photos</p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="h-11 px-5 rounded-xl bg-[#7a1c1c] text-white font-semibold hover:bg-[#9f2a2a] transition"
                    >
                        Add Department
                    </button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Teachers" value={String(totalCount)} />
                    <StatCard label="Science" value={String(groupedCounts.science || 0)} />
                    <StatCard label="Commerce" value={String(groupedCounts.commerce || 0)} />
                    <StatCard label="Arts" value={String(groupedCounts.arts || 0)} />
                </div>

                <div className="rounded-[28px] border border-stone-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)] overflow-hidden">
                    <div className="px-5 py-4 border-b border-stone-200 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">All Teachers</h2>
                            <p className="text-sm text-slate-500 mt-1">Search and filter by department quickly.</p>
                        </div>

                        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px] w-full md:w-auto md:min-w-115">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="Search name, subject, education..."
                                    className="h-11 w-full rounded-2xl border border-stone-200 bg-stone-50 pl-10 pr-4 outline-none transition focus:border-[#7a1c1c]/30 focus:bg-white"
                                />
                            </div>

                            <div className="relative">
                                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Filter size={16} />
                                </div>
                                <select
                                    value={departmentFilter}
                                    onChange={(event) => setDepartmentFilter(event.target.value)}
                                    className="h-11 w-full appearance-none rounded-2xl border border-stone-200 bg-stone-50 pl-9 pr-4 outline-none transition focus:border-[#7a1c1c]/30 focus:bg-white"
                                >
                                    <option value="">All Departments</option>
                                    {departmentOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-stone-50 text-slate-600">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold">Image</th>
                                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                                    <th className="px-4 py-3 text-left font-semibold">Department</th>
                                    <th className="px-4 py-3 text-left font-semibold">Subject</th>
                                    <th className="px-4 py-3 text-left font-semibold">Education</th>
                                    <th className="px-4 py-3 text-left font-semibold">Added</th>
                                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableContent}
                            </tbody>
                        </table>
                    </div>

                    {!loading && filteredTeachers.length > 0 && (
                        <div className="flex flex-col gap-3 border-t border-stone-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-500">Page {currentPage} of {totalPages}</p>
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

            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Add Teacher</h3>
                            <button
                                onClick={resetModal}
                                className="text-gray-500 hover:text-gray-800"
                                aria-label="Close modal"
                            >
                                X
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div className="flex justify-center">
                                <label className="cursor-pointer">
                                    {preview ? (
                                        <img
                                            src={preview}
                                            alt="Teacher preview"
                                            className="w-24 h-24 rounded-full object-cover border border-gray-300"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-500 text-center px-2">
                                            Upload Photo
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImage}
                                        required
                                    />
                                </label>
                            </div>

                            <InputField
                                name="name"
                                label="Teacher Name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter teacher name"
                            />

                            <InputField
                                name="subject"
                                label="Subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                                placeholder="Enter subject"
                            />

                            <InputField
                                name="education"
                                label="Education"
                                value={formData.education}
                                onChange={handleInputChange}
                                placeholder="Enter qualification"
                            />

                            <div>
                                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                                    Department
                                </label>
                                <select
                                    id="department"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    className="w-full h-11 px-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]/30"
                                    required
                                >
                                    {departmentOptions.map((option) => (
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
                                {isSubmitting ? "Saving..." : "Save Teacher"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Edit Teacher</h3>
                            <button
                                onClick={resetEditModal}
                                className="text-gray-500 hover:text-gray-800"
                                aria-label="Close edit modal"
                            >
                                X
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
                            <div className="flex justify-center">
                                <label className="cursor-pointer">
                                    {preview ? (
                                        <img
                                            src={preview}
                                            alt="Teacher preview"
                                            className="w-24 h-24 rounded-full object-cover border border-gray-300"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-500 text-center px-2">
                                            Upload Photo
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImage}
                                    />
                                </label>
                            </div>

                            <InputField
                                name="name"
                                label="Teacher Name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter teacher name"
                            />

                            <InputField
                                name="subject"
                                label="Subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                                placeholder="Enter subject"
                            />

                            <InputField
                                name="education"
                                label="Education"
                                value={formData.education}
                                onChange={handleInputChange}
                                placeholder="Enter qualification"
                            />

                            <div>
                                <label htmlFor="edit-department" className="block text-sm font-medium text-gray-700 mb-1">
                                    Department
                                </label>
                                <select
                                    id="edit-department"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    className="w-full h-11 px-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]/30"
                                    required
                                >
                                    {departmentOptions.map((option) => (
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
                                {isSubmitting ? "Updating..." : "Update Teacher"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Permanent Delete</h3>
                        </div>

                        <div className="p-5 space-y-4">
                            <p className="text-sm text-gray-700">
                                Are you sure you want to permanently delete
                                {" "}
                                <span className="font-semibold">{selectedTeacher?.name || "this teacher"}</span>?
                                This will remove database data and the Cloudinary image.
                            </p>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => {
                                        setIsDeleteModalOpen(false);
                                        setSelectedTeacher(null);
                                    }}
                                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteTeacher}
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

function StatCard({ label, value }) {
    return (
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        </div>
    );
}

function InputField({ name, label, value, onChange, placeholder }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
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
