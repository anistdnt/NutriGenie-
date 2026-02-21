import { z } from "zod";

export const healthProfileSchema = z.object({
    // Core Identity
    age: z.number().min(1).max(120).optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    height: z.number().min(50).max(300).optional(), // cm
    foodPreference: z.enum(["veg", "non-veg", "vegan"]).optional(),
    cuisinePreference: z.enum(["indian", "western", "mixed"]).optional(),

    // Medical Information
    allergies: z.array(z.string()).optional().default([]),
    medicalConditions: z.array(z.string()).optional().default([]),
    medications: z.array(z.string()).optional().default([]),
    dietaryRestrictions: z.array(z.string()).optional().default([]),

    // Goals & Lifestyle
    healthGoals: z.array(z.string()).optional().default([]),
    activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]).optional(),
    targetCalories: z.number().min(500).max(10000).optional(),
    targetWeight: z.number().min(20).max(500).optional(),
});

export type HealthProfileInput = z.infer<typeof healthProfileSchema>;
