"use client";

import { useEffect, useState } from "react";
import { Activity, Zap, Target, History, ChevronRight, Loader2, type LucideIcon } from "lucide-react";
import Link from "next/link";

interface Stats {
    avgCalories: number;
    avgProtein: number;
    avgCarbs: number;
    avgFat: number;
    totalPlans: number;
}

interface MealPlanLite {
    _id: string;
    title: string;
    createdAt: string;
    totalNutrients: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
}

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: number;
    unit: string;
    badgeClass: string;
    iconClass: string;
}

export default function StatsOverview() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentPlans, setRecentPlans] = useState<MealPlanLite[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch("/api/meal-plan");
                const data = await res.json();
                if (data.mealPlans) {
                    const plans = data.mealPlans as MealPlanLite[];
                    setRecentPlans(plans.slice(0, 3));

                    if (plans.length > 0) {
                        const total = plans.reduce((acc, p) => ({
                            calories: acc.calories + p.totalNutrients.calories,
                            protein: acc.protein + p.totalNutrients.protein,
                            carbs: acc.carbs + p.totalNutrients.carbs,
                            fat: acc.fat + p.totalNutrients.fat,
                        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

                        setStats({
                            avgCalories: Math.round(total.calories / plans.length),
                            avgProtein: Math.round(total.protein / plans.length),
                            avgCarbs: Math.round(total.carbs / plans.length),
                            avgFat: Math.round(total.fat / plans.length),
                            totalPlans: plans.length,
                        });
                    }
                }
            } catch (err) {
                console.error("Error fetching dashboard stats:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8 h-full">
                <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 text-center">
                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <History className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">No Data Yet</h3>
                <p className="text-[11px] text-gray-500 mb-4">Start chatting with Dr. Genie to generate your first meal plan.</p>
            </div>
        );
    }

    const StatCard = ({ icon: Icon, label, value, unit, badgeClass, iconClass }: StatCardProps) => (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-xl ${badgeClass}`}>
                    <Icon className={`w-4 h-4 ${iconClass}`} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-gray-900 dark:text-white">{value}</span>
                <span className="text-[10px] font-bold text-gray-500">{unit}</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <StatCard icon={Zap} label="Avg. Calories" value={stats.avgCalories} unit="kcal" badgeClass="bg-orange-500/20" iconClass="text-orange-500" />
                <StatCard icon={Target} label="Avg. Protein" value={stats.avgProtein} unit="g" badgeClass="bg-blue-500/20" iconClass="text-blue-500" />
                <StatCard icon={Activity} label="Avg. Carbs" value={stats.avgCarbs} unit="g" badgeClass="bg-green-500/20" iconClass="text-green-500" />
                <StatCard icon={Target} label="Avg. Fat" value={stats.avgFat} unit="g" badgeClass="bg-purple-500/20" iconClass="text-purple-500" />
            </div>

            {/* Recent History */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4 px-1">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <History className="w-4 h-4 text-green-600" />
                        Recent Plans
                    </h3>
                    <Link href="/meal-plan" className="text-[10px] font-bold text-green-600 hover:underline uppercase tracking-wider">
                        View All
                    </Link>
                </div>
                

                <div className="space-y-3">
                    {recentPlans.map((plan) => (
                        <Link
                            key={plan._id}
                            href="/meal-plan"
                            className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                        >
                            <div className="flex-1 min-w-0">
                                <h4 className="text-[12px] font-bold text-gray-900 dark:text-white truncate">{plan.title}</h4>
                                <p className="text-[10px] text-gray-500 mt-0.5">{new Date(plan.createdAt).toLocaleDateString()}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                        </Link>
                    ))}
                </div>
            </div>

            {/* Motivation card */}
            <div className="bg-gradient-to-br from-green-600 to-teal-500 p-5 rounded-3xl text-white shadow-lg shadow-green-500/20">
                <p className="text-[11px] font-bold uppercase tracking-widest opacity-80 mb-2">Health Record</p>
                <h4 className="text-lg font-black leading-tight mb-3">You have generated {stats.totalPlans} meal plans!</h4>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-white transition-all duration-1000"
                        style={{ width: `${Math.min(100, (stats.totalPlans / 10) * 100)}%` }}
                    />
                </div>
                <p className="text-[10px] mt-2 font-medium opacity-90">{stats.totalPlans < 10 ? `${10 - stats.totalPlans} more to reach Bronze Level.` : "Gold Level achieved!"}</p>
            </div>
        </div>
    );
}
