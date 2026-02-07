import { streamText } from "ai";
import { model, TRIAGE_SYSTEM_PROMPT } from "@/src/lib/ai/config";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/auth-options";

export const maxDuration = 30;

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return new Response("Unauthorized", { status: 401 });
    }

    // Fetch comprehensive health context
    const { getHealthContext } = await import("@/src/lib/actions/health.actions");
    const healthContext = await getHealthContext(session.user.email);

    // Build enhanced system prompt with health context
    let systemPrompt = TRIAGE_SYSTEM_PROMPT;

    if (healthContext) {
        const allergiesWarning = healthContext.allergies?.length
            ? `\n⚠️ CRITICAL ALLERGIES: ${healthContext.allergies.join(", ")}\nNEVER suggest foods containing these allergens.`
            : "";

        const conditionsInfo = healthContext.medicalConditions?.length
            ? `\nMedical Conditions: ${healthContext.medicalConditions.join(", ")}`
            : "";

        const medsInfo = healthContext.medications?.length
            ? `\nMedications: ${healthContext.medications.join(", ")}`
            : "";

        const dietaryInfo = healthContext.dietaryRestrictions?.length
            ? `\nDietary Restrictions: ${healthContext.dietaryRestrictions.join(", ")}`
            : "";

        const goalsInfo = healthContext.healthGoals?.length
            ? `\nGoals: ${healthContext.healthGoals.join(", ")}`
            : "";

        const activityInfo = healthContext.activityLevel
            ? `\nActivity Level: ${healthContext.activityLevel}`
            : "";

        systemPrompt += `\n\n--- USER HEALTH PROFILE ---
Name: ${healthContext.name || "User"}
Age: ${healthContext.age || "Not specified"}, Gender: ${healthContext.gender || "Not specified"}${allergiesWarning}${conditionsInfo}${medsInfo}${dietaryInfo}${goalsInfo}${activityInfo}

--- SAFETY RULES ---
1. NEVER recommend foods containing user's allergens
2. For diabetes: Prioritize low-GI foods, warn about high-carb items
3. For hypertension: Recommend low-sodium options
4. DO NOT provide medical diagnosis or change medication advice
5. Always defer to healthcare providers for medical concerns
6. Be empathetic and supportive in your guidance
`;
    }

    const { messages } = await req.json();

    const result = streamText({
        model,
        system: systemPrompt,
        messages,
    });

    return result.toTextStreamResponse();
}
