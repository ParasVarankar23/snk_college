"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaAddressBook,
  FaAward,
  FaBook,
  FaCalendar,
  FaChalkboardUser,
  FaChevronDown,
  FaCircleUser,
  FaGear,
  FaImages,
  FaMessage,
} from "react-icons/fa6";

// eslint-disable-next-line react/prop-types
export default function Sidebar({ setSidebarOpen }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
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
      name: "Contact",
      icon: FaAddressBook,
      path: "/admin/contact",
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
        { name: "Declaration", section: "declaration" },
      ],
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
      className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col transition-all bg-white border-r border-gray-200"
    >
      {/* HEADER */}
      <div className="sticky top-0 p-6 border-b border-gray-200">
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
      <nav className="flex-1 px-3 py-5 space-y-2">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = pathname.startsWith(item.path || "");
          const hasChildren = Array.isArray(item.children) && item.children.length > 0;

          if (hasChildren) {
            return (
              <div key={item.name} className="space-y-2">
                <button
                  type="button"
                  onClick={() => setAdmissionOpen((prev) => !prev)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left font-medium text-[15px] transition ${isActive
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
              href={item.path}
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

      {/* FOOTER */}
      <div className="p-6 border-t border-gray-200 text-gray-600 text-xs text-center">
        <p>© 2026 SNK Portal</p>
        <p className="text-gray-500 mt-1">All Rights Reserved</p>
      </div>
    </aside>
  );
}