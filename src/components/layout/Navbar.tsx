"use client";

import Link from "next/link";
import { ThemeToggle } from "@/src/components/ui/ThemeToggle";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/src/lib/utils";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <span className="text-2xl">🥗</span>
            <span className="font-bold text-xl bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
              NutriGenie
            </span>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {session?.user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/health-profile"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  Health Profile
                </Link>
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {session.user?.name || "User"}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {session.user?.email}
                  </span>
                </div>

                <button
                  onClick={() => signOut()}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    "bg-red-500 text-white hover:bg-red-600"
                  )}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-90 transition-opacity"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
