"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateHealthProfile } from "@/src/lib/actions/health.actions";
import { HealthProfileInput } from "@/src/lib/validators/health.schema";

const ACTIVITY_LEVELS = [
    { value: "sedentary", label: "Sedentary (little or no exercise)" },
    { value: "light", label: "Light (exercise 1-3 days/week)" },
    { value: "moderate", label: "Moderate (exercise 3-5 days/week)" },
    { value: "active", label: "Active (exercise 6-7 days/week)" },
    { value: "very_active", label: "Very Active (physical job + exercise)" },
];

const COMMON_ALLERGIES = ["Peanuts", "Tree Nuts", "Shellfish", "Dairy", "Eggs", "Soy", "Wheat", "Fish"];
const COMMON_CONDITIONS = ["Diabetes", "Hypertension", "Heart Disease", "Celiac Disease", "IBS", "High Cholesterol"];
const DIETARY_OPTIONS = ["Vegan", "Vegetarian", "Gluten-Free", "Lactose-Free", "Keto", "Low-Carb", "Halal", "Kosher"];
const HEALTH_GOALS = ["Weight Loss", "Muscle Gain", "Maintenance", "Improve Energy", "Better Sleep", "Reduce Inflammation"];

export default function HealthProfilePage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<HealthProfileInput>({
        allergies: [],
        medicalConditions: [],
        medications: [],
        dietaryRestrictions: [],
        healthGoals: [],
        activityLevel: undefined,
        targetCalories: undefined,
        targetWeight: undefined,
    });

    const handleArrayToggle = (field: keyof HealthProfileInput, value: string) => {
        const current = (formData[field] as string[]) || [];
        setFormData({
            ...formData,
            [field]: current.includes(value)
                ? current.filter((v) => v !== value)
                : [...current, value],
        });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const result = await updateHealthProfile(formData);

        if (result.success) {
            router.push("/dashboard");
        } else {
            alert(`Error: ${result.error}`);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 min-h-screen bg-slate-950 text-slate-100">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 text-slate-100">Complete Your Health Profile</h1>
                <p className="text-slate-400">
                    Help Dr. Genie provide personalized health guidance
                </p>
                <div className="flex gap-2 mt-4">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-2 flex-1 rounded-full ${s <= step ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Step 1: Medical History */}
            {step === 1 && (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-3 text-gray-900 dark:text-gray-100">
                            Do you have any allergies? ⚠️
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {COMMON_ALLERGIES.map((allergy) => (
                                <button
                                    key={allergy}
                                    type="button"
                                    onClick={() => handleArrayToggle("allergies", allergy)}
                                    className={`p-3 rounded-lg border text-sm transition-all ${formData.allergies?.includes(allergy)
                                        ? "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300"
                                : "bg-slate-900 border-slate-700 hover:border-slate-500"
                                        }`}
                                >
                                    {allergy}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-3 text-gray-900 dark:text-gray-100">
                            Any medical conditions?
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {COMMON_CONDITIONS.map((condition) => (
                                <button
                                    key={condition}
                                    type="button"
                                    onClick={() => handleArrayToggle("medicalConditions", condition)}
                                    className={`p-3 rounded-lg border text-sm transition-all ${formData.medicalConditions?.includes(condition)
                                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500"
                                        : "bg-slate-900 border-slate-700 hover:border-slate-500"
                                        }`}
                                >
                                    {condition}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                            Current medications (optional)
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Metformin, Lisinopril (comma-separated)"
                            className="w-full p-3 rounded-lg border border-slate-700 bg-slate-900"
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    medications: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                                })
                            }
                        />
                    </div>
                </div>
            )}

            {/* Step 2: Dietary Preferences */}
            {step === 2 && (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-3 text-gray-900 dark:text-gray-100">
                            Dietary restrictions or preferences
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {DIETARY_OPTIONS.map((diet) => (
                                <button
                                    key={diet}
                                    type="button"
                                    onClick={() => handleArrayToggle("dietaryRestrictions", diet)}
                                    className={`p-3 rounded-lg border text-sm transition-all ${formData.dietaryRestrictions?.includes(diet)
                                        ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                                        : "bg-slate-900 border-slate-700 hover:border-slate-500"
                                        }`}
                                >
                                    {diet}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Goals & Lifestyle */}
            {step === 3 && (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-3 text-gray-900 dark:text-gray-100">
                            What are your health goals?
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {HEALTH_GOALS.map((goal) => (
                                <button
                                    key={goal}
                                    type="button"
                                    onClick={() => handleArrayToggle("healthGoals", goal)}
                                    className={`p-3 rounded-lg border text-sm transition-all ${formData.healthGoals?.includes(goal)
                                        ? "bg-purple-50 dark:bg-purple-900/20 border-purple-500"
                                        : "bg-slate-900 border-slate-700 hover:border-slate-500"
                                        }`}
                                >
                                    {goal}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                            Activity Level
                        </label>
                        <select
                            value={formData.activityLevel || ""}
                            onChange={(e) =>
                                setFormData({ ...formData, activityLevel: e.target.value as HealthProfileInput["activityLevel"] })
                            }
                            className="w-full p-3 rounded-lg border border-slate-700 bg-slate-900"
                        >
                            <option value="">Select...</option>
                            {ACTIVITY_LEVELS.map((level) => (
                                <option key={level.value} value={level.value}>
                                    {level.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                                Target Weight (kg) - Optional
                            </label>
                            <input
                                type="number"
                                placeholder="e.g., 75"
                                className="w-full p-3 rounded-lg border border-slate-700 bg-slate-900"
                                onChange={(e) =>
                                    setFormData({ ...formData, targetWeight: e.target.value ? Number(e.target.value) : undefined })
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                                Daily Calorie Target - Optional
                            </label>
                            <input
                                type="number"
                                placeholder="e.g., 2000"
                                className="w-full p-3 rounded-lg border border-slate-700 bg-slate-900"
                                onChange={(e) =>
                                    setFormData({ ...formData, targetCalories: e.target.value ? Number(e.target.value) : undefined })
                                }
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
                <button
                    onClick={() => setStep(step - 1)}
                    disabled={step === 1}
                    className="px-6 py-2 rounded-lg border border-slate-700 text-slate-100 disabled:opacity-50"
                >
                    Back
                </button>
                {step < 3 ? (
                    <button
                        onClick={() => setStep(step + 1)}
                        className="px-6 py-2 bg-slate-100 text-slate-900 rounded-lg hover:opacity-90"
                    >
                        Next
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        {isSubmitting ? "Saving..." : "Complete Profile"}
                    </button>
                )}
            </div>
        </div>
    );
}
