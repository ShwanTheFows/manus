"use client";
import { Menu, Bell, Sun, LogOut, Settings, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Dispatch, SetStateAction, useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export function Navbar({ setIsSidebarOpen }: { setIsSidebarOpen: Dispatch<SetStateAction<boolean>> }) {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const userEmail = session?.user?.email || "";
  const userName = session?.user?.name || "Utilisateur";

  return (
    <header className="fixed top-0 left-0 right-0 bg-white px-4 sm:px-6 py-4 shadow-sm z-50 border-b border-gray-200 transition-colors">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center ml-8 md:ml-12">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors mr-2"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="relative w-24 sm:w-28 h-10">
            <Image
              src="/assets/imgs/logo-qmed.png"
              alt="Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 mr-8 md:mr-12">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Sun className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              {session?.user?.image ? (
                <div className="relative w-8 h-8">
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full text-white font-bold flex items-center justify-center text-xs">
                  {userInitials}
                </div>
              )}
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                {/* User Info Section */}
                <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-blue-50">
                  <div className="flex items-center gap-3">
                    {session?.user?.image ? (
                      <div className="relative w-12 h-12">
                        <Image
                          src={session.user.image}
                          alt="Profile"
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full text-white font-bold flex items-center justify-center text-sm">
                        {userInitials}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">
                        {userName}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {userEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-teal-600" />
                    <span className="text-sm font-medium">Mon profil</span>
                  </Link>

                  <Link
                    href="/dashboard/parametres"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Paramètres</span>
                  </Link>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Sign Out */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      signOut({
                        callbackUrl: "/auth",
                      });
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Déconnexion</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
