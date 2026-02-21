"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Pencil, X } from "lucide-react";
import MealPlanCard from "./MealPlanCard";
import RecipeCard from "./RecipeCard";

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

const STARTER_PROMPTS = [
    "Create a high-protein meal plan for today.",
    "Give me a simple 20-minute dinner recipe.",
    "If I have diabetes, what should my daily routine look like?",
    "Suggest healthy snacks for evening cravings.",
];
const MIN_THREAD_WIDTH = 240;
const MAX_THREAD_WIDTH = 420;

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
        difficulty: value.difficulty === "Easy" || value.difficulty === "Medium" || value.difficulty === "Hard" ? value.difficulty : undefined,
        calories: typeof value.calories === "number" ? value.calories : undefined,
        protein: typeof value.protein === "number" ? value.protein : undefined,
        carbs: typeof value.carbs === "number" ? value.carbs : undefined,
        fat: typeof value.fat === "number" ? value.fat : undefined,
        ingredients: Array.isArray(value.ingredients) ? value.ingredients.filter((item): item is string => typeof item === "string") : undefined,
        instructions: Array.isArray(value.instructions) ? value.instructions.filter((item): item is string => typeof item === "string") : undefined,
    };
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
    const [threadSidebarWidth, setThreadSidebarWidth] = useState(280);
    const [isResizingThreadPanel, setIsResizingThreadPanel] = useState(false);
    const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
    const [draftThreadTitle, setDraftThreadTitle] = useState("");
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

    const loadThread = useCallback(async (threadId: string) => {
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
    }, [welcomeText]);

    const startNewChat = useCallback(() => {
        setActiveThreadId(null);
        setEditingThreadId(null);
        setDraftThreadTitle("");
        setMessages([{ id: "welcome", role: "assistant", text: welcomeText }]);
        setInput("");
        if (textareaRef.current) textareaRef.current.style.height = "44px";
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

        setThreads((prev) =>
            prev.map((thread) => (thread.id === threadId ? { ...thread, title } : thread))
        );
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
        if (textareaRef.current) textareaRef.current.style.height = "44px";
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const hasConversation = messages.some((message) => message.role === "user");
    const showStarterPrompts = !isBootstrapping && !hasConversation;

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
        <div className="flex h-full w-full bg-white dark:bg-gray-950 overflow-hidden relative">
            <aside
                ref={threadSidebarRef}
                className="hidden md:flex flex-col border-r border-gray-100 dark:border-gray-800 bg-white/85 dark:bg-gray-950/85 backdrop-blur-md z-10 shrink-0 relative"
                style={{ width: threadSidebarWidth }}
            >
                <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                    <button
                        onClick={startNewChat}
                        className="w-full px-3 py-2 rounded-lg text-sm font-semibold bg-gray-900 text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
                    >
                        + New Chat
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {threads.map((thread) => {
                        const isEditing = editingThreadId === thread.id;
                        return (
                            <div
                                key={thread.id}
                                className={`w-full px-2 py-2 rounded-lg transition-colors ${activeThreadId === thread.id
                                    ? "bg-green-100 text-gray-950 dark:bg-green-950/40 dark:text-green-100 border border-green-300 dark:border-green-800"
                                    : "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-900"
                                    }`}
                            >
                                {!isEditing && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => loadThread(thread.id)}
                                            className="flex-1 text-left min-w-0"
                                        >
                                            <p className="text-sm font-medium truncate">{thread.title || "New Chat"}</p>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingThreadId(thread.id);
                                                setDraftThreadTitle(thread.title || "New Chat");
                                            }}
                                            className="p-1 rounded hover:bg-gray-200/70 dark:hover:bg-gray-800"
                                            aria-label="Rename chat"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                                {isEditing && (
                                    <div className="flex items-center gap-1.5">
                                        <input
                                            value={draftThreadTitle}
                                            onChange={(e) => setDraftThreadTitle(e.target.value)}
                                            className="flex-1 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
                                            className="p-1 rounded hover:bg-green-200/70 dark:hover:bg-green-900/40"
                                            aria-label="Save chat title"
                                        >
                                            <Check className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingThreadId(null);
                                                setDraftThreadTitle("");
                                            }}
                                            className="p-1 rounded hover:bg-red-200/70 dark:hover:bg-red-900/40"
                                            aria-label="Cancel rename"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {threads.length === 0 && (
                        <p className="text-xs text-gray-500 px-2 py-4">No chats yet. Start a new conversation.</p>
                    )}
                </div>
                <div
                    className="absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-green-500/10 active:bg-green-500/20 transition-colors"
                    onMouseDown={() => setIsResizingThreadPanel(true)}
                    role="separator"
                    aria-orientation="vertical"
                    aria-label="Resize chat list panel"
                />
            </aside>

            <div className="flex flex-col flex-1 h-full overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.35] pointer-events-none" />

                <div className="flex-shrink-0 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md relative z-10">
                    <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Dr. Genie</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">Health coach chat</p>
                        </div>
                        <span className="text-[11px] font-semibold text-green-600 dark:text-green-400">{isBootstrapping ? "Syncing..." : "Ready"}</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-8 space-y-7 scroll-smooth custom-scrollbar relative z-10">
                    <div className="max-w-3xl mx-auto w-full">
                        {isBootstrapping && (
                            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 p-5 animate-pulse">
                                <div className="h-3 w-28 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
                                <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded mb-2" />
                                <div className="h-3 w-[85%] bg-gray-200 dark:bg-gray-800 rounded mb-2" />
                                <div className="h-3 w-[65%] bg-gray-200 dark:bg-gray-800 rounded" />
                            </div>
                        )}

                        {!isBootstrapping && messages.map((message) => {
                            const isUser = message.role === "user";
                            const toolName = message.toolCall?.toolName;
                            const toolOutput = message.toolCall?.output ?? message.toolCall?.result ?? message.toolCall?.args ?? message.toolCall?.input;
                            const mealPlanPayload = toolName === "generateMealPlan" ? asMealPlanPayload(toolOutput) : null;
                            const recipePayload = toolName === "getRecipeDetails" ? asRecipePayload(toolOutput) : null;

                            return (
                                <div key={message.id} className={`flex gap-4 mb-7 ${isUser ? "flex-row-reverse" : "flex-row"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                    <div
                                        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-black shadow-md ${isUser
                                            ? "bg-gray-900 dark:bg-white text-white dark:text-black border-2 border-gray-100 dark:border-gray-800"
                                            : "bg-gradient-to-br from-green-500 to-teal-600 text-white border-2 border-green-400/20"
                                            }`}
                                    >
                                        {isUser ? (session?.user?.name?.[0]?.toUpperCase() ?? "Y") : "G"}
                                    </div>

                                    <div className={`flex flex-col gap-1.5 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-2">
                                            {isUser ? "You" : "Dr. Genie"}
                                        </span>

                                        {message.text && !(toolName && isInternalToolText(message.text)) && (
                                            <div
                                                className={`px-5 py-3.5 rounded-2xl text-[14px] leading-[1.6] ${isUser
                                                    ? "bg-gray-900 dark:bg-white text-white dark:text-black rounded-tr-none shadow-lg shadow-black/5"
                                                    : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-800 rounded-tl-none shadow-sm"
                                                    }`}
                                            >
                                                {renderText(message.text)}
                                            </div>
                                        )}

                                        {toolName === "generateMealPlan" && mealPlanPayload && (
                                            <div className="w-full mt-2 animate-in zoom-in-95 duration-500">
                                                <MealPlanCard {...mealPlanPayload} />
                                            </div>
                                        )}

                                        {toolName === "getRecipeDetails" && recipePayload && (
                                            <div className="w-full mt-2 animate-in zoom-in-95 duration-500">
                                                <RecipeCard {...recipePayload} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {showStarterPrompts && (
                            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 p-4 mb-6">
                                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                                    Quick Start
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {STARTER_PROMPTS.map((prompt) => (
                                        <button
                                            key={prompt}
                                            onClick={() => sendMessage(prompt)}
                                            disabled={isLoading}
                                            className="text-left text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50/50 dark:hover:bg-green-950/30 transition-colors disabled:opacity-50"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {isLoading && (
                            <div className="flex gap-4 animate-in fade-in duration-300">
                                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-[10px] font-black text-white shadow-md border-2 border-green-400/20">
                                    G
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-2">
                                        Dr. Genie
                                    </span>
                                    <div className="px-5 py-4 rounded-2xl rounded-tl-none bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm inline-flex">
                                        <div className="flex items-center gap-1.5">
                                            {[0, 150, 300].map((delay, idx) => (
                                                <div key={idx} className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div ref={messagesEndRef} className="h-4" />
                </div>

                <div className="flex-shrink-0 border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl px-4 pt-4 pb-6 z-20">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-end gap-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-1.5 border border-gray-200/50 dark:border-gray-800/50 shadow-inner">
                            <textarea
                                ref={textareaRef}
                                rows={1}
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    adjustTextareaHeight();
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder={status === "authenticated" ? "Type your health question..." : "Sign in to start chatting"}
                                disabled={isLoading || status !== "authenticated"}
                                className="flex-1 resize-none bg-transparent px-4 py-3 text-[14px] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none disabled:opacity-50 leading-relaxed scrollbar-hide"
                                style={{ minHeight: "44px", maxHeight: "160px", overflowY: "auto" }}
                            />
                            <button
                                onClick={() => sendMessage()}
                                disabled={isLoading || !input.trim() || status !== "authenticated"}
                                className="flex-shrink-0 w-11 h-11 rounded-xl bg-green-600 text-white flex items-center justify-center hover:bg-green-700 active:scale-95 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/20"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4.5 h-4.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-center text-[10px] font-bold text-gray-400 dark:text-gray-600 mt-3 tracking-widest uppercase">
                            NutriGenie - Built with Advanced Medical Intelligence
                        </p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 20px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1e293b;
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
