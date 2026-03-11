"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ProfilePage() {
    const router = useRouter();
    const { user, isAuthenticated, loading, updateUser } = useAuth();

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: "", phone: "", address: "" });

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, loading, router]);

    // Sync form when user data loads
    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || "",
                phone: user.phone || "",
                address: user.address || "",
            });
        }
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#7a1c1c]"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    const handleEdit = () => {
        setForm({
            name: user.name || "",
            phone: user.phone || "",
            address: user.address || "",
        });
        setEditing(true);
    };

    const handleCancel = () => setEditing(false);

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSave = async () => {
        if (!form.name.trim()) {
            toast.error("Name is required");
            return;
        }
        setSaving(true);
        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch("/api/auth/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update profile");

            updateUser({ name: form.name.trim(), phone: form.phone.trim(), address: form.address.trim() });
            toast.success("Profile updated successfully!");
            setEditing(false);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="px-8 py-8 border-b border-gray-200 bg-linear-to-r from-white to-[#faf6f6]">
                        <div className="flex items-start gap-5">
                            <div className="w-18 h-18 rounded-2xl bg-[#7a1c1c] flex items-center justify-center text-white text-3xl shadow-lg shrink-0">
                                👤
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
                                <p className="text-gray-500">View and manage your personal account details.</p>
                                <div className="mt-4 inline-flex items-center rounded-full bg-[#7a1c1c]/8 px-3 py-1 text-xs font-medium text-[#7a1c1c]">
                                    Account Information
                                </div>
                            </div>
                        </div>
                    </div>

                    {user ? (
                        <div className="space-y-6 px-8 py-8">
                            {/* Avatar header */}
                            <div className="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-gray-50/70 p-6 sm:flex-row sm:items-center">
                                <div className="w-24 h-24 bg-[#7a1c1c] rounded-full flex items-center justify-center text-white text-4xl font-bold shrink-0 shadow-lg">
                                    {(user.name || "?").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{user.name || "—"}</h2>
                                    <p className="text-gray-500 text-sm">{user.email}</p>
                                    <p className="mt-2 text-sm text-gray-500">Keep your profile updated so your account information stays accurate.</p>
                                </div>
                            </div>

                            {editing ? (
                                /* ── EDIT MODE ── */
                                <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-1">
                                    <Field label="Full Name">
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7a1c1c]/30 focus:border-[#7a1c1c]"
                                        />
                                    </Field>

                                    <Field label="Email Address" note="Not editable">
                                        <input
                                            type="email"
                                            value={user.email || ""}
                                            disabled
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-100 text-gray-500 cursor-not-allowed"
                                        />
                                    </Field>

                                    <Field label="Mobile Number">
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder="e.g. 9876543210"
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7a1c1c]/30 focus:border-[#7a1c1c]"
                                        />
                                    </Field>

                                    <Field label="Address">
                                        <textarea
                                            name="address"
                                            value={form.address}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="Enter your address"
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7a1c1c]/30 focus:border-[#7a1c1c] resize-none"
                                        />
                                    </Field>

                                    <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="bg-[#7a1c1c] text-white px-6 py-3 rounded-xl hover:bg-[#9f2a2a] transition font-medium disabled:opacity-60 sm:min-w-44"
                                        >
                                            {saving ? "Saving..." : "Save Changes"}
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            disabled={saving}
                                            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition font-medium sm:min-w-36"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* ── VIEW MODE ── */
                                <div className="space-y-5">
                                    <div className="grid md:grid-cols-2 gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                                        <InfoField label="Full Name" value={user.name} />
                                        <InfoField label="Email Address" value={user.email} note="Not editable" />
                                        <InfoField label="Mobile Number" value={user.phone} placeholder="Not provided" />
                                        <InfoField label="Address" value={user.address} placeholder="Not provided" />
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            onClick={handleEdit}
                                            className="bg-[#7a1c1c] text-white px-6 py-3 rounded-xl hover:bg-[#9f2a2a] transition font-medium shadow-sm"
                                        >
                                            Edit Profile
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-600">No user data available</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// eslint-disable-next-line react/prop-types
function Field({ label, note, children }) {
    return (
        <div className="px-5 pt-5 first:pt-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
                {note && <span className="ml-2 text-xs text-gray-400">({note})</span>}
            </label>
            {children}
        </div>
    );
}

// eslint-disable-next-line react/prop-types
function InfoField({ label, value, note, placeholder = "—" }) {
    return (
        <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                {label}
                {note && <span className="ml-2 normal-case text-gray-400">({note})</span>}
            </p>
            <p className="text-base font-semibold text-gray-800 whitespace-pre-wrap leading-relaxed">
                {value || <span className="text-gray-400 font-normal">{placeholder}</span>}
            </p>
        </div>
    );
}

