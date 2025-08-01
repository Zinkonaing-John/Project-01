"use client";

import Link from "next/link";
import {
  Home,
  Calendar,
  Gem,
  Book,
  ListTodo,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { useSidebar } from "./SidebarContext";

export default function Sidebar() {
  const [isTeachingOpen, setIsTeachingOpen] = useState(true);
  const [isEnrolledOpen, setIsEnrolledOpen] = useState(true);
  const { isSidebarOpen, closeSidebar } = useSidebar();

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white border-r border-gray-200 p-4 
          flex flex-col overflow-y-auto custom-scrollbar
          transform transition-transform duration-300 ease-in-out
          ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        <nav className="space-y-1">
          <Link
            href="/"
            className="flex items-center space-x-3 p-3 rounded-full bg-blue-100 text-blue-700 font-semibold transition-colors duration-200"
          >
            <Home size={20} />
            <span>Home</span>
          </Link>
          <Link
            href="#"
            className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-100 text-gray-700 transition-colors duration-200"
          >
            <Calendar size={20} />
            <span>Calendar</span>
          </Link>
          <Link
            href="#"
            className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-100 text-gray-700 transition-colors duration-200"
          >
            <Gem size={20} />
            <span>Gemini</span>
          </Link>

          <div className="pt-4 border-t border-gray-200 mt-4">
            <button
              onClick={() => setIsTeachingOpen(!isTeachingOpen)}
              className="w-full flex items-center justify-between p-3 rounded-full hover:bg-gray-100 text-gray-700 font-semibold transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <Book size={20} />
                <span>Teaching</span>
              </div>
              {isTeachingOpen ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
            {isTeachingOpen && (
              <div className="pl-6 mt-2 space-y-1">
                <Link
                  href="#"
                  className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-100 text-gray-700 text-sm transition-colors duration-200"
                >
                  <ListTodo size={18} />
                  <span>To review</span>
                </Link>
                {/* Placeholder for actual classes */}
                <Link
                  href="#"
                  className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-100 text-gray-700 text-sm transition-colors duration-200"
                >
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                    Y
                  </div>
                  <span>Year 4, T1 21/22</span>
                </Link>
                <Link
                  href="#"
                  className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-100 text-gray-700 text-sm transition-colors duration-200"
                >
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                    Y
                  </div>
                  <span>Y9 ICT</span>
                </Link>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200 mt-4">
            <button
              onClick={() => setIsEnrolledOpen(!isEnrolledOpen)}
              className="w-full flex items-center justify-between p-3 rounded-full hover:bg-gray-100 text-gray-700 font-semibold transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <Book size={20} />
                <span>Enrolled</span>
              </div>
              {isEnrolledOpen ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
            {isEnrolledOpen && (
              <div className="pl-6 mt-2 space-y-1">
                <Link
                  href="#"
                  className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-100 text-gray-700 text-sm transition-colors duration-200"
                >
                  <ListTodo size={18} />
                  <span>To-do</span>
                </Link>
                {/* Placeholder for actual classes */}
                <Link
                  href="#"
                  className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-100 text-gray-700 text-sm transition-colors duration-200"
                >
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                    Y
                  </div>
                  <span>Y5 -Scratch (Creating Games)</span>
                </Link>
                <Link
                  href="#"
                  className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-100 text-gray-700 text-sm transition-colors duration-200"
                >
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                    Y
                  </div>
                  <span>Y8 ICT</span>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}
