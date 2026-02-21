"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/src/lib/utils";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 text-sm font-bold">NG</span>
            <span className="font-bold text-xl bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
              NutriGenie
            </span>
          </Link>

          {session?.user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/health-profile"
                className="text-sm text-slate-300 hover:text-white transition-colors"
              >
                Health Profile
              </Link>
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium text-slate-100">
                  {session.user?.name || "User"}
                </span>
                <span className="text-xs text-slate-400">
                  {session.user?.email}
                </span>
              </div>

              <button
                onClick={() => signOut()}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  "bg-rose-500 text-white hover:bg-rose-600"
                )}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium bg-emerald-500 text-slate-950 rounded-lg hover:bg-emerald-400 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
