"use client";
import { Menu, Bell, Sun, Moon } from "lucide-react";
import { signOut } from "next-auth/react";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import Image from "next/image"; // ✅ import Next.js Image component
import { useTheme } from "./ThemeProvider";

export function Navbar({ setIsSidebarOpen }: { setIsSidebarOpen: Dispatch<SetStateAction<boolean>> }) {
  const { theme, setTheme, isDark } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("auto");
    } else {
      setTheme("light");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 px-4 sm:px-6 py-4 shadow-sm z-50 border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center ml-8 md:ml-12">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mr-2"
            onClick={() => setIsSidebarOpen(prev => !prev)}
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="relative w-24 sm:w-28 h-10"> {/* set a container for Image */}
            <Image
              src="/assets/imgs/logo-qmed.png"
              alt="Logo"
              fill // makes image fill the container
              className="object-contain"
              priority // optional: preloads the image for LCP
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 mr-8 md:mr-12">
          {mounted && (
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group relative"
              title={`Theme: ${theme}`}
            >
              {isDark ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-yellow-400" />
              ) : (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
              <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {theme === "light" ? "Light" : theme === "dark" ? "Dark" : "Auto"}
              </span>
            </button>
          )}
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() =>
              signOut({
                callbackUrl: "/auth",
              })
            }
            className="w-8 h-8 bg-teal-500 dark:bg-teal-600 rounded-full text-white font-bold flex items-center justify-center text-xs hover:bg-teal-600 dark:hover:bg-teal-700 transition-colors"
          >
            Y3
          </button>
        </div>
      </div>
    </header>
  );
}
