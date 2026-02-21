"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { healthProfileSchema, HealthProfileInput } from "@/src/lib/validators/health.schema";
import { updateHealthProfile } from "@/src/lib/actions/health.actions";
import { Loader2, User as UserIcon, Shield, Target, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<any>({
        resolver: zodResolver(healthProfileSchema),
        defaultValues: {
            allergies: [],
            medicalConditions: [],
            medications: [],
            dietaryRestrictions: [],
            healthGoals: [],
        },
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/profile");
                const data = await res.json();
                if (data.user) {
                    reset(data.user);
                }
            } catch (err) {
                console.error("Failed to fetch profile:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [reset]);

    const onSubmit = async (data: HealthProfileInput) => {
        setIsSaving(true);
        setMessage({ type: "", text: "" });
        const result = await updateHealthProfile(data);
        setIsSaving(false);
        if (result.success) {
            setMessage({ type: "success", text: "Profile updated successfully!" });
            router.refresh();
        } else {
            setMessage({ type: "error", text: result.error || "Failed to update profile" });
        }
    };

    const handleArrayInput = (field: keyof HealthProfileInput, value: string) => {
        if (!value.trim()) return;
        const current = watch(field) as string[];
        if (!current.includes(value)) {
            setValue(field, [...current, value] as any);
        }
    };

    const removeArrayItem = (field: keyof HealthProfileInput, index: number) => {
        const current = watch(field) as string[];
        const updated = [...current];
        updated.splice(index, 1);
        setValue(field, updated as any);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
            </div>
        );
    }

    const Section = ({ title, icon: Icon, children }: any) => (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-green-50 dark:bg-green-900/20 rounded-2xl text-green-600">
                    <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">{title}</h3>
            </div>
            {children}
        </div>
    );

    const ArrayInput = ({ field, label, placeholder }: any) => {
        const items = watch(field) as string[];
        return (
            <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">{label}</label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {items.map((item, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                            {item}
                            <button onClick={() => removeArrayItem(field, idx)} className="text-gray-400 hover:text-red-500">
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder={placeholder}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleArrayInput(field, (e.target as HTMLInputElement).value);
                                (e.target as HTMLInputElement).value = "";
                            }
                        }}
                        className="flex-1 bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-green-500/20 outline-none"
                    />
                    <button
                        type="button"
                        onClick={(e) => {
                            const input = (e.currentTarget.previousSibling as HTMLInputElement);
                            handleArrayInput(field, input.value);
                            input.value = "";
                        }}
                        className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-end mb-10 px-2">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white leading-tight">Your Health Profile</h1>
                        <p className="text-gray-500 font-medium mt-2">Personalize Dr. Genie for better recommendations.</p>
                    </div>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-2xl font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
                        }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                        <div>
                            <Section title="Basic Metrics" icon={UserIcon}>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Age</label>
                                            <input {...register("age", { valueAsNumber: true })} type="number" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-green-500/20 outline-none" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Gender</label>
                                            <select {...register("gender")} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-green-500/20 outline-none">
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Height (cm)</label>
                                            <input {...register("height", { valueAsNumber: true })} type="number" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-green-500/20 outline-none" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Target Weight</label>
                                            <input {...register("targetWeight", { valueAsNumber: true })} type="number" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-green-500/20 outline-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Food Preference</label>
                                        <div className="flex gap-2">
                                            {["veg", "non-veg", "vegan"].map((pref) => (
                                                <button
                                                    key={pref}
                                                    type="button"
                                                    onClick={() => setValue("foodPreference", pref as any)}
                                                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold capitalize border-2 transition-all ${watch("foodPreference") === pref
                                                        ? "bg-green-600 text-white border-green-600 shadow-lg shadow-green-500/20"
                                                        : "bg-white dark:bg-gray-800 text-gray-500 border-gray-100 dark:border-gray-800"
                                                        }`}
                                                >
                                                    {pref}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Section>

                            <Section title="Medical & Restrictions" icon={Shield}>
                                <div className="space-y-6">
                                    <ArrayInput field="allergies" label="Food Allergies" placeholder="e.g. Peanuts, Shellfish" />
                                    <ArrayInput field="dietaryRestrictions" label="Dietary Restrictions" placeholder="e.g. Keto, Gluten-free" />
                                    <ArrayInput field="medicalConditions" label="Medical Conditions" placeholder="e.g. Diabetes, Hypertension" />
                                </div>
                            </Section>
                        </div>

                        <div>
                            <Section title="Goals & Lifestyle" icon={Target}>
                                <div className="space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Activity Level</label>
                                        <select {...register("activityLevel")} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-green-500/20 outline-none">
                                            <option value="sedentary">Sedentary (Office job)</option>
                                            <option value="light">Lightly Active</option>
                                            <option value="moderate">Moderately Active</option>
                                            <option value="active">Very Active</option>
                                            <option value="very_active">Athlete Level</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Daily Calorie Target</label>
                                        <input {...register("targetCalories", { valueAsNumber: true })} type="number" step="50" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-green-500/20 outline-none" />
                                    </div>
                                    <ArrayInput field="healthGoals" label="Personal Goals" placeholder="e.g. Build Muscle, Better Sleep" />
                                </div>
                            </Section>

                            <div className="sticky bottom-8 mt-12 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-4 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl z-20">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                                        </span>
                                    ) : "Save Dashboard Preferences"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
