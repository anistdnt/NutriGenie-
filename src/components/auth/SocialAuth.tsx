"use client";

import { signIn } from "next-auth/react";

export default function SocialAuth() {
  return (
    <div className="space-y-4 w-full max-w-md">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-800" />
        <span className="text-xs text-slate-500 uppercase tracking-wide">
          Or continue with
        </span>
        <div className="flex-1 h-px bg-slate-800" />
      </div>

      <button
        type="button"
        onClick={() => signIn("google")}
        className="w-full flex items-center justify-center gap-3 border border-slate-700 bg-slate-900 text-slate-200 py-2.5 rounded-xl font-medium transition hover:bg-slate-800 active:scale-[0.98]"
      >
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path
            fill="#EA4335"
            d="M24 9.5c3.2 0 5.4 1.4 6.6 2.5l4.8-4.8C32.4 4.4 28.6 2.5 24 2.5 14.9 2.5 7.3 8.6 4.5 16.8l5.9 4.6C12 15 17.5 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.1 24.5c0-1.6-.1-2.8-.4-4H24v7.6h12.5c-.3 2-1.7 5-4.9 7.1l7.5 5.8c4.4-4.1 7-10.2 7-16.5z"
          />
          <path
            fill="#FBBC05"
            d="M10.4 28.4c-.5-1.4-.8-2.9-.8-4.4s.3-3 .8-4.4l-5.9-4.6C3.1 17.6 2.5 21 2.5 24.5s.6 6.9 2 9.9l5.9-6z"
          />
          <path
            fill="#34A853"
            d="M24 46.5c6.6 0 12.1-2.2 16.1-6l-7.5-5.8c-2 1.4-4.6 2.4-8.6 2.4-6.5 0-12-5.5-13.6-13l-5.9 4.6C7.3 39.4 14.9 46.5 24 46.5z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>
    </div>
  );
}
