import { z } from "zod";

export const onboardingSchema = z.object({
    age: z.coerce
        .number()
        .min(10, "You must be at least 10 years old")
        .max(100, "Please enter a valid age"),
    gender: z.enum(["male", "female", "other"]),
    height: z.coerce
        .number()
        .min(50, "Height must be at least 50 cm")
        .max(300, "Please enter a valid height"),
    foodPreference: z.enum(["veg", "non-veg", "vegan"]),
    cuisinePreference: z.enum(["indian", "western", "mixed"]),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
