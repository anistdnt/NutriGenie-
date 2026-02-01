"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="w-full px-6 py-4 border-b flex items-center justify-between">
      {/* Left */}
      <Link href="/dashboard" className="font-semibold text-lg">
        Nutrigenie
      </Link>

      {/* Right */}
      <div className="flex items-center gap-4">
        {status === "loading" ? null : session ? (
          <>
            <span className="text-sm text-gray-600">
              {session.user?.email}
            </span>

            <button
              onClick={() =>
                signOut({
                  callbackUrl: "/login",
                })
              }
              className="px-4 py-1 rounded bg-red-500 text-white text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
