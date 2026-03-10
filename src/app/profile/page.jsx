"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
    const router = useRouter();
    const { user, isAuthenticated, loading } = useAuth();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, loading, router]);

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

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>

                    {user ? (
                        <div className="space-y-6">
                            {/* Profile Header */}
                            <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
                                <div className="w-24 h-24 bg-[#7a1c1c] rounded-full flex items-center justify-center text-white text-4xl font-bold">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                                    <p className="text-gray-600">{user.email}</p>
                                </div>
                            </div>

                            {/* Profile Information */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm text-gray-600">Full Name</label>
                                    <p className="text-lg font-semibold text-gray-800">{user.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600">Email Address</label>
                                    <p className="text-lg font-semibold text-gray-800">{user.email}</p>
                                </div>
                            </div>

                            {/* Edit Profile Button */}
                            <div className="pt-6">
                                <button className="bg-[#7a1c1c] text-white px-6 py-3 rounded-lg hover:bg-[#9f2a2a] transition font-medium">
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-600">No user data available</p>
                    )}
                </div>
            </div>
        </div>
    );
}
