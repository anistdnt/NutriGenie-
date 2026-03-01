import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth/auth-options";
import { connectDB } from "@/src/lib/db/mongo";
import MealPlan from "@/src/models/MealPlan";
import User from "@/src/models/User";

export const runtime = "nodejs";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const mealPlans = await MealPlan.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ mealPlans });
    } catch (error: any) {
        console.error("Fetch Meal Plans Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

