"use client";

interface RecipeProps {
    name?: string;
    description?: string;
    prepTime?: string;
    difficulty?: "Easy" | "Medium" | "Hard";
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    ingredients?: string[];
    instructions?: string[];
}

export default function RecipeCard({
    name,
    description,
    prepTime,
    difficulty,
    calories,
    protein,
    carbs,
    fat,
    ingredients,
    instructions,
}: RecipeProps) {
    const safeDifficulty = difficulty ?? "Easy";
    const safeIngredients = ingredients ?? [];
    const safeInstructions = instructions ?? [];

    return (
        <div className="my-4 w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{name || "Custom Recipe"}</h3>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${safeDifficulty === "Easy"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : safeDifficulty === "Medium"
                                ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                        {safeDifficulty}
                    </span>
                </div>
                {description && <p className="text-sm text-gray-600 dark:text-gray-400 italic">{description}</p>}

                <div className="flex gap-4 mt-4">
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500 uppercase font-bold tracking-tighter">Prep:</span>
                        <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{prepTime || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500 uppercase font-bold tracking-tighter">Cals:</span>
                        <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{calories ?? 0}</span>
                    </div>
                </div>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-xs font-black uppercase text-gray-400 mb-3 tracking-widest">Ingredients</h4>
                    <ul className="space-y-2">
                        {safeIngredients.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <span className="text-green-500 mt-1">*</span>
                                {item}
                            </li>
                        ))}
                        {safeIngredients.length === 0 && <li className="text-sm text-gray-500">No ingredients listed.</li>}
                    </ul>
                </div>

                <div>
                    <h4 className="text-xs font-black uppercase text-gray-400 mb-3 tracking-widest">Instructions</h4>
                    <ol className="space-y-3">
                        {safeInstructions.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-bold flex items-center justify-center text-gray-500">
                                    {idx + 1}
                                </span>
                                {step}
                            </li>
                        ))}
                        {safeInstructions.length === 0 && <li className="text-sm text-gray-500 list-none">No instructions listed.</li>}
                    </ol>
                </div>
            </div>

            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/30 flex gap-6 border-t border-gray-100 dark:border-gray-800">
                <div className="text-center">
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Protein</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{protein ?? 0}g</div>
                </div>
                <div className="text-center">
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Carbs</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{carbs ?? 0}g</div>
                </div>
                <div className="text-center">
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Fat</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{fat ?? 0}g</div>
                </div>
            </div>
        </div>
    );
}
