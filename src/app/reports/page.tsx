"use client";

import { useEffect, useState, useMemo } from 'react';
import { Trash2, MapPin, Calendar, Search, Filter, Eye, AlertTriangle, ChevronDown, Clock } from 'lucide-react';
import IncidentDetailsModal from '@/components/IncidentDetailsModal';
import Sidebar from '@/components/Sidebar';

export default function ReportsPage() {
    const [incidents, setIncidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIncident, setSelectedIncident] = useState<any>(null);

    // Filters
    const [showLast24h, setShowLast24h] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("All");

    const fetchIncidents = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/incidents?limit=1000');
            if (res.ok) {
                const data = await res.json();
                // Ensure dates are parsed correctly
                const parsed = data.map((inc: any) => ({
                    ...inc,
                    timestamp: new Date(inc.timestamp),
                    createdAt: new Date(inc.createdAt)
                }));
                setIncidents(parsed);
            }
        } catch (error) {
            console.error("Failed to fetch incidents", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncidents();
    }, []);

    // Derived State for Categories
    const categories = useMemo(() => {
        const cats = new Set(incidents.map(i => i.category || "Uncategorized"));
        return ["All", ...Array.from(cats)];
    }, [incidents]);

    // Filtering Logic
    const filteredIncidents = useMemo(() => {
        return incidents.filter(inc => {
            // 1. Search
            const matchesSearch =
                (inc.category && inc.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (inc.description && inc.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (inc.location && inc.location.toLowerCase().includes(searchQuery.toLowerCase()));

            // 2. Time Filter (Last 24h)
            const matchesTime = showLast24h
                ? (new Date().getTime() - inc.timestamp.getTime()) < 24 * 60 * 60 * 1000
                : true;

            // 3. Category Filter
            const matchesCategory = selectedCategory === "All" || inc.category === selectedCategory;

            return matchesSearch && matchesTime && matchesCategory;
        });
    }, [incidents, searchQuery, showLast24h, selectedCategory]);

    return (
        <div className="flex bg-[#050509] text-white min-h-screen">
            <div className="fixed top-0 left-0 h-full z-50">
                <Sidebar />
            </div>

            <main className="pl-0 md:pl-64 transition-all duration-300 w-full min-h-screen flex flex-col relative z-0">

                {/* Header */}
                <div className="h-auto md:h-20 border-b border-white/10 flex flex-col md:flex-row items-start md:items-center px-4 md:px-8 justify-between sticky top-0 bg-[#050509]/80 backdrop-blur-md z-40 gap-4 md:gap-0 py-4 md:py-0">
                    <div className="flex items-center gap-2 w-full md:w-auto mt-12 md:mt-0">
                        <span className="bg-primary/20 p-2 rounded-lg text-primary"><AlertTriangle size={20} /></span>
                        <h1 className="text-xl font-bold">Incident Reports</h1>
                    </div>

                    {/* Filters & Search Toolbar */}
                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">

                        {/* Search */}
                        <div className="relative flex-grow md:flex-grow-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search reports..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-white w-full md:w-64 transition-all"
                            />
                        </div>

                        {/* Last 24h Toggle */}
                        <button
                            onClick={() => setShowLast24h(!showLast24h)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${showLast24h
                                ? "bg-primary/20 text-primary border-primary/50"
                                : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                                }`}
                        >
                            <Clock size={16} />
                            <span>Last 24h</span>
                        </button>

                        {/* Category Dropdown */}
                        <div className="relative group">
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-gray-300 hover:bg-white/10 cursor-pointer transition-colors min-w-[140px] justify-between">
                                <div className="flex items-center gap-2">
                                    <Filter size={16} />
                                    <span>{selectedCategory === "All" ? "Categories" : selectedCategory}</span>
                                </div>
                                <ChevronDown size={14} className="text-gray-500" />
                            </div>

                            {/* Dropdown Menu (Hover for simplicity, click would be better but this works for prototype) */}
                            <div className="absolute right-0 top-full mt-2 w-48 bg-[#0A0A10] border border-white/10 rounded-xl shadow-xl overflow-hidden hidden group-hover:block z-50">
                                {categories.map(cat => (
                                    <div
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-white/5 ${selectedCategory === cat ? "text-primary font-medium" : "text-gray-400"}`}
                                    >
                                        {cat}
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Content */}
                <div className="p-4 md:p-8 flex-1">
                    <div className="bg-[#0A0A10] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-400">
                                <thead className="bg-white/5 text-gray-200 font-medium uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4">Evidence</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Location</th>
                                        <th className="px-6 py-4">Full Address</th>
                                        <th className="px-6 py-4">Date & Time</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Loading reports...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredIncidents.length > 0 ? (
                                        filteredIncidents.map((incident) => (
                                            <tr key={incident.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4">
                                                    {incident.imageUrl ? (
                                                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10">
                                                            <img src={incident.imageUrl} alt="Thumb" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-gray-600">
                                                            <Eye size={16} />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="flex items-center gap-2 text-white font-medium">
                                                        <span className={`w-2 h-2 rounded-full ${incident.category === 'Harassment' ? 'bg-red-500' :
                                                            incident.category === 'Theft' ? 'bg-orange-500' :
                                                                'bg-blue-500'
                                                            }`}></span>
                                                        {incident.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-xs font-mono text-gray-500">
                                                        <MapPin size={12} className="text-primary" />
                                                        {incident.lat.toFixed(4)}, {incident.lng.toFixed(4)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 max-w-xs truncate text-gray-300" title={incident.location}>
                                                    {incident.location || "N/A"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-0.5">
                                                        <div className="flex items-center gap-1.5 text-gray-300">
                                                            <Calendar size={12} />
                                                            {new Date(incident.timestamp).toLocaleDateString()}
                                                        </div>
                                                        <div className="text-xs text-gray-600 pl-4">
                                                            {new Date(incident.timestamp).toLocaleTimeString()}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => setSelectedIncident(incident)}
                                                        className="p-2 bg-white/5 hover:bg-primary hover:text-white rounded-lg text-gray-400 transition-all shadow-sm"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                No reports found matching your filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-white/5">
                            {loading ? (
                                <div className="p-8 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        <span>Loading reports...</span>
                                    </div>
                                </div>
                            ) : filteredIncidents.length > 0 ? (
                                filteredIncidents.map((incident) => (
                                    <div key={incident.id} className="p-4 hover:bg-white/5 transition-colors" onClick={() => setSelectedIncident(incident)}>
                                        <div className="flex items-start gap-3 mb-3">
                                            {incident.imageUrl ? (
                                                <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                                                    <img src={incident.imageUrl} alt="Thumb" className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center text-gray-600 flex-shrink-0">
                                                    <Eye size={20} />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 mb-1 ${incident.category === 'Harassment' ? 'text-red-400 border-red-500/20' :
                                                            incident.category === 'Theft' ? 'text-orange-400 border-orange-500/20' :
                                                                'text-blue-400 border-blue-500/20'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${incident.category === 'Harassment' ? 'bg-red-500' :
                                                                incident.category === 'Theft' ? 'bg-orange-500' :
                                                                    'bg-blue-500'
                                                            }`}></span>
                                                        {incident.category}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(incident.timestamp).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="text-gray-300 text-sm font-medium truncate mb-0.5">
                                                    {incident.location || "Location N/A"}
                                                </div>
                                                <div className="text-gray-500 text-xs truncate">
                                                    {incident.description || "No description"}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-white/5">
                                            <div className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {new Date(incident.timestamp).toLocaleTimeString()}
                                            </div>
                                            <button className="text-primary hover:text-primary/80 font-medium flex items-center gap-1">
                                                View Details <Eye size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    No reports found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Details Modal (Reused) */}
                <IncidentDetailsModal
                    incident={selectedIncident}
                    onClose={() => setSelectedIncident(null)}
                    onDelete={() => {
                        setSelectedIncident(null);
                        fetchIncidents();
                    }}
                />
            </main>
        </div>
    );
}
