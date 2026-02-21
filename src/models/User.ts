import mongoose, { Schema, model, models } from "mongoose";

export interface IUser {
  name?: string;
  email: string;
  image?: string;
  age?: number;
  gender?: "male" | "female" | "other";
  height?: number; // cm
  foodPreference?: "veg" | "non-veg" | "vegan";
  cuisinePreference?: "indian" | "western" | "mixed";
  password?: string;

  // Health Profile
  allergies?: string[];
  medicalConditions?: string[];
  medications?: string[];
  dietaryRestrictions?: string[];
  healthGoals?: string[];
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "very_active";
  targetCalories?: number;
  targetWeight?: number;
  healthProfileCompleted?: boolean;
  lastProfileUpdate?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: String,
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    image: String,
    age: Number,
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    height: Number,
    foodPreference: {
      type: String,
      enum: ["veg", "non-veg", "vegan"],
    },
    password: {
      type: String,
      select: false,
    },
    cuisinePreference: {
      type: String,
      enum: ["indian", "western", "mixed"],
    },

    // Health Profile
    allergies: [String],
    medicalConditions: [String],
    medications: [String],
    dietaryRestrictions: [String],

    // Goals & Preferences
    healthGoals: [String],
    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active", "very_active"],
    },
    targetCalories: Number,
    targetWeight: Number,

    // Metadata
    healthProfileCompleted: {
      type: Boolean,
      default: false,
    },
    lastProfileUpdate: Date,
  },
  { timestamps: true }
);

export default models.User || model<IUser>("User", UserSchema);
