"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

/* eslint-disable react/prop-types */

const CATEGORY_OPTIONS = [
    { label: "Annual Day", value: "annualday" },
    { label: "Cultural", value: "cultural" },
    { label: "Picnic", value: "picnic" },
    { label: "Science Exhibition", value: "scienceexhibition" },
];

const CATEGORY_LABELS = {
    annualday: "Annual Day",
    cultural: "Cultural",
    picnic: "Picnic",
    scienceexhibition: "Science Exhibition",
};

const CATEGORY_STYLES = {
    annualday: "bg-purple-50 text-purple-700",
    cultural: "bg-pink-50 text-pink-700",
    picnic: "bg-green-50 text-green-700",
    scienceexhibition: "bg-blue-50 text-blue-700",
};

const initialFormData = { title: "", description: "", category: "annualday", date: "" };

export default function AdminEventsPage() {
    const [events, setEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const [formData, setFormData] = useState(initialFormData);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState("");

    const filteredEvents = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();
        if (!search) return events;
        return events.filter((ev) =>
            [ev.title, ev.description, CATEGORY_LABELS[ev.category] || ev.category]
                .join(" ")
                .toLowerCase()
                .includes(search)
        );
    }, [events, searchTerm]);

    const stats = useMemo(() => {
        return events.reduce(
            (acc, ev) => { acc[ev.category] = (acc[ev.category] || 0) + 1; return acc; },
            { annualday: 0, cultural: 0, picnic: 0, scienceexhibition: 0 }
        );
    }, [events]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/events", { cache: "no-store" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to fetch events");
            setEvents(data.events || []);
        } catch (error) {
            toast.error(error.message || "Failed to load events");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEvents(); }, []);

    const resetForm = () => { setFormData(initialFormData); setImageFile(null); setPreview(""); };

    const openEditModal = (ev) => {
        setSelectedEvent(ev);
        setFormData({ title: ev.title || "", description: ev.description || "", category: ev.category || "annualday", date: ev.date || "" });
        setImageFile(null);
        setPreview(ev.imageUrl || "");
        setIsEditModalOpen(true);
    };

    const buildPayload = (includeId = false) => {
        const payload = new FormData();
        if (includeId && selectedEvent?.id) payload.append("id", selectedEvent.id);
        payload.append("title", formData.title.trim());
        payload.append("description", formData.description.trim());
        payload.append("category", formData.category);
        payload.append("date", formData.date);
        if (imageFile) payload.append("image", imageFile);
        return payload;
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (!imageFile) { toast.error("Event image is required"); return; }
        try {
            setIsSubmitting(true);
            const res = await fetch("/api/events", { method: "POST", body: buildPayload() });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to add event");
            toast.success("Event added successfully");
            setIsAddModalOpen(false);
            resetForm();
            fetchEvents();
        } catch (error) {
            toast.error(error.message || "Failed to add event");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!selectedEvent?.id) return;
        try {
            setIsSubmitting(true);
            const res = await fetch("/api/events", { method: "PUT", body: buildPayload(true) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update event");
            toast.success("Event updated successfully");
            setIsEditModalOpen(false);
            resetForm();
            setSelectedEvent(null);
            fetchEvents();
        } catch (error) {
            toast.error(error.message || "Failed to update event");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedEvent?.id) return;
        try {
            setIsSubmitting(true);
            const res = await fetch(`/api/events?id=${encodeURIComponent(selectedEvent.id)}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to delete event");
            toast.success("Event deleted successfully");
            setIsDeleteModalOpen(false);
            setSelectedEvent(null);
            fetchEvents();
        } catch (error) {
            toast.error(error.message || "Failed to delete event");
        } finally {
            setIsSubmitting(false);
        }
    };

    let tableContent = null;
    if (loading) {
        tableContent = <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">Loading events...</td></tr>;
    } else if (filteredEvents.length === 0) {
        tableContent = <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">No events found</td></tr>;
    } else {
        tableContent = filteredEvents.map((ev) => (
            <tr key={ev.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                    <img src={ev.imageUrl} alt={ev.title} className="w-14 h-14 rounded-lg object-cover border border-gray-200" />
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{ev.title}</td>
                <td className="px-4 py-3">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${CATEGORY_STYLES[ev.category] || "bg-gray-100 text-gray-600"}`}>
                        {CATEGORY_LABELS[ev.category] || ev.category}
                    </span>
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{ev.date || "—"}</td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {ev.createdAt ? new Date(ev.createdAt).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        <button onClick={() => { setSelectedEvent(ev); setIsViewModalOpen(true); }} className="px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-semibold">View</button>
                        <button onClick={() => openEditModal(ev)} className="px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold">Edit</button>
                        <button onClick={() => { setSelectedEvent(ev); setIsDeleteModalOpen(true); }} className="px-3 py-1.5 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold">Delete</button>
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
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Events Management</h1>
                        <p className="text-gray-600 mt-1">Add and manage college events, programs, and activities</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                        className="h-11 px-5 rounded-lg bg-[#7a1c1c] text-white font-semibold hover:bg-[#9f2a2a] transition"
                    >
                        Add Event
                    </button>
                </div>

                {/* Stats */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Annual Day" value={String(stats.annualday || 0)} />
                    <StatCard label="Cultural" value={String(stats.cultural || 0)} />
                    <StatCard label="Picnic" value={String(stats.picnic || 0)} />
                    <StatCard label="Science Exhibition" value={String(stats.scienceexhibition || 0)} />
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <h2 className="text-lg font-semibold text-gray-900">All Events <span className="text-gray-400 font-normal text-sm">({events.length})</span></h2>
                        <div className="relative w-full md:max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search title, category..."
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
                                    <th className="px-4 py-3 text-left font-semibold">Category</th>
                                    <th className="px-4 py-3 text-left font-semibold">Event Date</th>
                                    <th className="px-4 py-3 text-left font-semibold">Added</th>
                                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>{tableContent}</tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <EventModal
                    title="Add Event"
                    formData={formData}
                    preview={preview}
                    isSubmitting={isSubmitting}
                    submitLabel="Save Event"
                    onClose={() => { setIsAddModalOpen(false); resetForm(); }}
                    onChange={(e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }))}
                    onImageChange={(file, previewUrl) => { setImageFile(file); setPreview(previewUrl); }}
                    onSubmit={handleAddSubmit}
                />
            )}

            {/* Edit Modal */}
            {isEditModalOpen && (
                <EventModal
                    title="Edit Event"
                    formData={formData}
                    preview={preview}
                    isSubmitting={isSubmitting}
                    submitLabel="Update Event"
                    onClose={() => { setIsEditModalOpen(false); resetForm(); setSelectedEvent(null); }}
                    onChange={(e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }))}
                    onImageChange={(file, previewUrl) => { setImageFile(file); setPreview(previewUrl); }}
                    onSubmit={handleEditSubmit}
                />
            )}

            {/* View Modal */}
            {isViewModalOpen && selectedEvent && (
                <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>
                            <button onClick={() => { setIsViewModalOpen(false); setSelectedEvent(null); }} className="text-gray-500 hover:text-gray-800 text-xl leading-none" aria-label="Close">×</button>
                        </div>
                        <div className="p-5 space-y-4">
                            {selectedEvent.imageUrl && (
                                <Image
                                    src={selectedEvent.imageUrl}
                                    alt={selectedEvent.title}
                                    width={600}
                                    height={280}
                                    className="w-full h-52 object-cover rounded-xl"
                                />
                            )}
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Title</p>
                                <p className="font-semibold text-gray-900">{selectedEvent.title}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Category</p>
                                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${CATEGORY_STYLES[selectedEvent.category] || "bg-gray-100 text-gray-600"}`}>
                                        {CATEGORY_LABELS[selectedEvent.category] || selectedEvent.category}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Event Date</p>
                                    <p className="text-gray-700">{selectedEvent.date || "—"}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Description</p>
                                <p className="text-gray-600 text-sm leading-relaxed">{selectedEvent.description}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Added On</p>
                                <p className="text-gray-500 text-sm">{selectedEvent.createdAt ? new Date(selectedEvent.createdAt).toLocaleString() : "—"}</p>
                            </div>
                        </div>
                        <div className="px-5 pb-5 flex justify-end gap-3">
                            <button onClick={() => { setIsViewModalOpen(false); openEditModal(selectedEvent); }} className="px-4 py-2 rounded-lg bg-[#7a1c1c] text-white font-semibold hover:bg-[#9f2a2a] transition text-sm">Edit</button>
                            <button onClick={() => { setIsViewModalOpen(false); setSelectedEvent(null); }} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Delete Event</h3>
                        </div>
                        <div className="p-5 space-y-4">
                            <p className="text-sm text-gray-700">
                                Are you sure you want to permanently delete{" "}
                                <span className="font-semibold">{selectedEvent?.title || "this event"}</span>?
                                This will also remove the image from Cloudinary.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button onClick={() => { setIsDeleteModalOpen(false); setSelectedEvent(null); }} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm">Cancel</button>
                                <button onClick={handleDelete} disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 disabled:opacity-60 text-sm">
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

function EventModal({ title, formData, preview, isSubmitting, submitLabel, onClose, onChange, onImageChange, onSubmit }) {
    const fileInputRef = useRef(null);

    const handleFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) { toast.error("Please select a valid image file"); return; }
        onImageChange(file, URL.createObjectURL(file));
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl leading-none" aria-label="Close">×</button>
                </div>

                <form onSubmit={onSubmit} className="p-5 space-y-5">
                    {/* Image Upload */}
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Event Image <span className="text-rose-500">*</span></p>
                        <div className="flex items-center gap-4">
                            <div className="shrink-0">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="w-24 h-20 rounded-xl object-cover border border-gray-300" />
                                ) : (
                                    <div className="w-24 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400 text-center px-2">
                                        Upload Image
                                    </div>
                                )}
                            </div>
                            <div>
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" id="event-image-input" onChange={handleFile} />
                                <label htmlFor="event-image-input" className="cursor-pointer px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition">
                                    {preview ? "Change Image" : "Upload Image"}
                                </label>
                                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP</p>
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label htmlFor="event-title" className="block text-sm font-semibold text-gray-700 mb-1.5">Title <span className="text-rose-500">*</span></label>
                        <input
                            id="event-title"
                            name="title"
                            value={formData.title}
                            onChange={onChange}
                            placeholder="Event title"
                            className="w-full h-11 px-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]/30 text-sm"
                            required
                        />
                    </div>

                    {/* Category & Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="event-category" className="block text-sm font-semibold text-gray-700 mb-1.5">Category <span className="text-rose-500">*</span></label>
                            <select
                                id="event-category"
                                name="category"
                                value={formData.category}
                                onChange={onChange}
                                className="w-full h-11 px-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]/30 text-sm"
                                required
                            >
                                {CATEGORY_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="event-date" className="block text-sm font-semibold text-gray-700 mb-1.5">Event Date</label>
                            <input
                                id="event-date"
                                name="date"
                                type="date"
                                value={formData.date}
                                onChange={onChange}
                                className="w-full h-11 px-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]/30 text-sm"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="event-description" className="block text-sm font-semibold text-gray-700 mb-1.5">Description <span className="text-rose-500">*</span></label>
                        <textarea
                            id="event-description"
                            name="description"
                            value={formData.description}
                            onChange={onChange}
                            rows={4}
                            placeholder="Describe the event..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]/30 text-sm resize-none"
                            required
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end pt-1">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-lg bg-[#7a1c1c] text-white font-semibold hover:bg-[#9f2a2a] transition disabled:opacity-60 text-sm">
                            {isSubmitting ? "Saving..." : submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
