"use client";

import { cn } from "@/src/lib/utils";
import { UIMessage } from "@ai-sdk/react";

interface MessageBubbleProps {
    message: UIMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === "user";

    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
            <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl ${isUser
                    ? "bg-black dark:bg-white text-white dark:text-black rounded-br-none"
                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-bl-none"
                    }`}
            >
                <span className={`font-semibold block mb-1 text-xs uppercase tracking-wider ${isUser ? "opacity-70" : "opacity-50"
                    }`}>
                    {isUser ? "You" : "Dr. Genie"}
                </span>
                <div className="whitespace-pre-wrap">{(message as any).content}</div>
            </div>
        </div>
    );
}
