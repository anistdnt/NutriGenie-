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
  },
  { timestamps: true }
);

export default models.User || model<IUser>("User", UserSchema);
