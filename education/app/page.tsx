
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-8">Welcome to the Education Platform</h1>
      <div className="flex gap-4">
        <Link href="/login" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Login
        </Link>
        <Link href="/signup" className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
          Sign Up
        </Link>
      </div>
    </div>
  );
}
