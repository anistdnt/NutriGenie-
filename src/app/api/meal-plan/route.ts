import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth/auth-options";
import { connectDB } from "@/src/lib/db/mongo";
import { getOrCreateUserByEmail } from "@/src/lib/db/user";
import MealPlan from "@/src/models/MealPlan";
import { createHash } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type MealPlanPayload = {
    title?: string;
    description?: string;
    meals?: unknown;
    totalNutrients?: unknown;
    mode?: "check" | "save";
};

function stableStringify(value: unknown): string {
    if (Array.isArray(value)) {
        return `[${value.map((item) => stableStringify(item)).join(",")}]`;
    }

    if (value && typeof value === "object") {
        const record = value as Record<string, unknown>;
        return `{${Object.keys(record)
            .sort()
            .filter((key) => record[key] !== undefined)
            .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
            .join(",")}}`;
    }

    return JSON.stringify(value);
}

function normalizeForHash(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map((item) => normalizeForHash(item));
    }

    if (value && typeof value === "object") {
        const record = value as Record<string, unknown>;
        return Object.keys(record)
            .filter((key) => !["_id", "__v", "userId", "contentHash", "createdAt", "updatedAt"].includes(key))
            .reduce<Record<string, unknown>>((normalized, key) => {
                const nextValue = record[key];
                if (nextValue !== undefined) {
                    normalized[key] = normalizeForHash(nextValue);
                }
                return normalized;
            }, {});
    }

    return value;
}

function createMealPlanContentHash(payload: Required<Pick<MealPlanPayload, "title">> & MealPlanPayload) {
    const canonicalPayload = {
        title: payload.title.trim(),
        description: typeof payload.description === "string" ? payload.description.trim() : "",
        meals: normalizeForHash(payload.meals ?? null),
        totalNutrients: normalizeForHash(payload.totalNutrients ?? null),
    };

    return createHash("sha256").update(stableStringify(canonicalPayload)).digest("hex");
}

async function findExistingMealPlan(
    userId: unknown,
    contentHash: string,
    payload: Required<Pick<MealPlanPayload, "title">> & MealPlanPayload
) {
    const hashMatch = await MealPlan.findOne({ userId, contentHash });
    if (hashMatch) return hashMatch;

    const candidates = await MealPlan.find({ userId, title: payload.title.trim() });
    return (
        candidates.find((candidate) => {
            const candidateObject = candidate.toObject();
            return createMealPlanContentHash({
                title: String(candidateObject.title ?? ""),
                description: typeof candidateObject.description === "string" ? candidateObject.description : undefined,
                meals: candidateObject.meals,
                totalNutrients: candidateObject.totalNutrients,
            }) === contentHash;
        }) ?? null
    );
}

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

        const body = (await req.json()) as MealPlanPayload;

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

        const payload = {
            title,
            description: typeof body.description === "string" ? body.description : undefined,
            meals: body.meals,
            totalNutrients: body.totalNutrients,
        };
        const contentHash = createMealPlanContentHash(payload);
        const existingMealPlan = await findExistingMealPlan(user._id, contentHash, payload);

        if (existingMealPlan) {
            if (!existingMealPlan.contentHash) {
                existingMealPlan.contentHash = contentHash;
                await existingMealPlan.save();
            }

            return NextResponse.json(
                {
                    success: true,
                    exists: true,
                    mealPlan: {
                        ...JSON.parse(JSON.stringify(existingMealPlan)),
                        _id: existingMealPlan._id.toString(),
                    },
                },
                { status: 200, headers: { "Cache-Control": "no-store" } }
            );
        }

        if (body.mode === "check") {
            return NextResponse.json(
                { success: true, exists: false, mealPlan: null },
                { status: 200, headers: { "Cache-Control": "no-store" } }
            );
        }

        const mealPlan = await MealPlan.create({
            contentHash,
            title,
            description: payload.description,
            meals: payload.meals,
            totalNutrients: payload.totalNutrients,
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

