import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth/auth-options";
import { connectDB } from "@/src/lib/db/mongo";
import { getOrCreateUserByEmail } from "@/src/lib/db/user";
import MealPlan from "@/src/models/MealPlan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await getOrCreateUserByEmail(
            session.user.email,
            session.user.name,
            session.user.image
        );

        const mealPlans = await MealPlan.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(
            { mealPlans },
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (error: any) {
        console.error("Fetch Meal Plans Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = (await req.json()) as {
            title?: string;
            description?: string;
            meals?: unknown;
            totalNutrients?: unknown;
        };

        const title = typeof body.title === "string" ? body.title.trim() : "";
        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        await connectDB();
        const user = await getOrCreateUserByEmail(
            session.user.email,
            session.user.name,
            session.user.image
        );

        const mealPlan = await MealPlan.create({
            title,
            description: typeof body.description === "string" ? body.description : undefined,
            meals: body.meals,
            totalNutrients: body.totalNutrients,
            userId: user._id,
        });

        return NextResponse.json(
            {
                success: true,
                mealPlan: {
                    ...JSON.parse(JSON.stringify(mealPlan)),
                    _id: mealPlan._id.toString(),
                },
            },
            { status: 201, headers: { "Cache-Control": "no-store" } }
        );
    } catch (error: any) {
        console.error("Create Meal Plan Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

