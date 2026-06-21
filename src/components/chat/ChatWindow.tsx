"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
    ArrowUp,
    Bot,
    Check,
    ChevronDown,
    ChevronUp,
    HeartPulse,
    MessageSquare,
    Pencil,
    Plus,
    Settings,
    UtensilsCrossed,
    X,
    type LucideIcon,
} from "lucide-react";
import MealPlanCard from "./MealPlanCard";
import RecipeCard from "./RecipeCard";
import StatsOverview from "../dashboard/StatsOverview";

type MessageRole = "user" | "assistant";

interface ChatToolCall {
    toolName: string;
    input?: unknown;
    output?: unknown;
    args?: unknown;
    result?: unknown;
}

interface Message {
    id: string;
    role: MessageRole;
    text?: string;
    toolCall?: ChatToolCall | null;
}

interface HistoryMessage {
    role: string;
    content?: string;
    toolCall?: ChatToolCall;
}

interface ThreadSummary {
    id: string;
    title: string;
    lastMessageAt?: string;
}

interface ChatHistoryResponse {
    threadId?: string | null;
    messages?: HistoryMessage[];
}

interface ThreadsResponse {
    threads?: ThreadSummary[];
}

interface ChatResponse {
    text?: string;
    threadId?: string;
    toolCall?: ChatToolCall | null;
}

interface SidebarItem {
    id: string;
    label: string;
    description: string;
    icon: LucideIcon;
    accent: string;
    expandable?: boolean;
}

const STARTER_PROMPTS = [
    "Create a high-protein meal plan for today.",
    "Give me a simple 20-minute dinner recipe.",
    "If I have diabetes, what should my daily routine look like?",
    "Suggest healthy snacks for evening cravings.",
];

const SIDEBAR_ITEMS: SidebarItem[] = [
    {
        id: "current-chat",
        label: "Current Chat",
        description: "Your live nutrition assistant",
        icon: MessageSquare,
        accent: "from-emerald-400/25 to-emerald-300/5",
    },
    {
        id: "meal-plans",
        label: "Meal Plans",
        description: "Plan ideas and nutrition flows",
        icon: UtensilsCrossed,
        accent: "from-amber-300/20 to-amber-200/5",
        expandable: true,
    },
    {
        id: "vitals",
        label: "Vitals",
        description: "Track your health signals",
        icon: HeartPulse,
        accent: "from-violet-300/20 to-violet-200/5",
        expandable: true,
    },
];

const MIN_THREAD_WIDTH = 260;
const MAX_THREAD_WIDTH = 430;

function createWelcomeText(firstName: string) {
    return `Hello ${firstName}. I am Dr. Genie, your personal health and nutrition coach.

You can ask me anything health-related:
- Daily lifestyle planning
- Diabetes/sugar management tips
- Meal plans and recipes
- Nutrition and wellness guidance

What can I help you with today?`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function asMealPlanPayload(value: unknown): React.ComponentProps<typeof MealPlanCard> | null {
    if (!isRecord(value)) return null;
    return {
        title: typeof value.title === "string" ? value.title : undefined,
        description: typeof value.description === "string" ? value.description : undefined,
        meals: isRecord(value.meals) ? (value.meals as React.ComponentProps<typeof MealPlanCard>["meals"]) : undefined,
        totalNutrients: isRecord(value.totalNutrients)
            ? (value.totalNutrients as React.ComponentProps<typeof MealPlanCard>["totalNutrients"])
            : undefined,
    };
}

function asRecipePayload(value: unknown): React.ComponentProps<typeof RecipeCard> | null {
    if (!isRecord(value)) return null;
    return {
        name: typeof value.name === "string" ? value.name : undefined,
        description: typeof value.description === "string" ? value.description : undefined,
        prepTime: typeof value.prepTime === "string" ? value.prepTime : undefined,
        difficulty:
            value.difficulty === "Easy" || value.difficulty === "Medium" || value.difficulty === "Hard"
                ? value.difficulty
                : undefined,
        calories: typeof value.calories === "number" ? value.calories : undefined,
        protein: typeof value.protein === "number" ? value.protein : undefined,
        carbs: typeof value.carbs === "number" ? value.carbs : undefined,
        fat: typeof value.fat === "number" ? value.fat : undefined,
        ingredients: Array.isArray(value.ingredients)
            ? value.ingredients.filter((item): item is string => typeof item === "string")
            : undefined,
        instructions: Array.isArray(value.instructions)
            ? value.instructions.filter((item): item is string => typeof item === "string")
            : undefined,
    };
}

function stripCodeFence(text: string) {
    return text
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
}

function parseSerializedToolCall(text?: string): ChatToolCall | null {
    if (!text) return null;
    const cleaned = stripCodeFence(text);
    if (!cleaned.startsWith("[") && !cleaned.startsWith("{")) return null;

    try {
        const parsed = JSON.parse(cleaned) as unknown;
        const candidate = Array.isArray(parsed) ? parsed[0] : parsed;
        if (!isRecord(candidate)) return null;

        const toolName =
            typeof candidate.name === "string"
                ? candidate.name
                : typeof candidate.toolName === "string"
                    ? candidate.toolName
                    : "";
        const input = candidate.parameters ?? candidate.input ?? candidate.args;

        if (toolName !== "generateMealPlan" && toolName !== "getRecipeDetails") return null;
        if (!isRecord(input)) return null;

        return { toolName, input, output: input };
    } catch {
        return null;
    }
}

function formatThreadTimestamp(value?: string) {
    if (!value) return "New chat";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "New chat";

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
    }).format(parsed);
}

