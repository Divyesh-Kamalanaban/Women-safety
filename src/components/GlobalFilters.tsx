"use client";

import { Search, Bell, Calendar, Filter } from "lucide-react";

export default function GlobalFilters() {
    return (
        <header className="h-16 w-full glass z-40 px-6 flex items-center justify-between sticky top-0">
            <div className="flex items-center gap-4 w-1/3">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search assets, locations, or alerts..."
                        className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-300 hover:bg-white/10 cursor-pointer transition-colors">
                    <Calendar size={16} />
                    <span>Last 24 Hours</span>
                </div>

                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-300 hover:bg-white/10 cursor-pointer transition-colors">
                    <Filter size={16} />
                    <span>All Categories</span>
                </div>

                <div className="h-8 w-px bg-white/10 mx-2"></div>

                <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-amber rounded-full animate-pulse"></span>
                </button>

                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 border border-white/20"></div>
            </div>
        </header>
    );
}
