"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { OnboardingInput, onboardingSchema } from "@/src/lib/validators/user.schema";
import { updateUserProfile } from "@/src/lib/actions/user.actions";
import { useSession } from "next-auth/react";

export default function OnboardingPage() {
    const router = useRouter();
    const { update } = useSession();
    const [error, setError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<OnboardingInput>({
        resolver: zodResolver(onboardingSchema) as never,
    });

    const onSubmit = async (data: OnboardingInput) => {
        setError("");
        try {
            const result = await updateUserProfile(data);

            if (result.error) {
                setError(result.error);
                return;
            }

            await update();
            router.push("/dashboard");
            router.refresh();
        } catch {
            setError("An unexpected error occurred");
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/20">
                <h1 className="text-3xl font-black mb-2 text-slate-100">Welcome to NutriGenie</h1>
                <p className="text-slate-400 mb-8">
                    Let us personalize your experience. Tell us a bit about yourself.
                </p>

                {error && (
                    <div className="bg-rose-900/20 border border-rose-800 text-rose-300 p-3 rounded-xl mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Age
                            </label>
                            <input
                                type="number"
                                {...register("age")}
                                className="w-full border border-slate-700 bg-slate-950 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/40 outline-none"
                                placeholder="e.g. 25"
                            />
                            {errors.age && (
                                <p className="text-sm text-rose-400 mt-1">{errors.age.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Height (cm)
                            </label>
                            <input
                                type="number"
                                {...register("height")}
                                className="w-full border border-slate-700 bg-slate-950 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/40 outline-none"
                                placeholder="e.g. 175"
                            />
                            {errors.height && (
                                <p className="text-sm text-rose-400 mt-1">{errors.height.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Gender
                        </label>
                        <select
                            {...register("gender")}
                            className="w-full border border-slate-700 bg-slate-950 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/40 outline-none"
                        >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                        {errors.gender && (
                            <p className="text-sm text-rose-400 mt-1">
                                {errors.gender.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Dietary Preference
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {["veg", "non-veg", "vegan"].map((type) => (
                                <label
                                    key={type}
                                    className="flex items-center justify-center space-x-2 border border-slate-700 bg-slate-950 p-3 rounded-xl cursor-pointer hover:border-emerald-500/50"
                                >
                                    <input
                                        type="radio"
                                        value={type}
                                        {...register("foodPreference")}
                                        className="text-emerald-500 focus:ring-emerald-500"
                                    />
                                    <span className="capitalize text-sm">{type}</span>
                                </label>
                            ))}
                        </div>
                        {errors.foodPreference && (
                            <p className="text-sm text-rose-400 mt-1">
                                {errors.foodPreference.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Preferred Cuisine
                        </label>
                        <select
                            {...register("cuisinePreference")}
                            className="w-full border border-slate-700 bg-slate-950 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/40 outline-none"
                        >
                            <option value="">Select cuisine</option>
                            <option value="indian">Indian</option>
                            <option value="western">Western</option>
                            <option value="mixed">Mixed</option>
                        </select>
                        {errors.cuisinePreference && (
                            <p className="text-sm text-rose-400 mt-1">
                                {errors.cuisinePreference.message}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-emerald-500 text-slate-950 py-3 rounded-xl font-bold hover:bg-emerald-400 transition disabled:opacity-50"
                    >
                        {isSubmitting ? "Saving Profile..." : "Complete Setup"}
                    </button>
                </form>
            </div>
        </div>
    );
}
