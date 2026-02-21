"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import AuthCard from "./AuthCard";
import {
  RegisterInput,
  registerSchema,
} from "@/src/lib/validators/auth.schema";

export default function RegisterForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        setError("root", { message: err.message || "Signup failed" });
        return;
      }

      const loginRes = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (loginRes?.error) {
        setError("root", { message: "Login after signup failed" });
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("root", {
        message: "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <AuthCard title="Create Account" subtitle="Start your personalized nutrition journey.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="Email address"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-rose-400 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-rose-400 mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <input
            type="password"
            placeholder="Confirm password"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-rose-400 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {errors.root && (
          <p className="text-sm text-rose-400">{errors.root.message}</p>
        )}

        <button
          disabled={isSubmitting}
          className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
        >
          {isSubmitting ? "Creating account..." : "Create Account"}
        </button>

        <p className="text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-300 hover:text-emerald-200 font-semibold">
            Log in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
