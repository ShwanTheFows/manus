"use client";
import { useState } from "react";
import { Sidebar } from "@/src/app/components/sidebar";
import { Navbar } from "@/src/app/components/navbar";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <Sidebar isOpen={isSidebarOpen} />
      <div className="lg:pl-[280px]">
        <Navbar setIsSidebarOpen={setIsSidebarOpen} />
        <main className="min-h-[calc(100vh-5rem)] pt-16 bg-gray-50 px-4 py-6 sm:px-6 md:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
