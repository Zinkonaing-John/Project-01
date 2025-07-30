"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, LogIn, UserPlus } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex flex-col items-center justify-center px-4">
      {/* Hero Section */}
      <section className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-10 py-16 animate-fade-in">
        <div className="flex-1 flex flex-col items-start">
          <h1 className="text-5xl md:text-6xl font-extrabold text-blue-900 mb-6 leading-tight drop-shadow-lg">
            Empower Your <span className="text-indigo-600">Learning</span>
            <br />
            With <span className="text-blue-600">Modern Tools</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-md">
            A simple, powerful education platform for teachers and students.
            Organize classes, share materials, and collaborate—all in one place.
          </p>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <LogIn className="w-5 h-5" /> Login
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-600 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <UserPlus className="w-5 h-5" /> Sign Up
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8 mt-10 mb-4">
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center border-t-4 border-blue-500 animate-fade-in-up delay-100">
          <span className="text-blue-600 mb-2">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 20h9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M3 20V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M16 2v4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M8 2v4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <h3 className="font-bold text-lg mb-1">Organize Classes</h3>
          <p className="text-gray-600 text-sm">
            Create, join, and manage classes with ease. Everything in one place.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center border-t-4 border-indigo-500 animate-fade-in-up delay-200">
          <span className="text-indigo-600 mb-2">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 20v-6m0 0V4m0 10-3.5-3.5M12 14l3.5-3.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <h3 className="font-bold text-lg mb-1">Share Materials</h3>
          <p className="text-gray-600 text-sm">
            Upload files, share links, and keep resources accessible for
            everyone.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center border-t-4 border-green-500 animate-fade-in-up delay-300">
          <span className="text-green-600 mb-2">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
              <path
                d="M17 10V7a5 5 0 0 0-10 0v3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <rect
                width="20"
                height="12"
                x="2"
                y="10"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </span>
          <h3 className="font-bold text-lg mb-1">Collaborate & Succeed</h3>
          <p className="text-gray-600 text-sm">
            Announcements, assignments, and feedback—built for student success.
          </p>
        </div>
      </section>

      {/* Animations */}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 1s ease;
        }
        .animate-fade-in-up {
          animation: fadeInUp 1s ease;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
