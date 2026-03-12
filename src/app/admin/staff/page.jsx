"use client";

/* eslint-disable react/prop-types */

import { Filter, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const assignOptions = [
    { label: "Science", value: "science" },
    { label: "Commerce", value: "commerce" },
    { label: "Arts", value: "arts" },
];

const classOptions = [
    { label: "11th", value: "11th" },
    { label: "12th", value: "12th" },
    { label: "Both", value: "both" },
];

const PAGE_SIZE = 10;

const initialFormData = {
    name: "",
    email: "",
    phoneNumber: "",
    assignDepartment: "science",
    classAssigned: "11th",
    subjectsText: "",
};

export default function StaffAdminPage() {
    const [staffRecords, setStaffRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [assignFilter, setAssignFilter] = useState("");
    const [classFilter, setClassFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [formData, setFormData] = useState(initialFormData);
    const [selectedStaff, setSelectedStaff] = useState(null);

    const totalCount = staffRecords.length;

    const groupedCounts = useMemo(() => {
        return staffRecords.reduce(
            (acc, staff) => {
                acc[staff.assignDepartment] = (acc[staff.assignDepartment] || 0) + 1;
                return acc;
            },
            { science: 0, commerce: 0, arts: 0 }
        );
    }, [staffRecords]);

    const filteredRecords = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return staffRecords.filter((staff) => {
            const matchesAssign = !assignFilter || staff.assignDepartment === assignFilter;
            const matchesClass = !classFilter || staff.classAssigned === classFilter;
            const matchesSearch =
                !search ||
                [
                    staff.name,
                    staff.email,
                    staff.phoneNumber,
                    staff.assignDepartment,
                    staff.classAssigned,
                    (staff.subjects || []).join(" "),
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(search);

            return matchesAssign && matchesClass && matchesSearch;
        });
    }, [staffRecords, searchTerm, assignFilter, classFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));

    const paginatedRecords = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredRecords.slice(start, start + PAGE_SIZE);
    }, [filteredRecords, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, assignFilter, classFilter]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const fetchStaffRecords = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/staff", { cache: "no-store" });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch staff records");
            }

            setStaffRecords(data.staff || []);
        } catch (error) {
            toast.error(error.message || "Failed to fetch staff records");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaffRecords();
    }, []);

    const resetAddModal = () => {
        setFormData(initialFormData);
        setIsModalOpen(false);
    };

    const resetEditModal = () => {
        setFormData(initialFormData);
        setSelectedStaff(null);
        setIsEditModalOpen(false);
    };

    const openEditModal = (staff) => {
        setSelectedStaff(staff);
        setFormData({
            name: staff.name || "",
            email: staff.email || "",
            phoneNumber: staff.phoneNumber || "",
            assignDepartment: staff.assignDepartment || "science",
            classAssigned: staff.classAssigned || "11th",
            subjectsText: Array.isArray(staff.subjects) ? staff.subjects.join(", ") : "",
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (staff) => {
        setSelectedStaff(staff);
        setIsDeleteModalOpen(true);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCreate = async (event) => {
        event.preventDefault();

        const payload = {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            phoneNumber: formData.phoneNumber.trim(),
            assignDepartment: formData.assignDepartment,
            classAssigned: formData.classAssigned,
            subjects: formData.subjectsText,
        };

        if (!payload.name || !payload.email || !payload.phoneNumber || !payload.subjects) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await fetch("/api/staff", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to register staff");
            }

            if (data.warning) {
                toast.error(data.warning);
            }
            toast.success("Staff registered successfully");
            resetAddModal();
            fetchStaffRecords();
        } catch (error) {
            toast.error(error.message || "Failed to register staff");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (event) => {
        event.preventDefault();

        if (!selectedStaff?.id) {
            toast.error("Staff record not found");
            return;
        }

        const payload = {
            id: selectedStaff.id,
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            phoneNumber: formData.phoneNumber.trim(),
            assignDepartment: formData.assignDepartment,
            classAssigned: formData.classAssigned,
            subjects: formData.subjectsText,
        };

        if (!payload.name || !payload.email || !payload.phoneNumber || !payload.subjects) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await fetch("/api/staff", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to update staff");
            }

            toast.success("Staff updated successfully");
            resetEditModal();
            fetchStaffRecords();
        } catch (error) {
            toast.error(error.message || "Failed to update staff");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedStaff?.id) {
            toast.error("Staff record not found");
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await fetch(`/api/staff?id=${encodeURIComponent(selectedStaff.id)}`, {
                method: "DELETE",
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to delete staff");
            }

            toast.success("Staff deleted successfully");
            setSelectedStaff(null);
            setIsDeleteModalOpen(false);
            fetchStaffRecords();
        } catch (error) {
            toast.error(error.message || "Failed to delete staff");
        } finally {
            setIsSubmitting(false);
        }
    };

    let tableContent = null;
    if (loading) {
        tableContent = (
            <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                    Loading staff records...
                </td>
            </tr>
        );
    } else if (filteredRecords.length === 0) {
        tableContent = (
            <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                    No staff records found
                </td>
            </tr>
        );
    } else {
        tableContent = paginatedRecords.map((staff) => (
            <tr key={staff.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-slate-900">{staff.name}</td>
                <td className="px-4 py-3 text-slate-700">{staff.email}</td>
                <td className="px-4 py-3 text-slate-700">{staff.phoneNumber}</td>
                <td className="px-4 py-3 capitalize">{staff.assignDepartment}</td>
                <td className="px-4 py-3 uppercase">{staff.classAssigned}</td>
                <td className="px-4 py-3 text-slate-700">{(staff.subjects || []).join(", ") || "-"}</td>
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => openEditModal(staff)}
                            className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                        >
                            Edit
                        </button>
                        <button
                            type="button"
                            onClick={() => openDeleteModal(staff)}
                            className="rounded-md bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
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
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="rounded-[28px] border border-stone-200 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur md:p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Staff Management</h1>
                            <p className="mt-1 text-slate-600">
                                Register and manage teachers with department, class, and subjects.
                            </p>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="h-11 rounded-xl bg-[#7a1c1c] px-5 font-semibold text-white transition hover:bg-[#9f2a2a]"
                        >
                            Add Staff
                        </button>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Total Staff" value={String(totalCount)} />
                    <StatCard label="Science" value={String(groupedCounts.science || 0)} />
                    <StatCard label="Commerce" value={String(groupedCounts.commerce || 0)} />
                    <StatCard label="Arts" value={String(groupedCounts.arts || 0)} />
                </div>

                <div className="rounded-[28px] border border-stone-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)] overflow-hidden">
                    <div className="border-b border-stone-200 px-5 py-4 md:px-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">All Staff Records</h2>
                                <p className="mt-1 text-sm text-slate-500">Search and filter staff quickly.</p>
                            </div>

                            <div className="grid w-full gap-3 md:min-w-180 md:grid-cols-[minmax(0,1fr)_170px_140px]">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        value={searchTerm}
                                        onChange={(event) => setSearchTerm(event.target.value)}
                                        placeholder="Search name, email, phone, subjects..."
                                        className="h-11 w-full rounded-2xl border border-stone-200 bg-stone-50 pl-10 pr-4 outline-none transition focus:border-[#7a1c1c]/30 focus:bg-white"
                                    />
                                </div>

                                <div className="relative">
                                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Filter size={16} />
                                    </div>
                                    <select
                                        value={assignFilter}
                                        onChange={(event) => setAssignFilter(event.target.value)}
                                        className="h-11 w-full appearance-none rounded-2xl border border-stone-200 bg-stone-50 pl-9 pr-4 outline-none transition focus:border-[#7a1c1c]/30 focus:bg-white"
                                    >
                                        <option value="">All Assign</option>
                                        {assignOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <select
                                    value={classFilter}
                                    onChange={(event) => setClassFilter(event.target.value)}
                                    className="h-11 w-full appearance-none rounded-2xl border border-stone-200 bg-stone-50 px-4 outline-none transition focus:border-[#7a1c1c]/30 focus:bg-white"
                                >
                                    <option value="">All Classes</option>
                                    {classOptions.map((option) => (
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
                                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                                    <th className="px-4 py-3 text-left font-semibold">Email</th>
                                    <th className="px-4 py-3 text-left font-semibold">Phone</th>
                                    <th className="px-4 py-3 text-left font-semibold">Assign</th>
                                    <th className="px-4 py-3 text-left font-semibold">Class</th>
                                    <th className="px-4 py-3 text-left font-semibold">Subjects</th>
                                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>{tableContent}</tbody>
                        </table>
                    </div>

                    {!loading && filteredRecords.length > 0 && (
                        <div className="flex flex-col gap-3 border-t border-stone-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-500">Page {currentPage} of {totalPages}</p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                            <h3 className="text-lg font-semibold text-gray-900">Add Staff</h3>
                            <button
                                onClick={resetAddModal}
                                className="text-gray-500 hover:text-gray-800"
                                aria-label="Close add modal"
                            >
                                X
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-4 p-5">
                            <InputField
                                name="name"
                                label="Name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter full name"
                            />

                            <InputField
                                name="email"
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter email"
                            />

                            <InputField
                                name="phoneNumber"
                                label="Phone Number"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                placeholder="Enter phone number"
                            />

                            <SelectField
                                name="assignDepartment"
                                label="Assign Department"
                                value={formData.assignDepartment}
                                onChange={handleInputChange}
                                options={assignOptions}
                            />

                            <SelectField
                                name="classAssigned"
                                label="Class"
                                value={formData.classAssigned}
                                onChange={handleInputChange}
                                options={classOptions}
                            />

                            <InputField
                                name="subjectsText"
                                label="Subjects"
                                value={formData.subjectsText}
                                onChange={handleInputChange}
                                placeholder="Physics, Chemistry"
                            />

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="h-11 w-full rounded-lg bg-[#7a1c1c] font-semibold text-white transition hover:bg-[#9f2a2a] disabled:opacity-60"
                            >
                                {isSubmitting ? "Saving..." : "Save Staff"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                            <h3 className="text-lg font-semibold text-gray-900">Edit Staff</h3>
                            <button
                                onClick={resetEditModal}
                                className="text-gray-500 hover:text-gray-800"
                                aria-label="Close edit modal"
                            >
                                X
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-4 p-5">
                            <InputField
                                name="name"
                                label="Name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter full name"
                            />

                            <InputField
                                name="email"
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter email"
                            />

                            <InputField
                                name="phoneNumber"
                                label="Phone Number"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                placeholder="Enter phone number"
                            />

                            <SelectField
                                name="assignDepartment"
                                label="Assign Department"
                                value={formData.assignDepartment}
                                onChange={handleInputChange}
                                options={assignOptions}
                            />

                            <SelectField
                                name="classAssigned"
                                label="Class"
                                value={formData.classAssigned}
                                onChange={handleInputChange}
                                options={classOptions}
                            />

                            <InputField
                                name="subjectsText"
                                label="Subjects"
                                value={formData.subjectsText}
                                onChange={handleInputChange}
                                placeholder="Physics, Chemistry"
                            />

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="h-11 w-full rounded-lg bg-[#7a1c1c] font-semibold text-white transition hover:bg-[#9f2a2a] disabled:opacity-60"
                            >
                                {isSubmitting ? "Updating..." : "Update Staff"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                        <div className="border-b border-gray-200 px-5 py-4">
                            <h3 className="text-lg font-semibold text-gray-900">Delete Staff</h3>
                        </div>

                        <div className="space-y-4 p-5">
                            <p className="text-sm text-gray-700">
                                Are you sure you want to permanently delete
                                {" "}
                                <span className="font-semibold">{selectedStaff?.name || "this staff"}</span>?
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setSelectedStaff(null);
                                        setIsDeleteModalOpen(false);
                                    }}
                                    className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isSubmitting}
                                    className="rounded-lg bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
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
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        </div>
    );
}

function InputField({ name, label, value, onChange, placeholder, type = "text" }) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="h-11 w-full rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-[#7a1c1c]/30"
                required
            />
        </div>
    );
}

function SelectField({ name, label, value, onChange, options }) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="h-11 w-full rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-[#7a1c1c]/30"
                required
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
