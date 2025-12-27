"use client";
import { Menu, Bell, Sun, LogOut, Settings, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Dispatch, SetStateAction, useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface UserData {
  firstname: string;
  lastname: string;
  email: string;
  profilePicture?: string;
}

export function Navbar({ setIsSidebarOpen }: { setIsSidebarOpen: Dispatch<SetStateAction<boolean>> }) {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user data from database
  useEffect(() => {
    if (session?.user?.email) {
      fetchUserData();
    }
  }, [session]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/profile");
      if (!response.ok) throw new Error("Failed to fetch user data");
      const data: UserData = await response.json();
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

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

  // Get user initials from database data or session
  const getInitials = () => {
    if (userData) {
      return `${userData.firstname?.[0] || ""}${userData.lastname?.[0] || ""}`.toUpperCase();
    }
    if (session?.user?.name) {
      return session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    return "U";
  };

  // Get user name from database data or session
  const getUserName = () => {
    if (userData) {
      return `${userData.firstname || ""} ${userData.lastname || ""}`.trim();
    }
    return session?.user?.name || "Utilisateur";
  };

  // Get user email from database data or session
  const getUserEmail = () => {
    return userData?.email || session?.user?.email || "";
  };

  // Get profile picture from database data or session
  const getProfilePicture = () => {
    return userData?.profilePicture || session?.user?.image;
  };

  const userInitials = getInitials();
  const userName = getUserName();
  const userEmail = getUserEmail();
  const profilePicture = getProfilePicture();

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
              {profilePicture ? (
                <div className="relative w-8 h-8">
                  <Image
                    src={profilePicture}
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
                    {profilePicture ? (
                      <div className="relative w-12 h-12">
                        <Image
                          src={profilePicture}
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
                    onClick={() => {
                      setIsDropdownOpen(false);
                      // Refresh user data when navigating to profile
                      setTimeout(() => fetchUserData(), 100);
                    }}
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
