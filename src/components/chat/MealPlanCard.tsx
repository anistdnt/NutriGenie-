"use client";

import { useState } from "react";
import { saveMealPlan } from "@/src/lib/actions/mealplan.actions";

interface Meal {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

interface MealPlanProps {
    title?: string;
    description?: string;
    meals?: {
        breakfast?: Meal;
        lunch?: Meal;
        dinner?: Meal;
        snacks?: Meal[];
    };
    totalNutrients?: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
}

function asNumber(value: unknown): number {
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function normalizeMeal(meal?: Meal): Meal | undefined {
    if (!meal) return undefined;
    return {
        name: meal.name || "Meal",
        calories: asNumber(meal.calories),
        protein: asNumber(meal.protein),
        carbs: asNumber(meal.carbs),
        fat: asNumber(meal.fat),
    };
}

function MealItem({ type, meal }: { type: string; meal?: Meal }) {
    if (!meal) return null;

    return (
        <div className="flex flex-col p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
            <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
                    {type}
                </span>
                <span className="text-[10px] text-gray-500">{meal.calories} kcal</span>
            </div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                {meal.name}
            </h4>
            <div className="flex gap-3 mt-2 text-[10px] text-gray-500 dark:text-gray-400">
                <span>P: {meal.protein}g</span>
                <span>C: {meal.carbs}g</span>
                <span>F: {meal.fat}g</span>
            </div>
        </div>
    );
}

export default function MealPlanCard({ title, description, meals, totalNutrients }: MealPlanProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const rawSnacks = Array.isArray(meals?.snacks) ? meals.snacks : [];
    const safeMeals = {
        breakfast: normalizeMeal(meals?.breakfast),
        lunch: normalizeMeal(meals?.lunch),
        dinner: normalizeMeal(meals?.dinner),
        snacks: rawSnacks.map((snack) => normalizeMeal(snack)).filter((snack): snack is Meal => Boolean(snack)),
    };

    const fallbackTotals = {
        calories: asNumber(safeMeals.breakfast?.calories) + asNumber(safeMeals.lunch?.calories) + asNumber(safeMeals.dinner?.calories) + safeMeals.snacks.reduce((sum, item) => sum + asNumber(item.calories), 0),
        protein: asNumber(safeMeals.breakfast?.protein) + asNumber(safeMeals.lunch?.protein) + asNumber(safeMeals.dinner?.protein) + safeMeals.snacks.reduce((sum, item) => sum + asNumber(item.protein), 0),
        carbs: asNumber(safeMeals.breakfast?.carbs) + asNumber(safeMeals.lunch?.carbs) + asNumber(safeMeals.dinner?.carbs) + safeMeals.snacks.reduce((sum, item) => sum + asNumber(item.carbs), 0),
        fat: asNumber(safeMeals.breakfast?.fat) + asNumber(safeMeals.lunch?.fat) + asNumber(safeMeals.dinner?.fat) + safeMeals.snacks.reduce((sum, item) => sum + asNumber(item.fat), 0),
    };

    const safeTotals = {
        calories: asNumber(totalNutrients?.calories) || fallbackTotals.calories,
        protein: asNumber(totalNutrients?.protein) || fallbackTotals.protein,
        carbs: asNumber(totalNutrients?.carbs) || fallbackTotals.carbs,
        fat: asNumber(totalNutrients?.fat) || fallbackTotals.fat,
    };

    const safeTitle = title?.trim() || "Personalized Meal Plan";

    const handleSave = async () => {
        setIsSaving(true);
        const result = await saveMealPlan({
            title: safeTitle,
            description,
            meals: safeMeals,
            totalNutrients: safeTotals,
        });
        setIsSaving(false);
        if (result.success) {
            setIsSaved(true);
        } else {
            alert("Failed to save meal plan: " + result.error);
        }
    };

    return (
        <div className="my-4 w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 bg-gradient-to-r from-green-600/10 to-teal-500/10 border-b border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{safeTitle}</h3>
                        {description && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{description}</p>}
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-black text-green-600 dark:text-green-400">
                            {safeTotals.calories}
                        </div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Total Calories</div>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <MealItem type="Breakfast" meal={safeMeals.breakfast} />
                    <MealItem type="Lunch" meal={safeMeals.lunch} />
                    <MealItem type="Dinner" meal={safeMeals.dinner} />
                </div>

                {safeMeals.snacks.length > 0 && (
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Recommended Snacks</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {safeMeals.snacks.map((snack, idx) => (
                                <MealItem key={idx} type={`Snack ${idx + 1}`} meal={snack} />
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex gap-4">
                        <div className="text-center">
                            <div className="text-xs font-bold text-gray-900 dark:text-gray-100">{safeTotals.protein}g</div>
                            <div className="text-[10px] text-gray-500 uppercase">Protein</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xs font-bold text-gray-900 dark:text-gray-100">{safeTotals.carbs}g</div>
                            <div className="text-[10px] text-gray-500 uppercase">Carbs</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xs font-bold text-gray-900 dark:text-gray-100">{safeTotals.fat}g</div>
                            <div className="text-[10px] text-gray-500 uppercase">Fat</div>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={isSaving || isSaved}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${isSaved
                                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 cursor-default"
                                : "bg-green-600 text-white hover:bg-green-700 active:scale-95 shadow-lg shadow-green-500/20"
                            }`}
                    >
                        {isSaved ? "Saved to Library" : isSaving ? "Saving..." : "Save Meal Plan"}
                    </button>
                </div>
            </div>
        </div>
    );
}
