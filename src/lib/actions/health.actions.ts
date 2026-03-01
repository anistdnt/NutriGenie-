"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/auth-options";
import { connectDB } from "@/src/lib/db/mongo";
import { findUserByEmailInsensitive, getOrCreateUserByEmail } from "@/src/lib/db/user";
import { healthProfileSchema, HealthProfileInput } from "@/src/lib/validators/health.schema";

export async function updateHealthProfile(data: HealthProfileInput) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const validated = healthProfileSchema.parse(data);

        await connectDB();

        let updatedUser = await findUserByEmailInsensitive(session.user.email);
        if (!updatedUser) {
            updatedUser = await getOrCreateUserByEmail(
                session.user.email,
                session.user.name,
                session.user.image
            );
        }
        updatedUser.set({
            ...validated,
            healthProfileCompleted: true,
            lastProfileUpdate: new Date(),
        });
        await updatedUser.save();

        return { success: true };
    } catch (error: any) {
        console.error("Health profile update error:", error);
        return { success: false, error: error.message || "Failed to update profile" };
    }
}

export async function getHealthContext(email: string) {
    try {
        await connectDB();

        const user = await findUserByEmailInsensitive(email);

        if (!user) return null;

        // Build sanitized context for AI
        return {
            name: user.name,
            age: user.age,
            gender: user.gender,
            height: user.height,
            allergies: user.allergies || [],
            medicalConditions: user.medicalConditions || [],
            medications: user.medications || [],
            dietaryRestrictions: user.dietaryRestrictions || [],
            healthGoals: user.healthGoals || [],
            activityLevel: user.activityLevel,
            targetCalories: user.targetCalories,
            targetWeight: user.targetWeight,
            foodPreference: user.foodPreference,
            cuisinePreference: user.cuisinePreference,
        };
    } catch (error) {
        console.error("Error fetching health context:", error);
        return null;
    }
}
