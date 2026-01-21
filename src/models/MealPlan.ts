import mongoose, { Schema, model, models } from "mongoose";

export interface IMealPlan {
  userId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  weight?: number;
  goal: "loss" | "gain" | "maintain";
  mealsPerDay: number;
  totalCalories: number;
  mealPlanText: string;
}

const MealPlanSchema = new Schema<IMealPlan>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    weight: Number,
    goal: {
      type: String,
      enum: ["loss", "gain", "maintain"],
      required: true,
    },
    mealsPerDay: {
      type: Number,
      required: true,
      min: 2,
      max: 6,
    },
    totalCalories: {
      type: Number,
      required: true,
    },
    mealPlanText: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicates per day
MealPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

export default models.MealPlan ||
  model<IMealPlan>("MealPlan", MealPlanSchema);
