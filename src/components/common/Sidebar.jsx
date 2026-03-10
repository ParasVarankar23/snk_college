"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaAddressBook,
  FaAward,
  FaBook,
  FaCalendar,
  FaChalkboardUser,
  FaImages,
  FaMessage,
} from "react-icons/fa6";

// eslint-disable-next-line react/prop-types
export default function Sidebar({ setSidebarOpen }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const handleLinkClick = () => {
    setSidebarOpen?.(false);
  };

  const menuItems = [
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

  return (
    <aside
      className="w-64 h-screen overflow-y-auto flex flex-col transition-all bg-white border-r border-gray-200"
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
              {user?.name || "Student/Staff"}
            </p>
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = pathname.startsWith(item.path || "");

          return (
            <Link
              key={item.name}
              href={item.path}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${isActive
                ? "bg-[#7a1c1c]/10 text-[#7a1c1c]"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
            >
              <IconComponent size={18} />
              <span>{item.name}</span>
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