import { z } from "zod";

export const healthProfileSchema = z.object({
    // Medical Information
    allergies: z.array(z.string()).optional().default([]),
    medicalConditions: z.array(z.string()).optional().default([]),
    medications: z.array(z.string()).optional().default([]),
    dietaryRestrictions: z.array(z.string()).optional().default([]),

    // Goals & Lifestyle
    healthGoals: z.array(z.string()).optional().default([]),
    activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]).optional(),
    targetCalories: z.number().min(1000).max(5000).optional(),
    targetWeight: z.number().min(30).max(300).optional(),
});

export type HealthProfileInput = z.infer<typeof healthProfileSchema>;
