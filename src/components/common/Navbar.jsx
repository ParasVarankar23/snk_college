"use client";

import { useAuth } from "@/hooks/useAuth";
import { Bell, LogOut, Menu, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// eslint-disable-next-line react/prop-types
export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [currentTime, setCurrentTime] = useState("");

  const dropdownRef = useRef(null);
  const timerRef = useRef(null);

  /* ================= REAL-TIME CLOCK ================= */
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const clockInterval = setInterval(updateTime, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  /* ================= CLICK OUTSIDE ================= */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ================= LOGOUT TIMER ================= */
  useEffect(() => {
    if (logoutModal) {
      setCountdown(5);

      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(timerRef.current);
            handleFinalLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [logoutModal]);

  const handleFinalLogout = async () => {
    await logout();
    router.push("/login");
  };

  const cancelLogout = () => {
    clearInterval(timerRef.current);
    setLogoutModal(false);
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="w-full h-20 px-4 md:px-8 flex items-center justify-between backdrop-blur-md border-b sticky top-0 z-30 transition bg-white/90 border-gray-200 text-gray-900">
        {/* LEFT - MENU TOGGLE & WELCOME */}
        <div className="flex items-center gap-3 md:gap-6 flex-1">
          {/* MOBILE MENU TOGGLE */}
          <button
            onClick={() => setSidebarOpen?.(!sidebarOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[#7a1c1c]/10 transition"
          >
            <Menu size={24} />
          </button>

          {/* WELCOME & USERNAME */}
          <div className="hidden sm:flex flex-col">
            <p className="text-xs md:text-sm font-medium text-gray-500">
              Welcome back,
            </p>
            <h1 className="text-sm md:text-lg font-bold bg-gradient-to-r from-[#7a1c1c] to-[#5a1414] bg-clip-text text-transparent">
              {user?.name || "User"}
            </h1>
          </div>
        </div>

        {/* CENTER - SEARCH BAR (HIDDEN ON MOBILE) */}
        <div className="hidden sm:flex relative md:w-80 lg:w-96 mx-4">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search academics, events..."
            className="w-full pl-10 pr-4 py-2 rounded-lg outline-none text-sm border transition bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#7a1c1c]/30"
          />
        </div>

        {/* RIGHT - CLOCK, THEME, PROFILE */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* CLOCK */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm bg-gray-100 text-[#7a1c1c]">
            🕐 {currentTime}
          </div>

          {/* NOTIFICATIONS */}
          <button className="p-2 rounded-lg hover:bg-[#7a1c1c]/10 transition relative" title="Notifications">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>

          {/* PROFILE DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#7a1c1c]/10 transition"
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shadow bg-gradient-to-r from-[#7a1c1c] to-[#5a1414]">
                {user?.name?.charAt(0) || "U"}
              </div>
              <span className="hidden md:inline text-sm font-medium truncate max-w-[100px]">
                {user?.name || "Profile"}
              </span>
            </button>

            {/* DROPDOWN MENU */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl shadow-2xl overflow-hidden z-50 border transition bg-white border-gray-200">
                {/* USER INFO */}
                <div className="px-5 py-4 border-b border-gray-200">
                  <p className="text-sm font-bold">{user?.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                  <p className="text-xs text-[#7a1c1c] font-medium mt-2 uppercase tracking-wide">
                    Student/Staff
                  </p>
                </div>

                {/* MENU ITEMS */}
                <div className="py-2">
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-5 py-3 text-sm font-medium transition hover:bg-gray-100 text-gray-700"
                  >
                    👤 View Profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-5 py-3 text-sm font-medium transition hover:bg-gray-100 text-gray-700"
                  >
                    ⚙️ Settings
                  </Link>
                </div>

                {/* LOGOUT BUTTON */}
                <div className="border-t p-2 border-gray-200">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setLogoutModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* LOGOUT MODAL */}
      {logoutModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4">
          <div
            className="w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl border transition bg-white border-gray-200"
          >
            <LogOut size={48} className="mx-auto text-rose-500 mb-4" />

            <h2 className="text-xl md:text-2xl font-bold mb-2">
              Logging out...
            </h2>

            <p className="text-gray-500 mb-6 text-sm md:text-base">
              You will be logged out in{" "}
              <span className="text-rose-600 font-bold text-lg">
                {countdown}
              </span>{" "}
              seconds
            </p>

            <div className="flex gap-3 justify-center flex-col sm:flex-row">
              <button
                onClick={cancelLogout}
                className="px-6 py-2 rounded-lg font-medium transition border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleFinalLogout}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium shadow hover:shadow-lg hover:scale-105 transition"
              >
                Logout Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}