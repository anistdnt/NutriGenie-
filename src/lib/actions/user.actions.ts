"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/auth-options";
import { connectDB } from "@/src/lib/db/mongo";
import User from "@/src/models/User";
import { OnboardingInput, onboardingSchema } from "../validators/user.schema";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(data: OnboardingInput) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return { error: "Unauthorized" };
    }

    const result = onboardingSchema.safeParse(data);

    if (!result.success) {
        return { error: "Invalid input data" };
    }

    try {
        await connectDB();

        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            {
                $set: {
                    age: result.data.age,
                    gender: result.data.gender,
                    height: result.data.height,
                    foodPreference: result.data.foodPreference,
                    cuisinePreference: result.data.cuisinePreference,
                },
            },
            { new: true }
        );

        if (!user) {
            return { error: "User not found" };
        }

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Profile update error:", error);
        return { error: "Failed to update profile" };
    }
}
