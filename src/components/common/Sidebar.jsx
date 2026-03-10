"use client";

import { useAuth } from "@/hooks/useAuth";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
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
  const [expandedMenu, setExpandedMenu] = useState(null);

  const toggleMenu = (menuName) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName);
  };

  const handleLinkClick = () => {
    setSidebarOpen?.(false);
  };

  const menuItems = [
    {
      name: "Academics",
      icon: FaChalkboardUser,
      submenu: [
        { label: "11th Arts", path: "/academics/11th-arts" },
        { label: "11th Commerce", path: "/academics/11th-commerce" },
        { label: "11th Science", path: "/academics/11th-science" },
        { label: "12th Arts", path: "/academics/12th-arts" },
        { label: "12th Commerce", path: "/academics/12th-commerce" },
        { label: "12th Science", path: "/academics/12th-science" },
      ],
    },
    {
      name: "Departments",
      icon: FaBook,
      submenu: [
        { label: "Arts", path: "/departments/arts" },
        { label: "Commerce", path: "/departments/commerce" },
        { label: "Science", path: "/departments/science" },
      ],
    },
    {
      name: "Facilities",
      icon: FaChalkboardUser,
      submenu: [
        { label: "Library", path: "/facilities/library" },
        { label: "Computer Lab", path: "/facilities/computer" },
        { label: "Laboratory", path: "/facilities/laboratory" },
        { label: "Sports", path: "/facilities/sports" },
      ],
    },
    {
      name: "Events",
      icon: FaCalendar,
      submenu: [
        { label: "Annual Day", path: "/events/annualday" },
        { label: "Cultural", path: "/events/cultural" },
        { label: "Science Exhibition", path: "/events/scienceexhibition" },
        { label: "Picnic", path: "/events/picinic" },
      ],
    },
    {
      name: "Achievements",
      icon: FaAward,
      submenu: [
        { label: "Academic", path: "/achievements/academic" },
        { label: "Sports", path: "/achievements/sports" },
        { label: "Awards", path: "/achievements/awards" },
      ],
    },
    {
      name: "Gallery",
      icon: FaImages,
      path: "/gallery",
    },
    {
      name: "Feedback",
      icon: FaMessage,
      path: "/contact",
    },
  ];

  return (
    <aside
      className="w-64 h-screen overflow-y-auto flex flex-col transition-all bg-white border-r border-gray-200"
    >
      {/* HEADER */}
      <div className="sticky top-0 p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg bg-gradient-to-r from-[#7a1c1c] to-[#5a1414]">
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
          // eslint-disable-next-line complexity
          const IconComponent = item.icon;
          const isActive = pathname.startsWith(item.path || "");
          const isExpanded = expandedMenu === item.name;

          return (
            <div key={item.name}>
              {item.submenu ? (
                /* EXPANDABLE MENU ITEM */
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition ${isExpanded
                    ? "bg-[#7a1c1c]/10 text-[#7a1c1c]"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent size={18} />
                    <span>{item.name}</span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`transition transform ${isExpanded ? "rotate-180" : ""
                      }`}
                  />
                </button>

                /* SUBMENU ITEMS */
              ) : (
                /* SIMPLE MENU ITEM (NO SUBMENU) */
                <Link
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
              )}

              {/* SUBMENU DROPDOWN */}
              {item.submenu && isExpanded && (
                <div className="mt-2 ml-4 space-y-1 border-l-2 border-[#7a1c1c]/30 pl-4">
                  {item.submenu.map((subitem) => (
                    <Link
                      key={subitem.path}
                      href={subitem.path}
                      onClick={handleLinkClick}
                      className={`block px-4 py-2 rounded-lg text-sm font-medium transition ${pathname === subitem.path
                        ? "bg-[#7a1c1c]/10 text-[#7a1c1c]"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                    >
                      → {subitem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
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