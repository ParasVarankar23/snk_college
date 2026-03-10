"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

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
            <Toaster position="top-center" />
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>

                    {user ? (
                        <div className="space-y-6">
                            {/* Avatar header */}
                            <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
                                <div className="w-24 h-24 bg-[#7a1c1c] rounded-full flex items-center justify-center text-white text-4xl font-bold shrink-0">
                                    {(user.name || "?").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{user.name || "—"}</h2>
                                    <p className="text-gray-500 text-sm">{user.email}</p>
                                </div>
                            </div>

                            {editing ? (
                                /* ── EDIT MODE ── */
                                <div className="space-y-5">
                                    <Field label="Full Name">
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#7a1c1c]/40 focus:border-[#7a1c1c]"
                                        />
                                    </Field>

                                    <Field label="Email Address" note="Not editable">
                                        <input
                                            type="email"
                                            value={user.email || ""}
                                            disabled
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-100 text-gray-500 cursor-not-allowed"
                                        />
                                    </Field>

                                    <Field label="Mobile Number">
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder="e.g. 9876543210"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#7a1c1c]/40 focus:border-[#7a1c1c]"
                                        />
                                    </Field>

                                    <Field label="Address">
                                        <textarea
                                            name="address"
                                            value={form.address}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="Enter your address"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#7a1c1c]/40 focus:border-[#7a1c1c] resize-none"
                                        />
                                    </Field>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="bg-[#7a1c1c] text-white px-6 py-2.5 rounded-lg hover:bg-[#9f2a2a] transition font-medium disabled:opacity-60"
                                        >
                                            {saving ? "Saving..." : "Save Changes"}
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            disabled={saving}
                                            className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* ── VIEW MODE ── */
                                <div className="space-y-5">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <InfoField label="Full Name" value={user.name} />
                                        <InfoField label="Email Address" value={user.email} note="Not editable" />
                                        <InfoField label="Mobile Number" value={user.phone} placeholder="Not provided" />
                                        <InfoField label="Address" value={user.address} placeholder="Not provided" />
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            onClick={handleEdit}
                                            className="bg-[#7a1c1c] text-white px-6 py-3 rounded-lg hover:bg-[#9f2a2a] transition font-medium"
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

function Field({ label, note, children }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
                {note && <span className="ml-2 text-xs text-gray-400">({note})</span>}
            </label>
            {children}
        </div>
    );
}

function InfoField({ label, value, note, placeholder = "—" }) {
    return (
        <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                {label}
                {note && <span className="ml-2 normal-case text-gray-400">({note})</span>}
            </p>
            <p className="text-base font-semibold text-gray-800 whitespace-pre-wrap">
                {value || <span className="text-gray-400 font-normal">{placeholder}</span>}
            </p>
        </div>
    );
}

