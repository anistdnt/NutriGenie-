"use client";

import { cn } from "@/src/lib/utils";

interface MessageBubbleProps {
    message: {
        role: string;
        parts?: Array<{ type: string; text?: string }>;
        content?: string; // fallback
    };
}

// Legacy component — kept for backward compatibility if used outside ChatWindow
// ChatWindow now renders messages inline using the v6 'parts' format
export default function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === "user";

    // Handle both v6 parts format and legacy content string
    const textContent = message.parts
        ? message.parts
            .filter((p) => p.type === "text")
            .map((p) => p.text)
            .join("")
        : message.content ?? "";

    return (
        <div className={cn("flex mb-4", isUser ? "justify-end" : "justify-start")}>
            <div
                className={cn(
                    "max-w-[75%] px-4 py-3 rounded-2xl text-sm",
                    isUser
                        ? "bg-black dark:bg-white text-white dark:text-black rounded-tr-none"
                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-none"
                )}
            >
                <span className={cn("font-semibold block mb-1 text-[10px] uppercase tracking-wider", isUser ? "opacity-70" : "opacity-50")}>
                    {isUser ? "You" : "Dr. Genie"}
                </span>
                <div className="whitespace-pre-wrap leading-relaxed">{textContent}</div>
            </div>
        </div>
    );
}
