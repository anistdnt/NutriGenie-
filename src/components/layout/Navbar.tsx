"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { LogOut, UserCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/src/lib/utils";

const DEFAULT_AVATAR = "/default-avatar.svg";

const normalizeImageSrc = (value?: string | null) => {
  if (!value) return DEFAULT_AVATAR;
  if (value.startsWith("/")) return value;
  try {
    const parsed = new URL(value);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return value;
    }
    return DEFAULT_AVATAR;
  } catch {
    return DEFAULT_AVATAR;
  }
};

export default function Navbar() {
  const { data: session } = useSession();
  const profileImage = session?.user?.image;
  const [avatarSrc, setAvatarSrc] = useState(normalizeImageSrc(profileImage));
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setAvatarSrc(normalizeImageSrc(profileImage));
  }, [profileImage]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <span className="grid place-items-center w-9 h-9 overflow-hidden rounded-lg border border-emerald-300/35 bg-gradient-to-br from-emerald-400/30 via-cyan-400/25 to-teal-500/30 shadow-[0_0_20px_rgba(45,212,191,0.55)] transition-all duration-300 group-hover:shadow-[0_0_28px_rgba(45,212,191,0.8)]">
              <Image
                src="/logo.png"
                alt="NutriGenie logo"
                width={36}
                height={36}
                className="h-8 w-8 object-cover brightness-110 saturate-125 drop-shadow-[0_0_8px_rgba(45,212,191,0.85)]"
              />
            </span>
            <span className="font-bold text-xl bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
              NutriGenie
            </span>
          </Link>

          {session?.user ? (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium text-slate-100">
                  {session.user?.name || "User"}
                </span>
                <span className="text-xs text-slate-400">
                  {session.user?.email}
                </span>
              </div>
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="grid place-items-center w-10 h-10 overflow-hidden rounded-full border border-emerald-300/40 bg-slate-900/80 shadow-[0_0_16px_rgba(45,212,191,0.35)]"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <Image
                    src={avatarSrc}
                    alt="Profile image"
                    width={40}
                    height={40}
                    className="h-10 w-10 object-cover"
                    onError={() => setAvatarSrc(DEFAULT_AVATAR)}
                  />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-emerald-300/20 bg-slate-900/95 p-1.5 shadow-[0_18px_45px_rgba(0,0,0,0.45)] backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
                    <div className="mb-1 rounded-xl border border-slate-800/80 bg-slate-950/70 px-3 py-2">
                      <p className="truncate text-[11px] font-semibold text-slate-200">{session.user?.name || "User"}</p>
                      <p className="truncate text-[10px] text-slate-400">{session.user?.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800/90"
                    >
                      <UserCircle className="h-4 w-4 text-emerald-300" />
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => signOut()}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm",
                        "text-rose-200 hover:bg-rose-900/30"
                      )}
                    >
                      <LogOut className="h-4 w-4 text-rose-300" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
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
