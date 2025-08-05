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
import { useState, useEffect } from "react";
import { useSidebar } from "./SidebarContext";
import { supabase } from "../../../lib/supabase";
import { User } from "@supabase/supabase-js";

export default function Sidebar() {
  const [isTeachingOpen, setIsTeachingOpen] = useState(true);
  const [isEnrolledOpen, setIsEnrolledOpen] = useState(true);
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserAndClasses = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, role')
          .eq('auth_id', user.id)
          .single();

        if (userError) {
          console.error('Error fetching user role:', userError);
          return;
        }

        setUserRole(userData.role);

        if (userData.role === 'teacher') {
          const { data: classesData, error: classesError } = await supabase
            .from('classes')
            .select('id, name')
            .eq('teacher_id', userData.id);

          if (classesError) {
            console.error('Error fetching teacher classes:', classesError);
            return;
          }
          setTeacherClasses(classesData);
        }
      }
    };

    fetchUserAndClasses();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
          fetchUserAndClasses(); // Re-fetch on auth state change
        } else {
          setUser(null);
          setUserRole(null);
          setTeacherClasses([]);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

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
            href="/dashboard"
            className="flex items-center space-x-3 p-3 rounded-full bg-blue-100 text-blue-700 font-semibold transition-colors duration-200"
          >
            <Home size={20} />
            <span>Home</span>
          </Link>
          <Link
            href="/dashboard/calendar"
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
            <span>AI Tools</span>
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
            {isTeachingOpen && userRole === 'teacher' && (
              <div className="pl-6 mt-2 space-y-1">
                {teacherClasses.map((cls) => (
                  <Link
                    key={cls.id}
                    href={`/dashboard/class/${cls.id}`}
                    className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-100 text-gray-700 transition-colors duration-200"
                    onClick={closeSidebar}
                  >
                    <span>{cls.name}</span>
                  </Link>
                ))}
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
                
              </div>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}
