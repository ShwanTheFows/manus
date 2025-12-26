"use client";
import { Menu, Bell, Sun } from "lucide-react";
import { signOut } from "next-auth/react";
import { Dispatch, SetStateAction } from "react";
import Image from "next/image"; // ✅ import Next.js Image component

export function Navbar({ setIsSidebarOpen }: { setIsSidebarOpen: Dispatch<SetStateAction<boolean>> }) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white px-4 sm:px-6 py-4 shadow-sm z-50 border-b border-gray-200 transition-colors">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center ml-8 md:ml-12">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors mr-2"
            onClick={() => setIsSidebarOpen(prev => !prev)}
          >
            <Menu className="w-5 h-5 text-gray-600" />
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
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Sun className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() =>
              signOut({
                callbackUrl: "/auth",
              })
            }
            className="w-8 h-8 bg-teal-500 rounded-full text-white font-bold flex items-center justify-center text-xs hover:bg-teal-600 transition-colors"
          >
            Y3
          </button>
        </div>
      </div>
    </header>
  );
}
