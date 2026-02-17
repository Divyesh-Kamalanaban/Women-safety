"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
    title: string;
    value: string | number;
    change?: string;
    changeType?: "positive" | "negative" | "neutral";
    icon: LucideIcon;
    color?: string;
}

export default function KPICard({ title, value, change, changeType = "neutral", icon: Icon, color = "text-primary" }: KPICardProps) {
    return (
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group hover:bg-white/10 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-2 rounded-lg bg-white/5", color)}>
                    <Icon size={24} />
                </div>
                {change && (
                    <span className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full border",
                        changeType === "positive" ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/10" :
                            changeType === "negative" ? "text-red-400 border-red-400/20 bg-red-400/10" :
                                "text-gray-400 border-gray-400/20 bg-gray-400/10"
                    )}>
                        {change}
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-gray-400 text-sm font-medium">{title}</span>
                <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
            </div>

            {/* Background glow effect */}
            <div className={cn(
                "absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity",
                color.replace("text-", "bg-")
            )} />
        </div>
    );
}
