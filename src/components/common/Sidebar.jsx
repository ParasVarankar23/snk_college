"use client";

/* eslint-disable react/prop-types */

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  FaAddressBook,
  FaAward,
  FaBell,
  FaBook,
  FaCalendar,
  FaChalkboardUser,
  FaChevronDown,
  FaCircleUser,
  FaFilePdf,
  FaGear,
  FaImages,
  FaMessage,
} from "react-icons/fa6";

// eslint-disable-next-line react/prop-types
function SidebarNavItems({ menuItems, pathname, admissionOpen, setAdmissionOpen, handleLinkClick }) {
  const searchParams = useSearchParams();
  return (
    <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-4 pr-2 space-y-2 [scrollbar-width:thin] [scrollbar-color:#b0b7c3_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent">
      {menuItems.map((item) => {
        const IconComponent = item.icon;
        const href = item.query
          ? `${item.path}?${item.query.key}=${item.query.value}`
          : item.path;
        const isPathActive = pathname.startsWith(item.path || "");
        const hasDirectQueryMatch = item.query
          ? searchParams.get(item.query.key) === item.query.value
          : true;
        const siblingQueryItems = menuItems.filter(
          (menuItem) => menuItem.path === item.path && menuItem.query
        );
        const hasAnySiblingQueryMatch = siblingQueryItems.some(
          (menuItem) => searchParams.get(menuItem.query.key) === menuItem.query.value
        );
        let hasQueryMatch = hasDirectQueryMatch;
        if (!item.query && siblingQueryItems.length > 0) {
          hasQueryMatch = !hasAnySiblingQueryMatch;
        }
        const isActive = isPathActive && hasQueryMatch;
        const hasChildren = Array.isArray(item.children) && item.children.length > 0;

        if (hasChildren) {
          return (
            <div key={item.name} className="space-y-2">
              <button
                type="button"
                onClick={() => setAdmissionOpen((prev) => !prev)}
                className={`flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-3 text-left font-medium text-[15px] outline-none transition focus-visible:border-[#7a1c1c]/25 focus-visible:ring-2 focus-visible:ring-[#7a1c1c]/15 ${isActive
                  ? "bg-[#7a1c1c]/10 text-[#7a1c1c]"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
              >
                <IconComponent size={18} className="shrink-0" />
                <span className="truncate flex-1">{item.name}</span>
                <FaChevronDown className={`shrink-0 text-xs transition-transform ${admissionOpen ? "rotate-180" : ""}`} />
              </button>

              {admissionOpen && (
                <div className="ml-4 space-y-1 border-l border-gray-200 pl-4">
                  {item.children.map((child) => {
                    const childActive = pathname.startsWith(item.path) && searchParams.get("section") === child.section;
                    return (
                      <Link
                        key={child.section}
                        href={`${item.path}?section=${child.section}`}
                        onClick={handleLinkClick}
                        className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${childActive
                          ? "bg-[#7a1c1c]/10 text-[#7a1c1c]"
                          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                          }`}
                      >
                        {child.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        return (
          <Link
            key={item.name}
            href={href}
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-[15px] transition ${isActive
              ? "bg-[#7a1c1c]/10 text-[#7a1c1c]"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
          >
            <IconComponent size={18} className="shrink-0" />
            <span className="truncate">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

// eslint-disable-next-line react/prop-types
export default function Sidebar({ setSidebarOpen }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [admissionOpen, setAdmissionOpen] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/user/admission")) {
      setAdmissionOpen(true);
    }
  }, [pathname]);

  const handleLinkClick = () => {
    setSidebarOpen?.(false);
  };

  const adminMenuItems = [
    {
      name: "View Admissions",
      icon: FaChalkboardUser,
      path: "/admin/admissions",
    },
    {
      name: "Payment History",
      icon: FaFilePdf,
      path: "/admin/admissions",
      query: { key: "view", value: "payments" },
    },
    {
      name: "Academics",
      icon: FaChalkboardUser,
      path: "/admin/academics",
    },
    {
      name: "Departments",
      icon: FaBook,
      path: "/admin/departments",
    },
    {
      name: "Achievements",
      icon: FaAward,
      path: "/admin/achievements",
    },
    {
      name: "Events",
      icon: FaCalendar,
      path: "/admin/events",
    },
    {
      name: "Gallery",
      icon: FaImages,
      path: "/admin/gallery",
    },
    {
      name: "Feedback",
      icon: FaMessage,
      path: "/admin/feedback",
    },
    {
      name: "Merit Upload",
      icon: FaFilePdf,
      path: "/admin/merit",
    },
    {
      name: "Notifications",
      icon: FaBell,
      path: "/notifications",
    },
    {
      name: "Contact",
      icon: FaAddressBook,
      path: "/admin/contact",
    },
    {
      name: "Leadership",
      icon: FaCircleUser,
      path: "/admin/leadership",
    },
  ];

  const userMenuItems = [
    {
      name: "Admission",
      icon: FaAddressBook,
      path: "/user/admission",
      children: [
        { name: "Student Details", section: "student" },
        { name: "Parent Details", section: "family" },
        { name: "10th Academics", section: "academic" },
        { name: "Stream Selection", section: "stream" },
        { name: "Documents", section: "documents" },
        { name: "Extra Details", section: "extras" },
        { name: "Payment", section: "payment" },
        { name: "Declaration", section: "declaration" },
      ],
    },
    {
      name: "Merit List",
      icon: FaFilePdf,
      path: "/merit",
    },
    {
      name: "Notifications",
      icon: FaBell,
      path: "/notifications",
    },
    {
      name: "Profile",
      icon: FaCircleUser,
      path: "/profile",
    },
    {
      name: "Settings",
      icon: FaGear,
      path: "/settings",
    },
  ];

  const isAdmin = user?.role === "admin";
  const menuItems = isAdmin ? adminMenuItems : userMenuItems;
  const roleLabel = isAdmin ? "Admin" : "Student";

  return (
    <aside
      className="flex h-full min-h-0 w-full flex-col overflow-hidden border-r border-gray-200 bg-white transition-all"
    >
      {/* HEADER */}
      <div className="shrink-0 border-b border-gray-200 p-5 md:p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg bg-linear-to-r from-[#7a1c1c] to-[#5a1414]">
            📚
          </div>
          <div>
            <h2 className="font-bold text-lg">SNK Portal</h2>
            <p className="text-xs text-gray-600">
              {user?.name || roleLabel}
            </p>
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <Suspense fallback={<nav className="flex-1" />}>
        <SidebarNavItems
          menuItems={menuItems}
          pathname={pathname}
          admissionOpen={admissionOpen}
          setAdmissionOpen={setAdmissionOpen}
          handleLinkClick={handleLinkClick}
        />
      </Suspense>

      {/* FOOTER */}
      <div className="shrink-0 border-t border-gray-200 p-5 text-center text-xs text-gray-600 md:p-6">
        <p>© 2026 SNK Portal</p>
        <p className="text-gray-500 mt-1">All Rights Reserved</p>
      </div>
    </aside>
  );
}