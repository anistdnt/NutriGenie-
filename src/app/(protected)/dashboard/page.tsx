"use client";

import ChatWindow from "@/src/components/chat/ChatWindow";

export default function DashboardPage() {
    return (
        <main className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-950">
            <ChatWindow />
        </main>
    );
}
