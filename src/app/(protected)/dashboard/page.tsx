"use client";

import { useEffect, useState } from "react";
import ChatWindow from "@/src/components/chat/ChatWindow";
import StatsOverview from "@/src/components/dashboard/StatsOverview";
import { Activity } from "lucide-react";

const MIN_STATS_WIDTH = 320;
const MAX_STATS_WIDTH = 520;

export default function DashboardPage() {
    const [statsWidth, setStatsWidth] = useState(380);
    const [isResizingStats, setIsResizingStats] = useState(false);

    useEffect(() => {
        if (!isResizingStats) return undefined;

        const onMouseMove = (event: MouseEvent) => {
            const nextWidth = Math.max(MIN_STATS_WIDTH, Math.min(MAX_STATS_WIDTH, event.clientX));
            setStatsWidth(nextWidth);
        };

        const onMouseUp = () => setIsResizingStats(false);

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [isResizingStats]);

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-950">
            <aside
                className="hidden lg:flex flex-col border-r border-slate-800 bg-slate-900/40 backdrop-blur-sm overflow-y-auto custom-scrollbar p-6 relative shrink-0"
                style={{ width: statsWidth }}
            >
                <div className="mb-8 px-2">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <Activity className="w-6 h-6 text-green-600" />
                        Dashboard
                    </h2>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Health & Nutrition Overview</p>
                </div>

                <StatsOverview />

                <div
                    className="absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-green-500/10 active:bg-green-500/20 transition-colors"
                    onMouseDown={() => setIsResizingStats(true)}
                    role="separator"
                    aria-orientation="vertical"
                    aria-label="Resize dashboard panel"
                />
            </aside>

            <main className="flex-1 flex flex-col relative overflow-hidden h-full">
                <ChatWindow />
            </main>
        </div>
    );
}
