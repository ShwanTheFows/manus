"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, FileText, BarChart2, User, Settings } from "lucide-react";

export function Sidebar({ isOpen }: { isOpen: boolean }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Tableau de bord", icon: <BookOpen size={24} />, href: "/dashboard" },
    { name: "QCMs", icon: <FileText size={24} />, href: "/dashboard/qcm" },
    { name: "Progression", icon: <BarChart2 size={24} />, href: "#" },
    { name: "Profil", icon: <User size={24} />, href: "#" },
    { name: "Paramètres", icon: <Settings size={24} />, href: "#" },
  ];

  return (
    <aside className={`fixed left-0 top-0 z-40 h-screen w-[280px] transform border-r border-gray-100 bg-white pt-16 transition-transform duration-300 
      ${isOpen ? "translate-x-0" : "-translate-x-full"} 
      lg:translate-x-0`}>
      <div className="px-6 py-6 flex-1 flex flex-col">
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            // Compare exactement le pathname avec le href de chaque item
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-5 py-4 rounded-lg text-base font-medium transition-all ${
                  isActive
                    ? "bg-teal-50 text-teal-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-teal-600"
                }`}
              >
                <span className={`${isActive ? 'text-teal-600' : 'text-gray-400'}`}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
