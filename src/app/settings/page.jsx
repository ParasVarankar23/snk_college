"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState({ old: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/login");
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#7a1c1c]" />
      </div>
    );
  }

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/auth/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");
      toast.success("Password changed successfully!");
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
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
                🔒
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Settings</h1>
                <p className="text-gray-500">Change your account credentials securely from one place.</p>
                <div className="mt-4 inline-flex items-center rounded-full bg-[#7a1c1c]/8 px-3 py-1 text-xs font-medium text-[#7a1c1c]">
                  Password Security
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 px-8 py-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
              <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-5">
                <h2 className="text-lg font-semibold text-gray-800">Change Password</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Use a strong password you do not use anywhere else.
                </p>
              </div>

              <PasswordField
                label="Old Password"
                name="oldPassword"
                value={form.oldPassword}
                onChange={handleChange}
                show={show.old}
                onToggle={() => setShow((s) => ({ ...s, old: !s.old }))}
              />

              <PasswordField
                label="New Password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                show={show.new}
                onToggle={() => setShow((s) => ({ ...s, new: !s.new }))}
                hint="Minimum 6 characters"
              />

              <PasswordField
                label="Confirm New Password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                show={show.confirm}
                onToggle={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
              />

              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto min-w-56 bg-[#7a1c1c] text-white px-8 py-3 rounded-xl hover:bg-[#9f2a2a] transition font-semibold shadow-sm disabled:opacity-60"
              >
                {saving ? "Changing..." : "Change Password"}
              </button>
            </form>

            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Security Tips</h3>
                <div className="mt-4 space-y-3 text-sm text-gray-600">
                  <p>Use at least 6 characters for your new password.</p>
                  <p>Avoid reusing your old password or common words.</p>
                  <p>Change your password immediately if you suspect account access from someone else.</p>
                </div>
              </div>

              <div className="rounded-xl border border-[#7a1c1c]/15 bg-[#7a1c1c]/5 p-5">
                <p className="text-sm font-semibold text-[#7a1c1c]">Need help?</p>
                <p className="mt-2 text-sm text-gray-600">
                  If your current password is not working, use the forgot password option from the login page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line react/prop-types
function PasswordField({ label, name, value, onChange, show, onToggle, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          required
          className="w-full border border-gray-300 rounded-xl bg-white px-4 py-3 pr-18 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7a1c1c]/30 focus:border-[#7a1c1c]"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 text-sm select-none"
          tabIndex={-1}
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
      {hint && <p className="mt-2 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
