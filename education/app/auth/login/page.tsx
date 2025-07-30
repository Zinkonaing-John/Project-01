"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
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
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous errors
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setErrorMessage(error.message);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg rounded-lg">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold text-gray-800">Login</CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Enter your email below to login to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {errorMessage && (
            <p className="text-red-600 text-sm text-center bg-red-100 p-2 rounded-md">
              {errorMessage}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col pt-4">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105" onClick={handleLogin}>
            Sign in
          </Button>
          <div className="mt-5 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-blue-600 hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
