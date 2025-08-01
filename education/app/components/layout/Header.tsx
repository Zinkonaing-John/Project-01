"use client";

import Link from "next/link";
import { Menu, Plus, LayoutGrid, User } from "lucide-react";
import { useSidebar } from "./SidebarContext";

export default function Header() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-3">
        <button 
          onClick={toggleSidebar}
          className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors duration-200"
        >
          <Menu size={24} />
        </button>
        <Link href="/" className="flex items-center space-x-2">
          {/* Placeholder for Classroom icon - replace with actual image */}
          <div className="w-8 h-8 flex items-center justify-center">
            <img src="/window.svg" alt="Classroom Icon" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-semibold text-gray-800">Classroom</span>
        </Link>
      </div>
      <div className="flex items-center space-x-2">
        <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors duration-200">
          <Plus size={24} />
        </button>
        <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors duration-200">
          <LayoutGrid size={24} />
        </button>
        <button className="rounded-full overflow-hidden w-9 h-9 bg-gray-200 flex items-center justify-center border border-gray-300">
          {/* Placeholder for user avatar - replace with actual image */}
          <User size={20} className="text-gray-600" />
        </button>
      </div>
    </header>
  );
}
