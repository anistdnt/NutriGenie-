"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/auth-options";
import { connectDB } from "@/src/lib/db/mongo";
import User from "@/src/models/User";
import { healthProfileSchema, HealthProfileInput } from "@/src/lib/validators/health.schema";

export async function updateHealthProfile(data: HealthProfileInput) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const validated = healthProfileSchema.parse(data);

        await connectDB();

        const updatedUser = await User.findOneAndUpdate(
            { email: session.user.email },
            {
                ...validated,
                healthProfileCompleted: true,
                lastProfileUpdate: new Date(),
            },
            { new: true }
        );

        if (!updatedUser) {
            return { success: false, error: "User not found" };
        }

        return { success: true };
    } catch (error: any) {
        console.error("Health profile update error:", error);
        return { success: false, error: error.message || "Failed to update profile" };
    }
}

export async function getHealthContext(email: string) {
    try {
        await connectDB();

        const user = await User.findOne({ email }).select(
            "name age gender allergies medicalConditions medications dietaryRestrictions healthGoals activityLevel targetCalories targetWeight foodPreference"
        );

        if (!user) return null;

        // Build sanitized context for AI
        return {
            name: user.name,
            age: user.age,
            gender: user.gender,
            allergies: user.allergies || [],
            medicalConditions: user.medicalConditions || [],
            medications: user.medications || [],
            dietaryRestrictions: user.dietaryRestrictions || [],
            healthGoals: user.healthGoals || [],
            activityLevel: user.activityLevel,
            targetCalories: user.targetCalories,
            targetWeight: user.targetWeight,
            foodPreference: user.foodPreference,
        };
    } catch (error) {
        console.error("Error fetching health context:", error);
        return null;
    }
}
