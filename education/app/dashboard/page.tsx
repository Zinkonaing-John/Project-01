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
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import Link from "next/link";

export default function DashboardPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
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
      async (event, session) => {
        setSession(session);
        console.log("Auth state changed:", event, session);
        if (!session) {
          router.push("/auth/login");
        } else {
          await fetchUserProfile(session.user.id);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const fetchUserProfile = async (authId: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", authId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      router.push("/auth/login");
      return;
    }

    setUserProfile(data);
    await fetchClasses(data.id);
  };

  const fetchClasses = async (userId: string) => {
    setLoading(true);
    console.log("Fetching classes for user:", userId);

    // Fetch classes where user is teacher
    const { data: teacherClasses, error: teacherError } = await supabase
      .from("classes")
      .select(
        `
        *,
        teacher:users(*)
      `
      )
      .eq("teacher_id", userId);

    // Fetch classes where user is enrolled as student
    const { data: studentClasses, error: studentError } = await supabase
      .from("enrollments")
      .select(
        `
        class:classes(
          *,
          teacher:users(*)
        )
      `
      )
      .eq("student_id", userId);

    if (teacherError || studentError) {
      console.error("Error fetching classes:", teacherError || studentError);
    } else {
      const teacherClassList = teacherClasses || [];
      const studentClassList = (studentClasses || []).map(
        (enrollment: any) => enrollment.class
      );

      // Combine and remove duplicates
      const allClasses = [...teacherClassList, ...studentClassList];
      const uniqueClasses = allClasses.filter(
        (classItem, index, self) =>
          index === self.findIndex((c) => c.id === classItem.id)
      );

      console.log("Fetched classes:", uniqueClasses);
      setClasses(uniqueClasses);
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

  if (!session || !userProfile) {
    return null;
  }

  const handleCreateClass = async () => {
    if (!newClassName || !userProfile) return;
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data, error } = await supabase.from("classes").insert([
      {
        name: newClassName,
        description: newClassDescription,
        teacher_id: userProfile.id,
        join_code: joinCode,
      },
    ]);
    if (error) {
      console.error("Error creating class:", error);
    } else {
      fetchClasses(userProfile.id);
      setCreateModalOpen(false);
      setNewClassName("");
      setNewClassDescription("");
    }
  };

  const handleJoinClass = async () => {
    if (!joinCode || !userProfile) return;
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
      .insert([{ class_id: classData.id, student_id: userProfile.id }]);

    if (enrollmentError) {
      console.error("Error joining class:", enrollmentError);
    } else {
      fetchClasses(userProfile.id);
      setJoinModalOpen(false);
      setJoinCode("");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Welcome, {userProfile.name}!
          </h1>
          <p className="text-gray-600">Role: {userProfile.role}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {userProfile.role === "teacher" && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            >
              Create Class
            </button>
          )}
          <button
            onClick={() => setJoinModalOpen(true)}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            Join Class
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">
              No classes yet. Create or join a class to get started!
            </p>
          </div>
        ) : (
          classes.map((c) => (
            <Link key={c.id} href={`/dashboard/class/${c.id}`}>
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
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
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
                    <p className="text-sm text-blue-100">
                      {c.teacher?.name || "Unknown Teacher"}
                    </p>
                  </div>
                </div>
                <CardContent className="flex-grow p-4">
                  <p className="text-gray-600 mb-2">
                    {c.description || "No description"}
                  </p>
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
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
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
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-folder"
                    >
                      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 8 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
                    </svg>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))
        )}
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
