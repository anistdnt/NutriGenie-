import mongoose, { Schema, model, models } from "mongoose";

export interface IMeal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients?: string[];
  instructions?: string[];
}

export interface IMealPlan {
  userId: mongoose.Types.ObjectId | string;
  title: string;
  description?: string;
  meals: {
    breakfast?: IMeal;
    lunch?: IMeal;
    dinner?: IMeal;
    snacks?: IMeal[];
  };
  totalNutrients: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  createdAt: Date;
}

const MealSchema = new Schema<IMeal>({
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fat: { type: Number, required: true },
  ingredients: [String],
  instructions: [String],
});

const MealPlanSchema = new Schema<IMealPlan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: String,
    meals: {
      breakfast: MealSchema,
      lunch: MealSchema,
      dinner: MealSchema,
      snacks: [MealSchema],
    },
    totalNutrients: {
      calories: { type: Number, required: true },
      protein: { type: Number, required: true },
      carbs: { type: Number, required: true },
      fat: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

export default models.MealPlan || model<IMealPlan>("MealPlan", MealPlanSchema);
