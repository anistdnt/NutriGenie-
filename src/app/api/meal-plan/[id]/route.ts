import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import { authOptions } from "@/src/lib/auth/auth-options";
import { connectDB } from "@/src/lib/db/mongo";
import { getOrCreateUserByEmail } from "@/src/lib/db/user";
import MealPlan from "@/src/models/MealPlan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid meal plan id" }, { status: 400 });
    }

    await connectDB();
    const user = await getOrCreateUserByEmail(
      session.user.email,
      session.user.name,
      session.user.image
    );

    const deleted = await MealPlan.findOneAndDelete({
      _id: id,
      userId: user._id,
    });

    if (!deleted) {
      return NextResponse.json({ error: "Meal plan not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("Delete Meal Plan Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
