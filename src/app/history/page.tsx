"use client";

import { useEffect, useState } from 'react';
import { Sidebar } from 'lucide-react';
import SidebarComponent from '@/components/Sidebar';
import { Calendar, MapPin, Search, AlertTriangle, Eye, Clock } from 'lucide-react';

export default function HistoryPage() {
    const [incidents, setIncidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchHistory = async () => {
        setLoading(true);
        try {
            // In a real app we would filter by 'my' incidents.
            // Since there is no auth with ID on the incident model yet (userId is optional),
            // and we store userId in localStorage on Dashboard, we can't easily filter on server yet.
            // We will fetch all for now or mock the 'my history' aspect by showing all.
            const res = await fetch('/api/incidents?limit=100');
            if (res.ok) {
                const data = await res.json();
                const parsed = data.map((inc: any) => ({
                    ...inc,
                    timestamp: new Date(inc.timestamp),
                    createdAt: new Date(inc.createdAt)
                }));
                setIncidents(parsed);
            }
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const filteredIncidents = incidents.filter(inc =>
        inc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inc.description && inc.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (inc.location && inc.location.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="flex bg-[#050509] text-white min-h-screen">
            <div className="fixed top-0 left-0 h-full z-50">
                <SidebarComponent />
            </div>

            <div className="pl-0 md:pl-64 transition-all duration-300 w-full min-h-screen flex flex-col">

                {/* Header */}
                <div className="h-auto md:h-20 border-b border-white/10 flex flex-col md:flex-row items-start md:items-center px-4 md:px-8 justify-between sticky top-0 bg-[#050509]/80 backdrop-blur-md z-40 py-4 md:py-0 gap-4 md:gap-0">
                    <div className="mt-12 md:mt-0">
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <span className="bg-blue-600/20 p-2.5 rounded-xl text-blue-500"><Clock size={24} /></span>
                            History & Activity
                        </h1>
                        <p className="text-gray-400 text-sm mt-1 ml-1">Your past reports and safety timeline</p>
                    </div>

                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search history..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 text-white w-full md:w-72 transition-all"
                        />
                    </div>
                </div>

                {/* Timeline Content */}
                <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
                    {loading ? (
                        <div className="text-center py-20 text-gray-500">Loading history...</div>
                    ) : filteredIncidents.length > 0 ? (
                        <div className="relative border-l border-white/10 ml-4 space-y-8">
                            {filteredIncidents.map((incident) => (
                                <div key={incident.id} className="relative pl-8 group">
                                    {/* Timeline Dot */}
                                    <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-[#050509] group-hover:bg-blue-400 transition-colors" />

                                    <div className="bg-[#0A0A10] border border-white/10 rounded-2xl p-6 hover:bg-white/5 transition-all hover:border-white/20 shadow-lg">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-sm font-bold border border-red-500/20">
                                                    {incident.category}
                                                </div>
                                                <span className="text-gray-500 text-sm flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    {incident.timestamp.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <span className="text-gray-600 text-xs font-mono">
                                                ID: #{incident.id}
                                            </span>
                                        </div>

                                        <p className="text-gray-300 mb-4 leading-relaxed">
                                            {incident.description || "No description provided."}
                                        </p>

                                        {incident.location && (
                                            <div className="flex items-center gap-2 text-sm text-gray-400 bg-black/20 p-3 rounded-lg border border-white/5 mb-4">
                                                <MapPin size={16} className="text-blue-500" />
                                                <span className="truncate">{incident.location}</span>
                                            </div>
                                        )}

                                        {incident.imageUrl && (
                                            <div className="mb-4 rounded-xl overflow-hidden border border-white/10 w-fit">
                                                <img src={incident.imageUrl} alt="Evidence" className="h-32 object-cover" />
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                            <div className="text-xs text-gray-500">
                                                Reported at {incident.timestamp.toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <Clock size={48} className="mb-4 opacity-20" />
                            <p>No activity found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
