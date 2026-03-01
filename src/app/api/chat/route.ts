import { generateText, stepCountIs, tool as createTool } from "ai";
import { model, TRIAGE_SYSTEM_PROMPT } from "@/src/lib/ai/config";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth/auth-options";
import { z } from "zod";
import { connectDB } from "@/src/lib/db/mongo";
import MealPlan from "@/src/models/MealPlan";
import User from "@/src/models/User";
import Chat from "@/src/models/Chat";

export const runtime = "nodejs";
export const maxDuration = 60;

type ChatRole = "user" | "assistant" | "system";

type ToolCallPayload = {
    toolName: string;
    input: unknown;
    output: unknown;
};

type ChatMessagePayload = {
    role: ChatRole;
    content?: string;
    parts?: Array<{ type: "text"; text: string }>;
};

type ChatRequestBody = {
    threadId?: string;
    messages?: ChatMessagePayload[];
};

type RenameThreadBody = {
    threadId?: string;
    title?: string;
};

type ChatResponsePayload = {
    id: string;
    role: "assistant";
    text: string;
    threadId: string;
    toolCall: ToolCallPayload | null;
};

const mealSchema = z.object({
    name: z.string(),
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
});

const mealPlanInputSchema = z.object({
    title: z.string(),
    description: z.string(),
    meals: z.object({
        breakfast: mealSchema,
        lunch: mealSchema,
        dinner: mealSchema,
        snacks: z.array(mealSchema).optional(),
    }),
    totalNutrients: z.object({
        calories: z.number(),
        protein: z.number(),
        carbs: z.number(),
        fat: z.number(),
    }),
});

const recipeInputSchema = z.object({
    name: z.string(),
    description: z.string(),
    prepTime: z.string(),
    difficulty: z.enum(["Easy", "Medium", "Hard"]),
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
    ingredients: z.array(z.string()),
    instructions: z.array(z.string()),
});

function normalizeIncomingMessages(rawMessages: ChatMessagePayload[]) {
    return rawMessages
        .map((message) => {
            const textFromParts = message.parts?.find((part) => part.type === "text")?.text;
            const content = typeof message.content === "string" ? message.content : textFromParts;
            if (!content) return null;

            const role: ChatRole = message.role === "system" ? "system" : message.role;
            return { role, content };
        })
        .filter((message): message is { role: ChatRole; content: string } => message !== null);
}

function createThreadTitle(text: string) {
    const compact = text.replace(/\s+/g, " ").trim();
    if (!compact) return "New Chat";
    return compact.length > 60 ? `${compact.slice(0, 60)}...` : compact;
}

function normalizeTitle(text: string) {
    const compact = text.replace(/\s+/g, " ").trim();
    if (!compact) return "New Chat";
    return compact.length > 80 ? `${compact.slice(0, 80)}...` : compact;
}

