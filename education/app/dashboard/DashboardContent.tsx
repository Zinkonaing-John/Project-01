"use client";

import { useSidebar } from "../components/layout/SidebarContext";
import Sidebar from "../components/layout/Sidebar";
import React from "react";

export default function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen } = useSidebar();

  return (
    <div className="flex flex-grow">
      <Sidebar />
      <main
        className={`flex-grow p-4 sm:px-6 lg:px-8 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-0"}`}
      >
        {children}
      </main>
    </div>
  );
}