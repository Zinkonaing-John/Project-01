"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function DashboardPage() {
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setJoinModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassDescription, setNewClassDescription] = useState("");
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        console.log("Auth state changed:", event, session);
        if (!session) {
          router.push("/login");
        } else {
          fetchClasses(session.user.id);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]); // Ensure router is included in the dependency array

  const fetchClasses = async (userId: string) => {
    setLoading(true);
    console.log("Fetching classes for user:", userId);
    const { data, error } = await supabase
      .from("classes")
      .select(
        `
        *,
        teacher:users(*)
      `
      )
      .or(`teacher_id.eq.${userId},enrollments.student_id.eq.${userId}`);

    if (error) {
      console.error("Error fetching classes:", error);
    } else {
      console.log("Fetched classes:", data);
      setClasses(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading...
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleCreateClass = async () => {
    if (!newClassName || !session) return;
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data, error } = await supabase.from("classes").insert([
      {
        name: newClassName,
        description: newClassDescription,
        teacher_id: session.user.id,
        join_code: joinCode,
      },
    ]);
    if (error) {
      console.error("Error creating class:", error);
    } else {
      fetchClasses(session.user.id);
      setCreateModalOpen(false);
      setNewClassName("");
      setNewClassDescription("");
    }
  };

  const handleJoinClass = async () => {
    if (!joinCode || !session) return;
    const { data: classData, error: classError } = await supabase
      .from("classes")
      .select("id")
      .eq("join_code", joinCode)
      .single();

    if (classError || !classData) {
      console.error("Error finding class:", classError);
      return;
    }

    const { error: enrollmentError } = await supabase
      .from("enrollments")
      .insert([{ class_id: classData.id, student_id: session.user.id }]);

    if (enrollmentError) {
      console.error("Error joining class:", enrollmentError);
    } else {
      fetchClasses(session.user.id);
      setJoinModalOpen(false);
      setJoinCode("");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4 sm:mb-0">
          Your Classes
        </h1>
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            Create Class
          </button>
          <button
            onClick={() => setJoinModalOpen(true)}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            Join Class
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((c) => (
          <Link key={c.id} href={`/class/${c.id}`}>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300 ease-in-out h-full flex flex-col overflow-hidden rounded-lg">
              <div className="h-24 w-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-start p-4 relative">
                <div className="absolute top-2 right-2 flex space-x-1">
                  <span className="text-white text-opacity-80">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="lucide lucide-ellipsis-vertical"
                    >
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  </span>
                </div>
                <div className="flex flex-col">
                  <CardTitle className="text-xl font-bold text-white">
                    {c.name}
                  </CardTitle>
                  <p className="text-sm text-blue-100">{c.teacher.name}</p>
                </div>
              </div>
              <CardContent className="flex-grow p-4">
                <p className="text-gray-600 mb-2">{c.description}</p>
              </CardContent>
              <CardFooter className="flex justify-end p-4 border-t border-gray-200">
                <div className="flex space-x-2 text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-line-chart"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-folder"
                  >
                    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 8 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
                  </svg>
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Create Class</CardTitle>
              <CardDescription>
                Enter class details to create a new class.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="className">Class Name</Label>
                <Input
                  id="className"
                  placeholder="Class Name"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="p-3"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="classDescription">Class Description</Label>
                <textarea
                  id="classDescription"
                  placeholder="Class Description"
                  value={newClassDescription}
                  onChange={(e) => setNewClassDescription(e.target.value)}
                  className="border p-3 rounded-lg w-full focus:ring-blue-500 focus:border-blue-500 resize-y"
                  rows={4}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-3">
              <button
                onClick={() => setCreateModalOpen(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded-lg transition duration-300 ease-in-out"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateClass}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition duration-300 ease-in-out"
              >
                Create
              </button>
            </CardFooter>
          </Card>
        </div>
      )}

      {isJoinModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Join Class</CardTitle>
              <CardDescription>
                Enter the join code to join an existing class.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="joinCode">Join Code</Label>
                <Input
                  id="joinCode"
                  placeholder="Join Code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="p-3"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-3">
              <button
                onClick={() => setJoinModalOpen(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded-lg transition duration-300 ease-in-out"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinClass}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition duration-300 ease-in-out"
              >
                Join
              </button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