function inferIntent(text: string) {
    const normalized = text.toLowerCase();
    const wantsMealPlan = /(meal\s*plan|diet\s*plan|plan\s+my\s+meals|daily\s+meal)/i.test(normalized);
    const wantsRecipe = /(recipe|cook|cooking|ingredients|instructions|how\s+to\s+make)/i.test(normalized);
    return { wantsMealPlan, wantsRecipe };
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });

        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (!user) return new Response("User not found", { status: 404 });

        const url = new URL(req.url);
        const threadId = url.searchParams.get("threadId");
        const threadsMode = url.searchParams.get("threads");

        if (threadsMode === "1") {
            const threads = await Chat.find({ userId: user._id })
                .sort({ lastMessageAt: -1 })
                .select("_id title lastMessageAt createdAt")
                .lean();

            return new Response(
                JSON.stringify({
                    threads: threads.map((thread) => ({
                        id: String(thread._id),
                        title: thread.title || "New Chat",
                        lastMessageAt: thread.lastMessageAt,
                        createdAt: thread.createdAt,
                    })),
                }),
                { headers: { "Content-Type": "application/json" } }
            );
        }

        if (threadId) {
            const chat = (await Chat.findOne({ _id: threadId, userId: user._id }).lean()) as
                | { _id: unknown; title?: string; messages?: unknown[] }
                | null;
            if (!chat) {
                return new Response(JSON.stringify({ threadId, messages: [] }), {
                    headers: { "Content-Type": "application/json" },
                });
            }

            return new Response(
                JSON.stringify({
                    threadId: String(chat._id),
                    title: chat.title || "New Chat",
                    messages: chat.messages || [],
                }),
                { headers: { "Content-Type": "application/json" } }
            );
        }

        const latest = (await Chat.findOne({ userId: user._id }).sort({ lastMessageAt: -1 }).lean()) as
            | { _id: unknown; title?: string; messages?: unknown[] }
            | null;
        return new Response(
            JSON.stringify({
                threadId: latest?._id ? String(latest._id) : null,
                title: latest?.title || "New Chat",
                messages: latest?.messages || [],
            }),
            { headers: { "Content-Type": "application/json" } }
        );
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return new Response(JSON.stringify({ error: message }), { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return new Response("Unauthorized", { status: 401 });
        }

        const { getHealthContext } = await import("@/src/lib/actions/health.actions");
        const healthContext = await getHealthContext(session.user.email);

        let systemPrompt = `${TRIAGE_SYSTEM_PROMPT}

You are Dr. Genie, a premium AI health and nutrition coach. Be warm, supportive, and professional.
You can help with any health-related question in an educational and practical way.
For diabetes ("sugar"), blood pressure, lifestyle, sleep, exercise, and diet questions:
- Provide concise daily routines and food guidance.
- Include caution notes where appropriate.
- Do not diagnose or prescribe medication changes.
Never expose internal tool names, function names, or JSON arguments in user-facing responses.
If you use tools, do it silently and present clean, natural language results.
When a user explicitly asks for a meal plan, call the generateMealPlan tool.
When a user explicitly asks for recipe/cooking instructions, call the getRecipeDetails tool.
For other health questions, respond conversationally with safe guidance.`;

        if (healthContext) {
            systemPrompt += `\n\nUser Profile: ${JSON.stringify(healthContext)}`;
        }

        const body = (await req.json()) as ChatRequestBody;
        const rawMessages = body.messages ?? [];

        const messages = normalizeIncomingMessages(rawMessages);
        const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");

        if (!lastUserMessage) {
            return new Response(JSON.stringify({ error: "No user message provided" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const { wantsMealPlan, wantsRecipe } = inferIntent(lastUserMessage.content);
        const activeTools: Array<"generateMealPlan" | "getRecipeDetails"> = wantsMealPlan
            ? ["generateMealPlan"]
            : wantsRecipe
                ? ["getRecipeDetails"]
                : [];

        const result = await generateText({
            model,
            system: systemPrompt,
            messages,
            toolChoice: activeTools.length > 0 ? "required" : "none",
            activeTools,
            tools: {
                generateMealPlan: createTool({
                    description: "Generate a complete daily meal plan with breakfast, lunch, dinner and snacks.",
                    inputSchema: mealPlanInputSchema,
                    execute: async (params) => {
                        try {
                            await connectDB();
                            const user = await User.findOne({ email: session.user.email });
                            if (user) {
                                await MealPlan.create({
                                    userId: user._id,
                                    title: params.title,
                                    description: params.description,
                                    meals: params.meals,
                                    totalNutrients: params.totalNutrients,
                                });
                            }
                            return params;
                        } catch (error) {
                            console.error("Error saving meal plan:", error);
                            return params;
                        }
                    },
                }),
                getRecipeDetails: createTool({
                    description: "Get detailed cooking instructions and nutritional information for a specific dish.",
                    inputSchema: recipeInputSchema,
                    execute: async (params) => params,
                }),
            },
            stopWhen: stepCountIs(2),
        });

        let finalToolCall: { toolName: string; input: unknown; toolCallId: string } | null = null;
        let finalToolResult: { output: unknown; toolCallId: string } | null = null;

        if (result.toolCalls?.[0]) {
            finalToolCall = result.toolCalls[0];
            finalToolResult = result.toolResults?.find((toolResult) => toolResult.toolCallId === finalToolCall?.toolCallId) ?? null;
        } else {
            for (const step of result.steps) {
                if (step.toolCalls?.[0]) {
                    finalToolCall = step.toolCalls[0];
                    finalToolResult = step.toolResults?.find((toolResult) => toolResult.toolCallId === finalToolCall?.toolCallId) ?? null;
                    if (finalToolCall) break;
                }
            }
        }

        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return new Response("User not found", { status: 404 });
        }

        let chatThread = null;
        if (body.threadId) {
            chatThread = await Chat.findOne({ _id: body.threadId, userId: user._id });
        }
        if (!chatThread) {
            chatThread = await Chat.create({
                userId: user._id,
                title: createThreadTitle(lastUserMessage.content),
                messages: [],
                lastMessageAt: new Date(),
            });
        } else if (!chatThread.title || chatThread.title === "New Chat") {
            const firstUserMessage = messages.find((message) => message.role === "user");
            if (firstUserMessage?.content) {
                chatThread.title = createThreadTitle(firstUserMessage.content);
                await chatThread.save();
            }
        }

        const responsePayload: ChatResponsePayload = {
            id: `msg-${Date.now()}`,
            role: "assistant",
            text: result.text || (finalToolCall ? "Here is what I prepared for you:" : ""),
            threadId: String(chatThread._id),
            toolCall: finalToolCall
                ? {
                      toolName: finalToolCall.toolName,
                      input: finalToolCall.input,
                      output: finalToolResult?.output ?? finalToolCall.input,
                  }
                : null,
        };

        const chatMessages = [
            { role: "user", content: lastUserMessage.content, createdAt: new Date() },
            {
                role: "assistant",
                content: responsePayload.text,
                toolCall: responsePayload.toolCall
                    ? {
                          toolName: responsePayload.toolCall.toolName,
                          args: responsePayload.toolCall.input,
                          result: responsePayload.toolCall.output,
                      }
                    : undefined,
                createdAt: new Date(),
            },
        ];

        await Chat.findOneAndUpdate(
            { _id: chatThread._id, userId: user._id },
            {
                $push: { messages: { $each: chatMessages } },
                $set: { lastMessageAt: new Date() },
            }
        );

        return new Response(JSON.stringify(responsePayload), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        console.error("Chat API Error:", error);
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });

        const body = (await req.json()) as RenameThreadBody;
        const threadId = body.threadId;
        const title = typeof body.title === "string" ? normalizeTitle(body.title) : "";

        if (!threadId || !title) {
            return new Response(JSON.stringify({ error: "threadId and title are required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (!user) return new Response("User not found", { status: 404 });

        const updated = await Chat.findOneAndUpdate(
            { _id: threadId, userId: user._id },
            { $set: { title } },
            { new: true }
        ).select("_id title");

        if (!updated) {
            return new Response(JSON.stringify({ error: "Thread not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(
            JSON.stringify({ id: String(updated._id), title: updated.title || "New Chat" }),
            { headers: { "Content-Type": "application/json" } }
        );
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return new Response(JSON.stringify({ error: message }), { status: 500 });
    }
}

