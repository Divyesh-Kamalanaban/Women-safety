"use client";

import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Map as MapIcon,
    ShieldAlert,
    Users,
    Settings,
    Menu,
    X,
    LogOut,
    History as HistoryIcon,
    LogIn
} from 'lucide-react';
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: ShieldAlert, label: "Reports", href: "/reports" },
    { icon: HistoryIcon, label: "History", href: "/history" },
    { icon: Settings, label: "Settings", href: "/settings" },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchUser();

        // Handle resize to close mobile sidebar on desktop
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                className={cn(
                    "md:hidden fixed top-4 left-4 z-50 p-2 bg-[#0A0A10] text-white rounded-lg border border-white/10 hover:bg-white/10 transition-all shadow-lg",
                    isMobileOpen ? "opacity-0 pointer-events-none" : "opacity-100"
                )}
                onClick={() => setIsMobileOpen(true)}
                aria-label="Open menu"
            >
                <Menu size={24} />
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside
                className={cn(
                    "h-screen bg-[#0A0A10] border-r border-white/10 flex flex-col transition-all duration-300 z-50 fixed left-0 top-0",
                    "w-64", // Fixed width for mobile/expanded
                    collapsed ? "md:w-16" : "md:w-64", // Desktop width
                    isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0" // Mobile transform
                )}
            >
                <div className="flex items-center justify-between p-4 border-b border-white/10 h-16">
                    {(!collapsed || isMobileOpen) && (
                        <span className="font-bold text-xl tracking-wider text-white animate-in fade-in duration-300">
                            SOROR<span className="text-primary">INE</span>
                        </span>
                    )}
                    <button
                        onClick={() => {
                            if (window.innerWidth < 768) setIsMobileOpen(false);
                            else setCollapsed(!collapsed);
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors ml-auto"
                        aria-label={isMobileOpen ? "Close menu" : collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {(collapsed && !isMobileOpen) ? <Menu size={20} /> : <X size={20} />}
                    </button>
                </div>

                <nav className="flex-1 py-6 flex flex-col gap-2 px-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={cn(
                                "flex items-center gap-4 px-3 py-3 rounded-xl transition-all group",
                                "hover:bg-primary/10 hover:text-primary",
                                "text-gray-400"
                            )}
                        >
                            <item.icon size={22} className="min-w-[22px]" />
                            {(!collapsed || isMobileOpen) && (
                                <span className="font-medium whitespace-nowrap animate-in fade-in duration-300 fill-mode-forwards" style={{ animationDelay: '100ms' }}>
                                    {item.label}
                                </span>
                            )}
                            {/* Desktop Tooltip */}
                            {(collapsed && !isMobileOpen) && (
                                <div className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-white/10 hidden md:block">
                                    {item.label}
                                </div>
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    {user ? (
                        <button
                            onClick={handleLogout}
                            className={cn(
                                "flex items-center gap-4 px-3 py-3 w-full rounded-xl transition-all text-red-500 hover:bg-red-500/10",
                            )}
                        >
                            <LogOut size={22} className="min-w-[22px]" />
                            {(!collapsed || isMobileOpen) && <span className="font-medium animate-in fade-in duration-300">Logout</span>}
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            className={cn(
                                "flex items-center gap-4 px-3 py-3 w-full rounded-xl transition-all text-emerald-500 hover:bg-emerald-500/10",
                            )}
                        >
                            <LogIn size={22} className="min-w-[22px]" />
                            {(!collapsed || isMobileOpen) && <span className="font-medium animate-in fade-in duration-300">Login</span>}
                        </Link>
                    )}
                </div>
            </aside>
        </>
    );
}