export default function ChatWindow() {
    const { data: session, status } = useSession();
    const threadSidebarRef = useRef<HTMLElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const firstName = session?.user?.name?.split(" ")[0] || "there";
    const welcomeText = useMemo(() => createWelcomeText(firstName), [firstName]);

    const [messages, setMessages] = useState<Message[]>([]);
    const [threads, setThreads] = useState<ThreadSummary[]>([]);
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
    const [threadSidebarWidth, setThreadSidebarWidth] = useState(296);
    const [isResizingThreadPanel, setIsResizingThreadPanel] = useState(false);
    const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
    const [draftThreadTitle, setDraftThreadTitle] = useState("");
    const [expandedSidebarSection, setExpandedSidebarSection] = useState<"meal-plans" | "vitals" | null>(null);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isBootstrapping, setIsBootstrapping] = useState(true);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading, isBootstrapping]);

    useEffect(() => {
        if (!isResizingThreadPanel) return undefined;

        const onMouseMove = (event: MouseEvent) => {
            const left = threadSidebarRef.current?.getBoundingClientRect().left ?? 0;
            const nextWidth = Math.max(MIN_THREAD_WIDTH, Math.min(MAX_THREAD_WIDTH, event.clientX - left));
            setThreadSidebarWidth(nextWidth);
        };

        const onMouseUp = () => setIsResizingThreadPanel(false);

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [isResizingThreadPanel]);

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    };

    const fetchThreads = useCallback(async () => {
        const res = await fetch("/api/chat?threads=1");
        if (!res.ok) throw new Error("Failed to fetch threads");
        const data = (await res.json()) as ThreadsResponse;
        setThreads(data.threads ?? []);
        return data.threads ?? [];
    }, []);

    const loadThread = useCallback(
        async (threadId: string) => {
            const res = await fetch(`/api/chat?threadId=${threadId}`);
            if (!res.ok) throw new Error("Failed to load thread");
            const data = (await res.json()) as ChatHistoryResponse;
            const history: Message[] = (data.messages ?? []).map((message, idx) => ({
                id: `hist-${threadId}-${idx}-${Date.now()}`,
                role: message.role === "user" ? "user" : "assistant",
                text: typeof message.content === "string" ? message.content : "",
                toolCall: message.toolCall,
            }));
            setMessages(history.length ? history : [{ id: "welcome", role: "assistant", text: welcomeText }]);
            setActiveThreadId(threadId);
        },
        [welcomeText]
    );

    const startNewChat = useCallback(() => {
        setActiveThreadId(null);
        setEditingThreadId(null);
        setDraftThreadTitle("");
        setMessages([{ id: "welcome", role: "assistant", text: welcomeText }]);
        setInput("");
        if (textareaRef.current) textareaRef.current.style.height = "56px";
    }, [welcomeText]);

    const renameThread = useCallback(async (threadId: string, nextTitle: string) => {
        const title = nextTitle.trim();
        if (!title) return;

        const res = await fetch("/api/chat", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ threadId, title }),
        });
        if (!res.ok) throw new Error("Failed to rename thread");

        setThreads((prev) => prev.map((thread) => (thread.id === threadId ? { ...thread, title } : thread)));
    }, []);

    useEffect(() => {
        const bootstrap = async () => {
            if (status === "loading") return;
            if (status !== "authenticated") {
                setThreads([]);
                setActiveThreadId(null);
                setMessages([{ id: "welcome", role: "assistant", text: welcomeText }]);
                setIsBootstrapping(false);
                return;
            }

            setIsBootstrapping(true);
            try {
                const threadList = await fetchThreads();
                if (threadList.length > 0) {
                    await loadThread(threadList[0].id);
                } else {
                    startNewChat();
                }
            } catch (error) {
                console.error("Failed to bootstrap chat:", error);
                startNewChat();
            } finally {
                setIsBootstrapping(false);
            }
        };

        bootstrap();
    }, [fetchThreads, loadThread, startNewChat, status, welcomeText]);

    const sendMessage = async (presetText?: string) => {
        const text = (presetText ?? input).trim();
        if (!text || isLoading || status !== "authenticated") return;

        const userMessage: Message = { id: `user-${Date.now()}`, role: "user", text };
        const nextMessages = [...messages, userMessage];

        setMessages(nextMessages);
        setInput("");
        if (textareaRef.current) textareaRef.current.style.height = "56px";
        setIsLoading(true);

        try {
            const history = nextMessages.map((message) => ({
                role: message.role,
                parts: [{ type: "text", text: message.text ?? "" }],
            }));

            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ threadId: activeThreadId, messages: history }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: "Unknown error" }));
                throw new Error(err.error || `Server error: ${res.status}`);
            }

            const data = (await res.json()) as ChatResponse;
            const assistantMessage: Message = {
                id: `assistant-${Date.now()}`,
                role: "assistant",
                text: data.text ?? "",
                toolCall: data.toolCall,
            };

            setMessages((prev) => [...prev, assistantMessage]);
            if (data.threadId) setActiveThreadId(data.threadId);

            const updatedThreads = await fetchThreads();
            if (!activeThreadId && data.threadId && updatedThreads.length > 0) {
                setActiveThreadId(data.threadId);
                setThreads((prev) =>
                    prev.map((thread) =>
                        thread.id === data.threadId && (!thread.title || thread.title === "New Chat")
                            ? { ...thread, title: text.slice(0, 60) }
                            : thread
                    )
                );
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Please try again.";
            setMessages((prev) => [
                ...prev,
                { id: `error-${Date.now()}`, role: "assistant", text: `Sorry, something went wrong: ${message}` },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    const hasConversation = messages.some((message) => message.role === "user");
    const showStarterPrompts = !isBootstrapping && !hasConversation;
    const userMessageCount = messages.filter((message) => message.role === "user").length;
    const activeThread = threads.find((thread) => thread.id === activeThreadId) ?? null;
    const conversationTitle = activeThread?.title || (hasConversation ? "Current conversation" : "AI Health Assistant");

    const renderText = (text: string) => {
        const lines = text.split("\n");
        return lines.map((line, lineIndex) => {
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
                <span key={lineIndex}>
                    {parts.map((part, partIndex) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                            <strong key={partIndex}>{part.slice(2, -2)}</strong>
                        ) : (
                            <span key={partIndex}>{part}</span>
                        )
                    )}
                    {lineIndex < lines.length - 1 && <br />}
                </span>
            );
        });
    };

    const isInternalToolText = (text: string) =>
        /(i will call|function|arguments:|getrecipedetails|generatemealplan|\{[\s\S]*"parameters"[\s\S]*\})/i.test(text);

    return (
        <div className="dark relative flex h-full w-full overflow-hidden bg-[#0a1120] text-slate-100">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(78,222,163,0.12),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(83,122,255,0.12),_transparent_28%)]" />

            <aside
                ref={threadSidebarRef}
                className="no-scrollbar relative z-10 hidden shrink-0 overflow-y-auto overscroll-contain border-r border-white/6 bg-[#141c30]/95 backdrop-blur-xl md:flex md:flex-col"
                style={{ width: threadSidebarWidth }}
            >
                <div className="p-5 pb-4">
                    <button
                        onClick={startNewChat}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#4edea3] to-[#1fcf9a] px-4 py-4 text-sm font-semibold text-[#08111f] shadow-[0_18px_40px_rgba(78,222,163,0.18)] transition-transform hover:scale-[1.01] active:scale-[0.99]"
                    >
                        <Plus className="h-4 w-4" />
                        New Conversation
                    </button>
                </div>

                <div className="px-4 pb-4">
                    <p className="px-3 text-[10px] font-bold uppercase tracking-[0.28em] text-[#4edea3]">
                        Navigation
                    </p>
                    <div className="mt-3 space-y-2">
                        {SIDEBAR_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const isExpanded = expandedSidebarSection === item.id;
                            const isCurrentChat = item.id === "current-chat";
                            return (
                                <div key={item.id} className="space-y-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!item.expandable) return;
                                            setExpandedSidebarSection((prev) => (prev === item.id ? null : (item.id as "meal-plans" | "vitals")));
                                        }}
                                        className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all ${
                                            isCurrentChat || isExpanded
                                                ? "border border-[#4edea3]/30 bg-[#1b2338] text-[#4edea3] shadow-[inset_0_0_0_1px_rgba(78,222,163,0.06)]"
                                                : "border border-transparent bg-transparent text-slate-400 hover:border-white/6 hover:bg-[#1a2236]"
                                        }`}
                                    >
                                        <div
                                            className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accent} ${
                                                isCurrentChat || isExpanded ? "text-[#4edea3]" : "text-slate-300"
                                            }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold">{item.label}</p>
                                            <p className="truncate text-xs text-slate-500 group-hover:text-slate-400">
                                                {item.description}
                                            </p>
                                        </div>
                                        {item.expandable &&
                                            (isExpanded ? (
                                                <ChevronUp className="h-4 w-4 text-slate-400" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 text-slate-500" />
                                            ))}
                                    </button>

                                    {item.id === "meal-plans" && isExpanded && (
                                        <div className="rounded-[24px] border border-white/6 bg-[#10182a] p-3">
                                            <StatsOverview section="plans" compact />
                                        </div>
                                    )}

                                    {item.id === "vitals" && isExpanded && (
                                        <div className="rounded-[24px] border border-white/6 bg-[#10182a] p-3">
                                            <div className="mb-3 px-1">
                                                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                                                    Health & Nutrition Overview
                                                </p>
                                            </div>
                                            <StatsOverview section="vitals" compact />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex min-h-[300px] flex-1 flex-col px-4 pb-4">
                    <div className="flex min-h-0 flex-1 flex-col rounded-[28px] border border-white/6 bg-[#11192a]/90 p-3 shadow-[0_20px_50px_rgba(3,8,20,0.35)]">
                        <div className="flex items-center justify-between px-2 pb-3">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                                    Chat History
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    {threads.length} saved {threads.length === 1 ? "conversation" : "conversations"}
                                </p>
                            </div>
                            <div className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                Live
                            </div>
                        </div>

                        <div className="no-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                            {threads.map((thread) => {
                                const isEditing = editingThreadId === thread.id;

                                return (
                                    <div
                                        key={thread.id}
                                        className={`rounded-2xl border px-3 py-3 transition-all ${
                                            activeThreadId === thread.id
                                                ? "border-[#4edea3]/35 bg-[#1b2439] shadow-[0_0_0_1px_rgba(78,222,163,0.07)]"
                                                : "border-white/6 bg-[#171f33]/60 hover:border-white/10 hover:bg-[#1a2338]"
                                        }`}
                                    >
                                        {!isEditing && (
                                            <div className="flex items-start gap-2">
                                                <button
                                                    onClick={() => loadThread(thread.id)}
                                                    className="min-w-0 flex-1 text-left"
                                                >
                                                    <p
                                                        className={`truncate text-sm font-semibold ${
                                                            activeThreadId === thread.id ? "text-slate-100" : "text-slate-200"
                                                        }`}
                                                    >
                                                        {thread.title || "New Chat"}
                                                    </p>
                                                    <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                                                        {formatThreadTimestamp(thread.lastMessageAt)}
                                                    </p>
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setEditingThreadId(thread.id);
                                                        setDraftThreadTitle(thread.title || "New Chat");
                                                    }}
                                                    className="rounded-xl border border-transparent p-2 text-slate-400 transition-colors hover:border-white/8 hover:bg-white/5 hover:text-slate-200"
                                                    aria-label="Rename chat"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        )}

                                        {isEditing && (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    value={draftThreadTitle}
                                                    onChange={(event) => setDraftThreadTitle(event.target.value)}
                                                    className="flex-1 rounded-xl border border-white/10 bg-[#0d1526] px-3 py-2 text-sm text-slate-100 outline-none transition-colors focus:border-[#4edea3]/50"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            await renameThread(thread.id, draftThreadTitle);
                                                        } catch (error) {
                                                            console.error("Rename failed:", error);
                                                        } finally {
                                                            setEditingThreadId(null);
                                                            setDraftThreadTitle("");
                                                        }
                                                    }}
                                                    className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-2 text-emerald-300 transition-colors hover:bg-emerald-400/15"
                                                    aria-label="Save chat title"
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingThreadId(null);
                                                        setDraftThreadTitle("");
                                                    }}
                                                    className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition-colors hover:bg-white/10"
                                                    aria-label="Cancel rename"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {threads.length === 0 && (
                                <div className="rounded-2xl border border-dashed border-white/10 bg-[#171f33]/50 px-4 py-6 text-center">
                                    <p className="text-sm font-medium text-slate-300">No chats yet</p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Start a new conversation to build your history.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-4 pb-5 pt-1">
                    <button
                        type="button"
                        className="flex w-full items-center gap-3 rounded-2xl border border-white/6 bg-[#151d31] px-4 py-3 text-left text-slate-300 transition-colors hover:bg-[#1a2337]"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-slate-200">
                            <Settings className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">Settings</p>
                            <p className="text-xs text-slate-500">We can wire this panel next.</p>
                        </div>
                    </button>
                </div>

                <div
                    className="absolute right-0 top-0 h-full w-2 cursor-col-resize transition-colors hover:bg-[#4edea3]/10 active:bg-[#4edea3]/20"
                    onMouseDown={() => setIsResizingThreadPanel(true)}
                    role="separator"
                    aria-orientation="vertical"
                    aria-label="Resize chat list panel"
                />
            </aside>

            <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
                <div className="border-b border-white/6 bg-[#141c2e]/78 backdrop-blur-xl">
                    <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
                        <div>
                            <p className="text-xs font-medium text-slate-400">Conversation with</p>
                            <p className="text-sm font-semibold text-[#4edea3]">{conversationTitle}</p>
                        </div>
                        <div className="flex items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/8 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4edea3]">
                            <span className="h-2 w-2 rounded-full bg-[#4edea3]" />
                            {isBootstrapping ? "Syncing" : "Neural Engine Active"}
                        </div>
                    </div>
                </div>

                <div className="custom-scrollbar relative flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
                    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
                        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.8fr)]">
                            <div className="overflow-hidden rounded-[32px] border border-white/6 bg-[#151d31]/95 p-6 shadow-[0_30px_60px_rgba(3,8,20,0.3)]">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="max-w-xl">
                                        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#4edea3]">
                                            Conversation Studio
                                        </p>
                                        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-[2.5rem]">
                                            Refined AI chat for nutrition guidance
                                        </h2>
                                        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
                                            Your sidebar now keeps navigation, history, and settings visually separate,
                                            while the main canvas stays focused on the conversation flow.
                                        </p>
                                    </div>

                                    <div className="hidden rounded-[24px] bg-[#223f48] p-6 text-[#7be6d1] lg:block">
                                        <MessageSquare className="h-12 w-12" />
                                    </div>
                                </div>

                                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                                    <div className="rounded-[24px] border border-white/6 bg-[#11192a] p-4">
                                        <p className="text-xs text-slate-400">Saved chats</p>
                                        <p className="mt-2 text-4xl font-black tracking-tight text-white">{threads.length}</p>
                                        <div className="mt-3 h-1.5 rounded-full bg-white/5">
                                            <div
                                                className="h-full rounded-full bg-[#4edea3]"
                                                style={{ width: `${Math.min(100, Math.max(18, threads.length * 12))}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="rounded-[24px] border border-white/6 bg-[#11192a] p-4">
                                        <p className="text-xs text-slate-400">Messages in view</p>
                                        <p className="mt-2 text-4xl font-black tracking-tight text-white">{messages.length}</p>
                                        <div className="mt-3 h-1.5 rounded-full bg-white/5">
                                            <div
                                                className="h-full rounded-full bg-[#9ab4ff]"
                                                style={{ width: `${Math.min(100, Math.max(22, messages.length * 9))}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="rounded-[24px] border border-white/6 bg-[#11192a] p-4">
                                        <p className="text-xs text-slate-400">User prompts sent</p>
                                        <p className="mt-2 text-4xl font-black tracking-tight text-white">
                                            {userMessageCount}
                                        </p>
                                        <div className="mt-3 h-1.5 rounded-full bg-white/5">
                                            <div
                                                className="h-full rounded-full bg-[#7be6d1]"
                                                style={{ width: `${Math.min(100, Math.max(14, userMessageCount * 14))}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col justify-between rounded-[32px] border border-white/6 bg-[#171f33]/95 p-6 shadow-[0_30px_60px_rgba(3,8,20,0.28)]">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#b3c4ff]">
                                        Up Next
                                    </p>
                                    <h3 className="mt-3 text-3xl font-bold text-white">Meal planning</h3>
                                    <p className="mt-3 text-sm leading-7 text-slate-400">
                                        Generated meal plans and recipes still render in-chat, so the refreshed layout
                                        preserves the same assistant workflow while making the experience feel more
                                        intentional.
                                    </p>
                                </div>

                                <div className="mt-6 rounded-[28px] border border-white/6 bg-[#0f1728] p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-200">Active workspace</p>
                                            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                                                {activeThread ? "Current thread selected" : "Ready for a fresh chat"}
                                            </p>
                                        </div>
                                        <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-[#24474e] text-[#7be6d1]">
                                            <UtensilsCrossed className="h-7 w-7" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {showStarterPrompts && (
                            <section className="rounded-[28px] border border-white/6 bg-[#121a2b]/92 p-4 shadow-[0_18px_40px_rgba(3,8,20,0.26)]">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#4edea3]">
                                            Quick Start
                                        </p>
                                        <p className="mt-2 text-sm text-slate-400">
                                            Kick off the conversation with one tap.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-3">
                                    {STARTER_PROMPTS.map((prompt) => (
                                        <button
                                            key={prompt}
                                            onClick={() => sendMessage(prompt)}
                                            disabled={isLoading}
                                            className="rounded-full border border-white/8 bg-[#242c42] px-4 py-2 text-left text-sm text-slate-200 transition-colors hover:border-[#4edea3]/35 hover:text-white disabled:opacity-50"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section className="space-y-7 pb-4">
                            {isBootstrapping && (
                                <div className="rounded-[28px] border border-white/6 bg-[#121a2b]/92 p-6">
                                    <div className="animate-pulse">
                                        <div className="h-3 w-32 rounded bg-white/10" />
                                        <div className="mt-4 h-4 w-full rounded bg-white/10" />
                                        <div className="mt-3 h-4 w-[88%] rounded bg-white/10" />
                                        <div className="mt-3 h-4 w-[72%] rounded bg-white/10" />
                                    </div>
                                </div>
                            )}

                            {!isBootstrapping &&
                                messages.map((message) => {
                                    const isUser = message.role === "user";
                                    const toolCall = message.toolCall ?? parseSerializedToolCall(message.text);
                                    const toolName = toolCall?.toolName;
                                    const toolOutput =
                                        toolCall?.output ??
                                        toolCall?.result ??
                                        toolCall?.args ??
                                        toolCall?.input;
                                    const mealPlanPayload =
                                        toolName === "generateMealPlan" ? asMealPlanPayload(toolOutput) : null;
                                    const recipePayload =
                                        toolName === "getRecipeDetails" ? asRecipePayload(toolOutput) : null;

                                    return (
                                        <div
                                            key={message.id}
                                            className={`flex gap-4 ${
                                                isUser ? "justify-end" : "justify-start"
                                            } animate-in fade-in slide-in-from-bottom-2 duration-300`}
                                        >
                                            {!isUser && (
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#4edea3]/20 bg-[#192235] text-[#4edea3] shadow-[0_0_0_10px_rgba(78,222,163,0.04)]">
                                                    <Bot className="h-5 w-5" />
                                                </div>
                                            )}

                                            <div
                                                className={`flex max-w-[min(84%,56rem)] flex-col gap-3 ${
                                                    isUser ? "items-end" : "items-start"
                                                }`}
                                            >
                                                <span className="px-1 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
                                                    {isUser ? "You" : "Dr. Genie"}
                                                </span>

                                                {message.text && !(toolName && isInternalToolText(message.text)) && (
                                                    <div
                                                        className={`rounded-[28px] px-6 py-5 text-[15px] leading-8 shadow-[0_20px_40px_rgba(3,8,20,0.18)] ${
                                                            isUser
                                                                ? "rounded-tr-[8px] bg-[#2a3248] text-slate-100"
                                                                : "rounded-tl-[8px] border border-white/6 bg-[#121a2c]/95 text-slate-100"
                                                        }`}
                                                    >
                                                        {renderText(message.text)}
                                                    </div>
                                                )}

                                                {toolName === "generateMealPlan" && mealPlanPayload && (
                                                    <div className="w-full animate-in zoom-in-95 duration-500">
                                                        <MealPlanCard {...mealPlanPayload} />
                                                    </div>
                                                )}

                                                {toolName === "getRecipeDetails" && recipePayload && (
                                                    <div className="w-full animate-in zoom-in-95 duration-500">
                                                        <RecipeCard {...recipePayload} />
                                                    </div>
                                                )}
                                            </div>

                                            {isUser && (
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#eef2ff] text-base font-black text-[#16213a]">
                                                    {session?.user?.name?.[0]?.toUpperCase() ?? "Y"}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                            {isLoading && (
                                <div className="flex gap-4 animate-in fade-in duration-300">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#4edea3]/20 bg-[#192235] text-[#4edea3] shadow-[0_0_0_10px_rgba(78,222,163,0.04)]">
                                        <Bot className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <span className="px-1 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
                                            Dr. Genie
                                        </span>
                                        <div className="inline-flex rounded-[24px] rounded-tl-[8px] border border-white/6 bg-[#121a2c]/95 px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                {[0, 150, 300].map((delay, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="h-2 w-2 rounded-full bg-[#4edea3] animate-bounce"
                                                        style={{ animationDelay: `${delay}ms` }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} className="h-2" />
                        </section>
                    </div>
                </div>

                <div className="border-t border-white/6 bg-[#10182a]/88 px-4 py-5 backdrop-blur-xl sm:px-6 lg:px-8">
                    <div className="mx-auto w-full max-w-6xl">
                        <div className="rounded-[30px] border border-white/6 bg-[#262e44]/92 px-4 py-2 shadow-[0_22px_40px_rgba(3,8,20,0.28)]">
                            <div className="flex items-center gap-3">
                                {/* <button
                                    type="button"
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 bg-none transition-colors hover:bg-slate-600"
                                >
                                    <Plus className="h-5 w-5" />
                                </button> */}
                                <textarea
                                    ref={textareaRef}
                                    rows={1}
                                    value={input}
                                    onChange={(event) => {
                                        setInput(event.target.value);
                                        adjustTextareaHeight();
                                    }}
                                    onKeyDown={handleKeyDown}
                                    placeholder={
                                        status === "authenticated"
                                            ? "Ask NutriGenie about your health, nutrition, or meal prep..."
                                            : "Sign in to start chatting"
                                    }
                                    disabled={isLoading || status !== "authenticated"}
                                    className="scrollbar-hide flex-1 resize-none bg-transparent px-1 py-4 text-[15px] leading-7 text-slate-100 placeholder:text-slate-500 focus:outline-none disabled:opacity-50"
                                    style={{ minHeight: "56px", maxHeight: "160px", overflowY: "auto" }}
                                />
                                <button
                                    onClick={() => sendMessage()}
                                    disabled={isLoading || !input.trim() || status !== "authenticated"}
                                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#4edea3] text-[#08111f] transition-all hover:shadow-[0_14px_30px_rgba(78,222,163,0.25)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                    <ArrowUp className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <p className="mt-4 text-center text-[11px] uppercase tracking-[0.22em] text-slate-600">
                            AI-generated insights should be verified with a healthcare professional.
                        </p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(148, 163, 184, 0.25);
                    border-radius: 999px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(148, 163, 184, 0.4);
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                    width: 0 !important;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                    width: 0 !important;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                    overflow: -moz-scrollbars-none;
                }
                textarea:focus {
                    outline: none;
                }
            `}</style>
        </div>
    );
}
