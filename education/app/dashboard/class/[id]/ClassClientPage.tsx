"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";

interface ClassClientPageProps {
  id: string;
}

interface ClassDetails {
  id: string;
  name: string;
  description: string;
  join_code: string;
}

export default function ClassClientPage({ id }: ClassClientPageProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [copySuccess, setCopySuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchSessionAndClass = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (!session) {
        router.push("/auth/login");
        return;
      }

      const { data, error } = await supabase
        .from("classes")
        .select("id, name, description, join_code")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching class details:", error);
        // Handle error, maybe redirect or show a message
      } else if (data) {
        setClassDetails(data);
      }
      setLoading(false);
    };

    fetchSessionAndClass();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (!session) {
          router.push("/auth/login");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [id, router]);

  const handleCopy = async () => {
    if (classDetails?.join_code) {
      try {
        await navigator.clipboard.writeText(classDetails.join_code);
        setCopySuccess("Copied!");
        setTimeout(() => setCopySuccess(""), 2000);
      } catch (err) {
        console.error("Failed to copy: ", err);
        setCopySuccess("Failed to copy!");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!classDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Class not found or you do not have access.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{classDetails.name}</h1>
          <p className="text-gray-600">{classDetails.description}</p>
          <div className="mt-4 flex items-center space-x-2">
            <p className="text-lg font-semibold text-gray-800">Join Code: {classDetails.join_code}</p>
            <button
              onClick={handleCopy}
              className="p-2 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors duration-200 flex items-center space-x-1"
            >
              <Copy size={16} />
              <span>{copySuccess || "Copy"}</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Class Content</h2>
          <p className="text-gray-700">
            This is a placeholder for the class content.
          </p>
        </div>
      </div>
    </div>
  );
}