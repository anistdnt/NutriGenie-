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
        resolver: zodResolver(onboardingSchema) as any,
    });

    const onSubmit = async (data: OnboardingInput) => {
        setError("");
        try {
            const result = await updateUserProfile(data);

            if (result.error) {
                setError(result.error);
                return;
            }

            await update(); // Refresh session
            router.push("/dashboard");
            router.refresh();
        } catch (err) {
            setError("An unexpected error occurred");
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10">
            <div className="bg-white shadow rounded-lg p-8">
                <h1 className="text-3xl font-bold mb-2">Welcome to NutriGenie! 🥗</h1>
                <p className="text-gray-600 mb-8">
                    Let&apos;s personalize your experience. Tell us a bit about yourself.
                </p>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Age */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Age
                            </label>
                            <input
                                type="number"
                                {...register("age")}
                                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="e.g. 25"
                            />
                            {errors.age && (
                                <p className="text-sm text-red-500 mt-1">{errors.age.message}</p>
                            )}
                        </div>

                        {/* Height */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Height (cm)
                            </label>
                            <input
                                type="number"
                                {...register("height")}
                                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="e.g. 175"
                            />
                            {errors.height && (
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.height.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gender
                        </label>
                        <select
                            {...register("gender")}
                            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-green-500 outline-none bg-white"
                        >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                        {errors.gender && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.gender.message}
                            </p>
                        )}
                    </div>

                    {/* Food Preference */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dietary Preference
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                            {["veg", "non-veg", "vegan"].map((type) => (
                                <label
                                    key={type}
                                    className="flex items-center space-x-2 border p-3 rounded cursor-pointer hover:bg-gray-50"
                                >
                                    <input
                                        type="radio"
                                        value={type}
                                        {...register("foodPreference")}
                                        className="text-green-600 focus:ring-green-500"
                                    />
                                    <span className="capitalize">{type}</span>
                                </label>
                            ))}
                        </div>
                        {errors.foodPreference && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.foodPreference.message}
                            </p>
                        )}
                    </div>

                    {/* Cuisine Preference */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Preferred Cuisine
                        </label>
                        <select
                            {...register("cuisinePreference")}
                            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-green-500 outline-none bg-white"
                        >
                            <option value="">Select cuisine</option>
                            <option value="indian">Indian</option>
                            <option value="western">Western</option>
                            <option value="mixed">Mixed</option>
                        </select>
                        {errors.cuisinePreference && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.cuisinePreference.message}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-green-600 text-white py-3 rounded-md font-medium hover:bg-green-700 transition disabled:opacity-50"
                    >
                        {isSubmitting ? "Saving Profile..." : "Complete Setup"}
                    </button>
                </form>
            </div>
        </div>
    );
}
