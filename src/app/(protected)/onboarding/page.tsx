"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { OnboardingInput, onboardingSchema } from "@/src/lib/validators/user.schema";
import { updateUserProfile } from "@/src/lib/actions/user.actions";
import { useSession } from "next-auth/react";

const GENDER_OPTIONS: Array<{ value: OnboardingInput["gender"]; label: string }> = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
];

const FOOD_OPTIONS: Array<{ value: OnboardingInput["foodPreference"]; label: string }> = [
    { value: "veg", label: "Veg" },
    { value: "non-veg", label: "Non-Veg" },
    { value: "vegan", label: "Vegan" },
];

const CUISINE_OPTIONS: Array<{ value: OnboardingInput["cuisinePreference"]; label: string }> = [
    { value: "indian", label: "Indian" },
    { value: "western", label: "Western" },
    { value: "mixed", label: "Mixed" },
];

export default function OnboardingPage() {
    const router = useRouter();
    const { update } = useSession();
    const [error, setError] = useState("");

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<OnboardingInput>({
        resolver: zodResolver(onboardingSchema) as never,
    });

    const selectedGender = watch("gender");
    const selectedFood = watch("foodPreference");
    const selectedCuisine = watch("cuisinePreference");

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
                        <input type="hidden" {...register("gender")} />
                        <div className="grid grid-cols-3 gap-3">
                            {GENDER_OPTIONS.map((option) => {
                                const isSelected = selectedGender === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setValue("gender", option.value, { shouldDirty: true, shouldValidate: true })}
                                        className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                                            isSelected
                                                ? "border-emerald-400/70 bg-emerald-500/20 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                                                : "border-slate-700 bg-slate-950 text-slate-200 hover:border-emerald-500/50"
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
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
                        <input type="hidden" {...register("foodPreference")} />
                        <div className="grid grid-cols-3 gap-3">
                            {FOOD_OPTIONS.map((option) => {
                                const isSelected = selectedFood === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setValue("foodPreference", option.value, { shouldDirty: true, shouldValidate: true })}
                                        className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                                            isSelected
                                                ? "border-emerald-400/70 bg-emerald-500/20 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                                                : "border-slate-700 bg-slate-950 text-slate-200 hover:border-emerald-500/50"
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
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
                        <input type="hidden" {...register("cuisinePreference")} />
                        <div className="grid grid-cols-3 gap-3">
                            {CUISINE_OPTIONS.map((option) => {
                                const isSelected = selectedCuisine === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setValue("cuisinePreference", option.value, { shouldDirty: true, shouldValidate: true })}
                                        className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                                            isSelected
                                                ? "border-emerald-400/70 bg-emerald-500/20 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                                                : "border-slate-700 bg-slate-950 text-slate-200 hover:border-emerald-500/50"
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
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
