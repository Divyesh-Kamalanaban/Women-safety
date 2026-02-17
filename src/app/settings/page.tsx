"use client";

import { useEffect, useState, useCallback } from 'react';
import { User, Phone, LogOut, Loader2, RefreshCw, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Risk Context State
    const [riskLoading, setRiskLoading] = useState(false);
    const [riskContext, setRiskContext] = useState({
        region: "Unknown",
        score: 0,
        level: "Unknown",
        factors: {} as any
    });
    const [locationStatus, setLocationStatus] = useState<string>("");

    const fetchRiskByCoords = useCallback(async (lat: number, lng: number, statusMessage: string) => {
        setRiskLoading(true);
        setLocationStatus(statusMessage);
        try {
            const riskRes = await fetch(`/api/risk-data?lat=${lat}&lng=${lng}`);
            if (riskRes.ok) {
                const riskData = await riskRes.json();
                setRiskContext({
                    region: riskData.meta?.detectedState || "Unknown Region",
                    score: riskData.score || 0,
                    level: riskData.level || "Unknown",
                    factors: riskData.factors || {}
                });
                setLocationStatus("Updated");
            } else {
                setLocationStatus("Failed to fetch data");
            }
        } catch (e) {
            console.error("Risk fetch error", e);
            setLocationStatus("Connection error");
        } finally {
            setRiskLoading(false);
        }
    }, []);

    // Fetch User Profile & Initial Risk Data
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userRes = await fetch('/api/auth/me');
                if (userRes.ok) {
                    const data = await userRes.json();
                    setUser(data.user);

                    // Use stored location if available
                    if (data.user?.location?.lat && data.user?.location?.lng) {
                        fetchRiskByCoords(data.user.location.lat, data.user.location.lng, "Using last known location");
                    } else {
                        setLocationStatus("Location unknown");
                    }
                }
            } catch (error) {
                console.error("Failed to load user", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [fetchRiskByCoords]);

    // Manual Refresh (High Accuracy)
    const handleRefresh = useCallback(async () => {
        setRiskLoading(true);
        setLocationStatus("Locating...");

        if (!navigator.geolocation) {
            setLocationStatus("Geolocation not supported");
            setRiskLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                // Update Risk Data
                fetchRiskByCoords(latitude, longitude, "Analyzing risk...");

                // Optionally update stored location (though map page usually does this)
                if (user?.id) {
                    fetch('/api/users/location', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: user.id /* storedId/session logic needed? api/auth/me returns id */, lat: latitude, lng: longitude })
                    }).catch(console.error);
                }

            },
            (err) => {
                console.error("Geolocation error", err);
                let errorMessage = "Location check failed";
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        errorMessage = "Permission denied. Enable in settings.";
                        break;
                    case err.POSITION_UNAVAILABLE:
                        errorMessage = "Location unavailable. Check GPS.";
                        break;
                    case err.TIMEOUT:
                        errorMessage = "Request timed out.";
                        break;
                }
                setLocationStatus(errorMessage);
                setRiskLoading(false);
            },
            { timeout: 10000, enableHighAccuracy: true }
        );
    }, [fetchRiskByCoords, user]);

    // Auto-refresh if permission is granted or prompts
    useEffect(() => {
        if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
            navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
                if (result.state === 'granted' || result.state === 'prompt') {
                    handleRefresh();
                } else if (result.state === 'denied') {
                    setLocationStatus("Permission denied. Enable in browser.");
                }

                result.onchange = () => {
                    if (result.state === 'granted' || result.state === 'prompt') {
                        handleRefresh();
                    }
                };
            });
        }
    }, [handleRefresh]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#050509] text-white">
            <div className="fixed top-0 left-0 h-full z-50">
                <Sidebar />
            </div>

            <main className="flex-1 md:pl-64 transition-all duration-300 w-full flex items-center justify-center p-6 relative">
                {/* Mobile Header Spacer */}
                <div className="md:hidden absolute top-4 left-16 right-4 flex justify-center pointer-events-none">
                    <span className="font-bold text-xl tracking-wider text-white opacity-0">SORORINE</span>
                </div>

                <div className="text-center space-y-6 max-w-2xl w-full mt-10 md:mt-0">
                    <div className="animate-in slide-in-from-top-4 duration-500">
                        <h1 className="text-3xl font-bold text-primary mb-2">Settings</h1>
                        <p className="text-gray-400">System Configuration & Profile</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Risk Engine Context */}
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-left h-full flex flex-col animate-in slide-in-from-left-4 duration-500 delay-100">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                    Risk Engine
                                </h2>
                                <button
                                    onClick={handleRefresh}
                                    disabled={riskLoading}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
                                    title="Refresh Location & Risk"
                                >
                                    <RefreshCw size={18} className={cn("text-primary", riskLoading && "animate-spin")} />
                                </button>
                            </div>

                            <div className="space-y-4 flex-1">
                                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                                    <span className="text-gray-400 flex items-center gap-2">
                                        <MapPin size={14} /> Active Region
                                    </span>
                                    <span className="font-mono text-primary font-medium">
                                        {riskLoading ? <Loader2 size={14} className="animate-spin" /> : riskContext.region}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                                    <span className="text-gray-400">Current Risk Score</span>
                                    <span className={cn(
                                        "font-mono font-bold",
                                        riskLoading ? "text-gray-500" :
                                            riskContext.level === 'CRITICAL' ? 'text-red-500' :
                                                riskContext.level === 'HIGH' ? 'text-orange-500' :
                                                    'text-emerald-500'
                                    )}>
                                        {riskLoading ? "..." : `${riskContext.score.toFixed(2)} (${riskContext.level})`}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Dataset</span>
                                    <span className="font-mono text-gray-500 text-xs text-right">v2024.1 (NCRB)</span>
                                </div>

                                <div className="mt-4 pt-2 text-xs text-center text-gray-500 border-t border-white/5">
                                    {locationStatus}
                                </div>
                            </div>
                        </div>

                        {/* User Profile */}
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-left h-full relative overflow-hidden flex flex-col animate-in slide-in-from-right-4 duration-500 delay-200">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <User size={80} />
                            </div>
                            <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                                <User size={18} className="text-primary" /> Profile
                            </h2>

                            {loading ? (
                                <div className="flex-1 flex items-center justify-center text-gray-500">
                                    <Loader2 className="animate-spin mr-2" /> Loading...
                                </div>
                            ) : user ? (
                                <div className="space-y-4 flex-1">
                                    <div className="space-y-1 pb-3 border-b border-white/10">
                                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Name</div>
                                        <div className="font-medium text-white text-lg">{user.name}</div>
                                    </div>
                                    <div className="space-y-1 pb-3 border-b border-white/10">
                                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Email</div>
                                        <div className="font-mono text-gray-300 text-sm">{user.email}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider flex items-center gap-1">
                                            <Phone size={10} /> Emergency Contact
                                        </div>
                                        <div className="font-medium text-red-400">{user.emergencyContactName || "Not set"}</div>
                                        <div className="text-sm text-gray-400 font-mono">{user.emergencyContactNumber || "--"}</div>
                                    </div>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full mt-auto py-2.5 bg-white/5 hover:bg-red-500/20 text-red-500 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] text-sm font-medium border border-transparent hover:border-red-500/30"
                                    >
                                        <LogOut size={16} /> Sign Out
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-8 flex-1 flex flex-col justify-center">
                                    <p className="text-gray-400 mb-4 text-sm">You are not logged in.</p>
                                    <button
                                        onClick={() => router.push('/login')}
                                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                                    >
                                        Sign In
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
