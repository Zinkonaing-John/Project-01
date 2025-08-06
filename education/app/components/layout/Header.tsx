"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, Plus, LayoutGrid, User, LogOut } from "lucide-react";
import { useSidebar } from "./SidebarContext";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function Header() {
  console.log("Header component rendering");
  const { toggleSidebar } = useSidebar();
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('name, email')
          .eq('auth_id', user.id)
          .single();

        if (error) {
          console.error("Error fetching user data:", error);
        } else if (userData) {
          setUserName(userData.name);
          setUserEmail(userData.email);
        }
      }
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          fetchUser();
        } else {
          setUserName(null);
          setUserEmail(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
    } else {
      router.push("/auth/login");
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm relative z-51">
      <div className="flex items-center space-x-3">
        <button 
          onClick={toggleSidebar}
          className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors duration-200"
        >
          <Menu size={24} />
        </button>
        <Link href="/dashboard" className="flex items-center space-x-2">
          {/* Placeholder for Classroom icon - replace with actual image */}
          <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600">EduHub</h1>
              </div>
        </Link>
      </div>
      <div className="flex items-center space-x-2">
        {userName && <span className="text-gray-700 font-medium hidden sm:block">{userName}</span>}
        <button 
          onClick={() => setIsSliderOpen(true)}
          className="rounded-full overflow-hidden w-9 h-9 bg-gray-200 flex items-center justify-center border border-gray-300"
        >
          {/* Placeholder for user avatar - replace with actual image */}
          <User size={20} className="text-gray-600" />
        </button>
      </div>

      {/* User Info Slider */}
      {isSliderOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSliderOpen(false)}
        >
          <div
            className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg p-6 transform transition-transform duration-300 ease-in-out
              ${
                isSliderOpen ? "translate-x-0" : "translate-x-full"
              }`}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside slider
          >
            <h2 className="text-xl font-bold mb-4">User Profile</h2>
            {userName && <p className="text-gray-700"><strong>Name:</strong> {userName}</p>}
            {userEmail && <p className="text-gray-700"><strong>Email:</strong> {userEmail}</p>}

            <button
              onClick={handleLogout}
              className="mt-6 w-full flex items-center justify-center space-x-2 p-3 rounded-md bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors duration-200"
            >
              <LogOut size={20} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
