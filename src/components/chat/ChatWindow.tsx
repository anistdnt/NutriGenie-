"use client";

import { useChat } from "@ai-sdk/react";
import MessageBubble from "./MessageBubble";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

export default function ChatWindow() {
    const { data: session } = useSession();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [input, setInput] = useState(""); // Added input state
    const { messages, append, isLoading } = useChat({
        api: "/api/chat",
        initialMessages: [
            {
                id: "welcome",
                role: "assistant",
                content: `Hello ${session?.user?.name || "there"}! 👋\nI'm Dr. Genie, your personal health AI. How can I help you today?`,
            },
        ],
    } as any) as any;

    // Added handleManualSubmit function
    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input;
        setInput("");
        await append({ role: "user", content: userMessage });
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto w-full bg-gray-50 dark:bg-gray-950">
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {messages.map((m: any) => (
                    <MessageBubble key={m.id} message={m} />
                ))}
                {isLoading && (
                    <div className="flex justify-start mb-4 animate-pulse">
                        <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-none border border-gray-100 dark:border-gray-700 text-sm text-gray-400 dark:text-gray-500">
                            Genie is thinking...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-t border-gray-100 dark:border-gray-800">
                <form onSubmit={handleManualSubmit} className="relative flex items-center gap-2">
                    <input
                        className="flex-1 p-3 pr-12 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-sm"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything about your health or diet..."
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 p-2 bg-black dark:bg-white text-white dark:text-black rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-4"
                        >
                            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                        </svg>
                    </button>
                </form>
                <p className="text-center text-[10px] text-gray-400 mt-2">
                    AI can make mistakes. Verify important medical info.
                </p>
            </div>
        </div>
    );
}
