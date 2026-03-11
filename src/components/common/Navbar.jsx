"use client";

import { useAuth } from "@/hooks/useAuth";
import { Bell, LogOut, Menu, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

const adminSearchRoutes = [
  { label: "View Admissions", path: "/admin/admissions" },
  { label: "Academics", path: "/admin/academics" },
  { label: "Departments", path: "/admin/departments" },
  { label: "Achievements", path: "/admin/achievements" },
  { label: "Events", path: "/admin/events" },
  { label: "Gallery", path: "/admin/gallery" },
  { label: "Feedback", path: "/admin/feedback" },
  { label: "Merit Upload", path: "/admin/merit" },
  { label: "Notifications", path: "/notifications" },
  { label: "Contact", path: "/admin/contact" },
  { label: "Profile", path: "/profile" },
  { label: "Settings", path: "/settings" },
];

const userSearchRoutes = [
  { label: "Admission", path: "/user/admission" },
  { label: "Student Details", path: "/user/admission?section=student" },
  { label: "Parent Details", path: "/user/admission?section=family" },
  { label: "10th Academics", path: "/user/admission?section=academic" },
  { label: "Stream Selection", path: "/user/admission?section=stream" },
  { label: "Documents", path: "/user/admission?section=documents" },
  { label: "Extra Details", path: "/user/admission?section=extras" },
  { label: "Declaration", path: "/user/admission?section=declaration" },
  { label: "Merit List", path: "/merit" },
  { label: "Notifications", path: "/notifications" },
  { label: "Profile", path: "/profile" },
  { label: "Settings", path: "/settings" },
];

// eslint-disable-next-line react/prop-types
export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const normalizedRole = String(user?.role || "").trim().toLowerCase();
  const roleLabel = normalizedRole === "admin" ? "Admin" : "Student";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [currentTime, setCurrentTime] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const timerRef = useRef(null);
  const isLoggingOutRef = useRef(false);

  const searchRoutes = useMemo(() => {
    return normalizedRole === "admin" ? adminSearchRoutes : userSearchRoutes;
  }, [normalizedRole]);

  const searchResults = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return [];

    return searchRoutes
      .filter((item) => item.label.toLowerCase().includes(query) || item.path.toLowerCase().includes(query))
      .slice(0, 6);
  }, [searchRoutes, searchText]);

  const goToSearchResult = (route) => {
    if (!route?.path) return;
    router.push(route.path);
    setSearchText("");
    setSearchOpen(false);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchText.trim();
    if (!query) return;

    const exactMatch = searchRoutes.find((item) => item.label.toLowerCase() === query.toLowerCase());
    const firstMatch = exactMatch || searchResults[0];

    if (!firstMatch) {
      toast.error("No matching page found");
      return;
    }

    goToSearchResult(firstMatch);
  };

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

      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ================= NOTIFICATION SUMMARY ================= */
  useEffect(() => {
    const loadNotificationSummary = async () => {
      try {
        const token = globalThis.localStorage.getItem("authToken");
        if (!token) {
          setNotificationCount(0);
          return;
        }

        const response = await fetch("/api/notification?summary=1", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const data = await response.json();
        if (!response.ok) {
          setNotificationCount(0);
          return;
        }

        setNotificationCount(Number(data.unreadCount || 0));
      } catch {
        setNotificationCount(0);
      }
    };

    loadNotificationSummary();
    const handleSeen = () => {
      loadNotificationSummary();
    };

    const timer = setInterval(loadNotificationSummary, 30000);
    globalThis.addEventListener("notifications-seen", handleSeen);
    return () => {
      clearInterval(timer);
      globalThis.removeEventListener("notifications-seen", handleSeen);
    };
  }, [normalizedRole]);

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
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    clearInterval(timerRef.current);
    setLogoutModal(false);

    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch {
      toast.error("Logout failed. Please try again.");
    } finally {
      isLoggingOutRef.current = false;
    }
  };

  const cancelLogout = () => {
    clearInterval(timerRef.current);
    setLogoutModal(false);
    toast("Logout cancelled");
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="w-full h-20 px-4 md:px-6 lg:px-8 grid grid-cols-[auto_1fr_auto] items-center gap-3 md:gap-6 backdrop-blur-md border-b sticky top-0 z-30 transition bg-white/90 border-gray-200 text-gray-900">
        {/* LEFT - MENU TOGGLE & WELCOME */}
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          {/* MOBILE MENU TOGGLE */}
          <button
            onClick={() => setSidebarOpen?.(!sidebarOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[#7a1c1c]/10 transition"
          >
            <Menu size={24} />
          </button>

          {/* WELCOME & USERNAME */}
          <div className="hidden sm:flex items-center gap-2 min-w-0">
            <h1 className="text-sm md:text-lg font-medium text-gray-500 whitespace-nowrap">
              Welcome back,
            </h1>
            <h1 className="text-sm md:text-lg font-bold bg-linear-to-r from-[#7a1c1c] to-[#5a1414] bg-clip-text text-transparent truncate max-w-32 md:max-w-52 lg:max-w-64">
              {user?.name || "User"}
            </h1>
          </div>
        </div>

        {/* CENTER - SEARCH BAR (HIDDEN ON MOBILE) */}
        <div className="hidden sm:flex relative w-full max-w-xl justify-self-center" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchText}
              onChange={(event) => {
                setSearchText(event.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder={`Search pages (${roleLabel})...`}
              className="w-full pl-10 pr-4 py-2 rounded-lg outline-none text-sm border transition bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#7a1c1c]/30"
            />
          </form>

          {searchOpen && searchText.trim() && (
            <div className="absolute top-12 left-0 right-0 z-40 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
              {searchResults.length > 0 ? (
                <div className="max-h-72 overflow-y-auto py-1">
                  {searchResults.map((item) => (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => goToSearchResult(item)}
                      className="w-full px-4 py-2.5 text-left hover:bg-[#7a1c1c]/5 transition"
                    >
                      <p className="text-sm font-medium text-gray-800">{item.label}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="px-4 py-3 text-sm text-gray-500">No matching page found.</p>
              )}
            </div>
          )}
        </div>

        {/* RIGHT - CLOCK, THEME, PROFILE */}
        <div className="flex items-center gap-2 md:gap-4 justify-self-end">
          {/* CLOCK */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm bg-gray-100 text-[#7a1c1c]">
            🕐 {currentTime}
          </div>

          {/* NOTIFICATIONS */}
          <button
            className="p-2 rounded-lg hover:bg-[#7a1c1c]/10 transition relative"
            title="Notifications"
            onClick={() => router.push("/notifications")}
          >
            <Bell size={20} />
            {notificationCount > 0 ? (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-rose-600 text-[10px] font-bold text-white flex items-center justify-center">
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            ) : null}
          </button>

          {/* PROFILE DROPDOWN */}
          <div
            className="relative"
            ref={dropdownRef}
          >
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#7a1c1c]/10 transition"
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shadow bg-linear-to-r from-[#7a1c1c] to-[#5a1414]">
                {user?.name?.charAt(0) || "U"}
              </div>
              <span className="hidden md:inline text-sm font-medium truncate max-w-25">
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
                    {roleLabel}
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
                className="px-6 py-2 rounded-lg bg-linear-to-r from-rose-500 to-pink-500 text-white font-medium shadow hover:shadow-lg hover:scale-105 transition"
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