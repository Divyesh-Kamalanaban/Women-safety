"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X } from 'lucide-react';

interface MapSearchProps {
    onLocationSelect: (lat: number, lng: number) => void;
}

export default function MapSearch({ onLocationSelect }: MapSearchProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length > 2) {
                setIsSearching(true);
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`);
                    if (res.ok) {
                        const data = await res.json();
                        setResults(data);
                        setIsOpen(true);
                    }
                } catch (e) {
                    console.error("Search failed", e);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (result: any) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        onLocationSelect(lat, lng);
        setQuery(result.display_name.split(',')[0]); // Shorten name for input
        setIsOpen(false);
    };

    return (
        <div className="relative w-full max-w-md" ref={searchRef}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Search size={18} />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search location..."
                    className="block w-full pl-10 pr-10 py-3 border border-white/10 rounded-full leading-5 bg-[#0A0A10]/90 text-white placeholder-gray-500 focus:outline-none focus:bg-[#151520] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm backdrop-blur-md shadow-lg transition-all"
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery("");
                            setResults([]);
                        }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Results Dropdown */}
            {isOpen && results.length > 0 && (
                <div className="absolute mt-2 w-full bg-[#0A0A10]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                    <ul className="max-h-60 overflow-y-auto custom-scrollbar">
                        {results.map((result, index) => (
                            <li
                                key={index}
                                onClick={() => handleSelect(result)}
                                className="px-4 py-3 hover:bg-white/10 cursor-pointer flex items-start gap-3 transition-colors border-b border-white/5 last:border-0"
                            >
                                <MapPin size={16} className="text-blue-500 mt-1 shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-white">
                                        {result.display_name.split(',')[0]}
                                    </p>
                                    <p className="text-xs text-gray-400 truncate w-64">
                                        {result.display_name.split(',').slice(1).join(',')}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
