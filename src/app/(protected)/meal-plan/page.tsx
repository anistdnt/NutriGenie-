"use client";

import { useEffect, useState } from "react";
import MealPlanCard from "@/src/components/chat/MealPlanCard";
import { Loader2, BookOpen, PlusCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/src/components/providers/ToastProvider";

interface MealPlanItem {
    _id: string;
    title: string;
    description?: string;
    meals?: React.ComponentProps<typeof MealPlanCard>["meals"];
    totalNutrients?: React.ComponentProps<typeof MealPlanCard>["totalNutrients"];
    createdAt: string;
}

export default function MealPlanPage() {
    const toast = useToast();
    const [mealPlans, setMealPlans] = useState<MealPlanItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

    useEffect(() => {
        const fetchMealPlans = async () => {
            try {
                const res = await fetch("/api/meal-plan", { cache: "no-store" });
                const data = await res.json();
                if (data.mealPlans) {
                    setMealPlans(data.mealPlans);
                }
            } catch (error) {
                console.error("Failed to fetch meal plans:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMealPlans();
    }, []);

    const handleDeleteMealPlan = async (id: string) => {
        try {
            setDeletingPlanId(id);
            const res = await fetch(`/api/meal-plan/${id}`, { method: "DELETE" });
            const result = await res.json();
            if (!res.ok || !result.success) {
                throw new Error(result.error || "Failed to delete meal plan");
            }
            setMealPlans((prev) => prev.filter((item) => item._id !== id));
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("mealplan:deleted", { detail: { id } }));
            }
            toast.success("Meal plan deleted.");
        } catch (error: any) {
            toast.error(error.message || "Failed to delete meal plan.");
        } finally {
            setDeletingPlanId(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-slate-100 flex items-center gap-3">
                            <BookOpen className="w-8 h-8 text-green-600" />
                            Meal Plan Library
                        </h1>
                        <p className="text-slate-400 mt-2 font-medium">
                            Your personalized collection of AI-generated nutrition plans.
                        </p>
                    </div>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-green-500/20 active:scale-95"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Generate New
                    </Link>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-4" />
                        <p className="text-gray-500 font-bold animate-pulse">Loading your library...</p>
                    </div>
                ) : mealPlans.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        {mealPlans.map((plan) => (
                            <div key={plan._id} className="h-full">
                                <div className="mb-2 flex justify-between items-center px-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        Saved on {new Date(plan.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteMealPlan(plan._id)}
                                        disabled={deletingPlanId === plan._id}
                                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-rose-300 hover:bg-rose-900/20 disabled:opacity-50"
                                        aria-label="Delete meal plan"
                                    >
                                        {deletingPlanId === plan._id ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-3.5 w-3.5" />
                                        )}
                                        Delete
                                    </button>
                                </div>
                                <MealPlanCard {...plan} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-800 animate-in fade-in duration-500">
                        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="w-10 h-10 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-100 mb-2">No Saved Plans Yet</h2>
                        <p className="text-slate-400 max-w-sm mx-auto mb-8">
                            Ask Dr. Genie to generate a meal plan for you in the dashboard to see it appear here.
                        </p>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 text-green-600 font-bold hover:underline underline-offset-4"
                        >
                            Go to Dashboard <PlusCircle className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
