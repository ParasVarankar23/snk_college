"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

/* eslint-disable react/prop-types */

const STATUS_OPTIONS = ["new", "reviewed", "contacted", "closed"];

const STATUS_STYLES = {
    new: "bg-blue-50 text-blue-700",
    reviewed: "bg-yellow-50 text-yellow-700",
    contacted: "bg-purple-50 text-purple-700",
    closed: "bg-green-50 text-green-700",
};

const initialFormData = {
    name: "",
    email: "",
    phone: "",
    course: "",
    department: "",
    message: "",
    status: "new",
};

export default function AdminContactPage() {
    const [inquiries, setInquiries] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedInquiry, setSelectedInquiry] = useState(null);

    const [formData, setFormData] = useState(initialFormData);

    const filteredInquiries = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();
        if (!search) return inquiries;
        return inquiries.filter((inq) =>
            [inq.name, inq.email, inq.phone, inq.course, inq.department, inq.message]
                .join(" ")
                .toLowerCase()
                .includes(search)
        );
    }, [inquiries, searchTerm]);

    const stats = useMemo(() => {
        return inquiries.reduce(
            (acc, inq) => {
                acc[inq.status] = (acc[inq.status] || 0) + 1;
                return acc;
            },
            { new: 0, reviewed: 0, contacted: 0, closed: 0 }
        );
    }, [inquiries]);

    const fetchInquiries = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/contact", { cache: "no-store" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to fetch inquiries");
            setInquiries(data.inquiries || []);
        } catch (error) {
            toast.error(error.message || "Failed to load inquiries");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInquiries(); }, []);

    const openViewModal = (inq) => {
        setSelectedInquiry(inq);
        setIsViewModalOpen(true);
    };

    const openEditModal = (inq) => {
        setSelectedInquiry(inq);
        setFormData({
            name: inq.name || "",
            email: inq.email || "",
            phone: inq.phone || "",
            course: inq.course || "",
            department: inq.department || "",
            message: inq.message || "",
            status: inq.status || "new",
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setSelectedInquiry(null);
        setFormData(initialFormData);
        setIsEditModalOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!selectedInquiry?.id) return;

        try {
            setIsSubmitting(true);
            const res = await fetch("/api/contact", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: selectedInquiry.id, ...formData }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update inquiry");

            toast.success("Inquiry updated successfully");
            closeEditModal();
            fetchInquiries();
        } catch (error) {
            toast.error(error.message || "Failed to update inquiry");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedInquiry?.id) return;
        try {
            setIsSubmitting(true);
            const res = await fetch(`/api/contact?id=${encodeURIComponent(selectedInquiry.id)}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to delete inquiry");

            toast.success("Inquiry deleted successfully");
            setIsDeleteModalOpen(false);
            setSelectedInquiry(null);
            fetchInquiries();
        } catch (error) {
            toast.error(error.message || "Failed to delete inquiry");
        } finally {
            setIsSubmitting(false);
        }
    };

    let tableContent = null;
    if (loading) {
        tableContent = (
            <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">Loading inquiries...</td>
            </tr>
        );
    } else if (filteredInquiries.length === 0) {
        tableContent = (
            <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">No inquiries found</td>
            </tr>
        );
    } else {
        tableContent = filteredInquiries.map((inq) => (
            <tr key={inq.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{inq.name}</td>
                <td className="px-4 py-3 text-gray-600">{inq.email}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{inq.phone}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{inq.course} – {inq.department}</td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[inq.status] || "bg-gray-100 text-gray-600"}`}>
                        {inq.status}
                    </span>
                </td>
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => openViewModal(inq)}
                            className="px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-semibold"
                        >
                            View
                        </button>
                        <button
                            onClick={() => openEditModal(inq)}
                            className="px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => { setSelectedInquiry(inq); setIsDeleteModalOpen(true); }}
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
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Contact Inquiries</h1>
                    <p className="text-gray-600 mt-1">Manage all admission and general inquiries submitted by students</p>
                </div>

                {/* Stats */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Inquiries" value={String(inquiries.length)} color="text-gray-900" />
                    <StatCard label="New" value={String(stats.new || 0)} color="text-blue-700" />
                    <StatCard label="Contacted" value={String(stats.contacted || 0)} color="text-purple-700" />
                    <StatCard label="Closed" value={String(stats.closed || 0)} color="text-green-700" />
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <h2 className="text-lg font-semibold text-gray-900">All Inquiries</h2>
                        <div className="relative w-full md:max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search name, email, department..."
                                className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]/30"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                                    <th className="px-4 py-3 text-left font-semibold">Email</th>
                                    <th className="px-4 py-3 text-left font-semibold">Phone</th>
                                    <th className="px-4 py-3 text-left font-semibold">Class / Dept</th>
                                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>{tableContent}</tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* View Modal */}
            {isViewModalOpen && selectedInquiry && (
                <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Inquiry Details</h3>
                            <button
                                onClick={() => { setIsViewModalOpen(false); setSelectedInquiry(null); }}
                                className="text-gray-500 hover:text-gray-800 text-xl leading-none"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-5 space-y-4 text-sm">
                            <DetailRow label="Student Name" value={selectedInquiry.name} />
                            <DetailRow label="Email" value={selectedInquiry.email} />
                            <DetailRow label="Phone" value={selectedInquiry.phone} />
                            <DetailRow label="Class" value={selectedInquiry.course} />
                            <DetailRow label="Department" value={selectedInquiry.department} />
                            <DetailRow label="Message" value={selectedInquiry.message || "—"} multiline />
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500 font-medium">Status</span>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[selectedInquiry.status] || "bg-gray-100 text-gray-600"}`}>
                                    {selectedInquiry.status}
                                </span>
                            </div>
                            <DetailRow
                                label="Submitted On"
                                value={selectedInquiry.createdAt ? new Date(selectedInquiry.createdAt).toLocaleString() : "—"}
                            />
                        </div>
                        <div className="px-5 pb-5 flex justify-end gap-3">
                            <button
                                onClick={() => { setIsViewModalOpen(false); openEditModal(selectedInquiry); }}
                                className="px-4 py-2 rounded-lg bg-[#7a1c1c] text-white font-semibold hover:bg-[#9f2a2a] transition text-sm"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => { setIsViewModalOpen(false); setSelectedInquiry(null); }}
                                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Edit Inquiry</h3>
                            <button onClick={closeEditModal} className="text-gray-500 hover:text-gray-800 text-xl leading-none" aria-label="Close">×</button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="edit-name" className="block text-sm font-semibold text-gray-700 mb-1.5">Name</label>
                                    <input
                                        id="edit-name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full h-10 px-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]/30 text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="edit-email" className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                                    <input
                                        id="edit-email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full h-10 px-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]/30 text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="edit-phone" className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                                    <input
                                        id="edit-phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full h-10 px-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]/30 text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="edit-course" className="block text-sm font-semibold text-gray-700 mb-1.5">Class</label>
                                    <select
                                        id="edit-course"
                                        name="course"
                                        value={formData.course}
                                        onChange={handleInputChange}
                                        className="w-full h-10 px-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]/30 text-sm"
                                        required
                                    >
                                        <option value="">Select Class</option>
                                        <option value="11th">11th</option>
                                        <option value="12th">12th</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="edit-department" className="block text-sm font-semibold text-gray-700 mb-1.5">Department</label>
                                    <select
                                        id="edit-department"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                        className="w-full h-10 px-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]/30 text-sm"
                                        required
                                    >
                                        <option value="">Select Department</option>
                                        <option value="Science">Science</option>
                                        <option value="Commerce">Commerce</option>
                                        <option value="Arts">Arts</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="edit-status" className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                                    <select
                                        id="edit-status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full h-10 px-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]/30 text-sm"
                                    >
                                        {STATUS_OPTIONS.map((s) => (
                                            <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="edit-message" className="block text-sm font-semibold text-gray-700 mb-1.5">Message</label>
                                <textarea
                                    id="edit-message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]/30 text-sm resize-none"
                                />
                            </div>

                            <div className="flex gap-3 justify-end pt-1">
                                <button type="button" onClick={closeEditModal} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm">
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
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Delete Inquiry</h3>
                        </div>
                        <div className="p-5 space-y-4">
                            <p className="text-sm text-gray-700">
                                Are you sure you want to permanently delete the inquiry from{" "}
                                <span className="font-semibold">{selectedInquiry?.name || "this student"}</span>?
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => { setIsDeleteModalOpen(false); setSelectedInquiry(null); }}
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

function StatCard({ label, value, color = "text-gray-900" }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
        </div>
    );
}

function DetailRow({ label, value, multiline = false }) {
    return (
        <div className={`flex ${multiline ? "flex-col gap-1" : "items-start justify-between"}`}>
            <span className="text-gray-500 font-medium shrink-0">{label}</span>
            <span className={`text-gray-800 ${multiline ? "" : "text-right ml-4"}`}>{value}</span>
        </div>
    );
}
