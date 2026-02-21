"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/auth-options";
import { connectDB } from "@/src/lib/db/mongo";
import MealPlan from "@/src/models/MealPlan";
import User from "@/src/models/User";
import { revalidatePath } from "next/cache";

export async function saveMealPlan(data: any) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await connectDB();
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        const newMealPlan = await MealPlan.create({
            ...data,
            userId: user._id,
        });

        revalidatePath("/dashboard");
        return { success: true, id: newMealPlan._id.toString() };
    } catch (error: any) {
        console.error("Error saving meal plan:", error);
        return { success: false, error: error.message || "Failed to save meal plan" };
    }
}

export async function getSavedMealPlans() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return [];
    }

    try {
        await connectDB();
        const user = await User.findOne({ email: session.user.email });

        if (!user) return [];

        const plans = await MealPlan.find({ userId: user._id }).sort({ createdAt: -1 });
        return JSON.parse(JSON.stringify(plans));
    } catch (error) {
        console.error("Error fetching saved meal plans:", error);
        return [];
    }
}
