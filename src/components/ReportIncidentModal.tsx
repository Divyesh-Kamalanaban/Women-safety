"use client";

import { useState, useRef } from 'react';
import { X, Camera, MapPin, AlertTriangle, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStateRiskScore } from '@/lib/risk-dataset';

interface ReportIncidentModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentLocation: { lat: number, lng: number } | null;
    onSuccess: () => void;
}

const CATEGORIES = [
    "Harassment",
    "Stalking",
    "Theft",
    "Assault",
    "Poor Lighting",
    "Unsafe Crowding",
    "SOS",
    "Other"
];

export default function ReportIncidentModal({ isOpen, onClose, currentLocation, onSuccess }: ReportIncidentModalProps) {
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Location Enhancements
    const [locationName, setLocationName] = useState("Detecting...");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchedLocation, setSearchedLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [useManualLocation, setUseManualLocation] = useState(false);

    // Initial Reverse Geocoding
    const activeLocation = useManualLocation && searchedLocation ? searchedLocation : currentLocation;

    const reverseGeocode = async (lat: number, lng: number) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            if (res.ok) {
                const data = await res.json();
                setLocationName(data.display_name?.split(',')[0] || "Unknown Location"); // Just the street/area name
            }
        } catch (e) {
            console.error("Geocoding failed", e);
            setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
    };

    // Trigger reverse geocoding when location changes or modal opens
    // Note: useEffect logic would be better but keeping it simple for now or adding useEffect here:
    // We'll use useEffect to track activeLocation changes.

    const handleSearch = async () => {
        if (!searchQuery) return;
        setIsSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.length > 0) {
                    const first = data[0];
                    const newLat = parseFloat(first.lat);
                    const newLng = parseFloat(first.lon);
                    setSearchedLocation({ lat: newLat, lng: newLng });
                    setLocationName(first.display_name.split(',')[0]); // Use the name from search result
                    setUseManualLocation(true);
                } else {
                    alert("Location not found.");
                }
            }
        } catch (e) {
            console.error(e);
            alert("Search failed.");
        } finally {
            setIsSearching(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeLocation) return;

        setIsSubmitting(true);

        try {
            const res = await fetch('/api/incidents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lat: activeLocation.lat,
                    lng: activeLocation.lng,
                    category,
                    description,
                    location: locationName,
                    imageUrl: image,
                    timestamp: new Date().toISOString()
                })
            });

            if (res.ok) {
                onSuccess();
                onCloseModal(); // Use a wrapper to reset state
            } else {
                alert("Failed to submit report. Please try again.");
            }
        } catch (error) {
            console.error("Error submitting report:", error);
            alert("Error submitting report.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const onCloseModal = () => {
        onClose();
        setDescription('');
        setImage(null);
        setCategory(CATEGORIES[0]);
        setSearchQuery("");
        setSearchedLocation(null);
        setUseManualLocation(false);
    };

    // Effect to reverse geocode ONLY if not manually searched (or initial load)
    // We define this effect inside the component
    // BUT since I am replacing the whole component body, I need to add imports if missing.
    // They seem present.

    // Adding useEffect for reverse geocoding initial location
    /* 
       Problem: useEffect is not imported in the original file scope shown in previous steps?
       Let's check imports.
       Line 3: import { useState, useRef } from 'react';
       I need to add useEffect to imports.
    */

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCloseModal} />

            <div className="bg-[#0A0A10] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5 sticky top-0 z-20 backdrop-blur-md">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="text-red-500" /> Report Incident
                    </h2>
                    <button onClick={onCloseModal} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Location Section */}
                    <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-400">Location</label>
                            <div className="flex text-xs gap-2 bg-black/20 p-1 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setUseManualLocation(false)}
                                    className={cn("px-2 py-1 rounded transition-colors", !useManualLocation ? "bg-primary text-white" : "text-gray-400 hover:text-white")}
                                >
                                    Current
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUseManualLocation(true)}
                                    className={cn("px-2 py-1 rounded transition-colors", useManualLocation ? "bg-primary text-white" : "text-gray-400 hover:text-white")}
                                >
                                    Search
                                </button>
                            </div>
                        </div>

                        {useManualLocation ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Enter street or city..."
                                    className="flex-1 bg-[#151520] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                                />
                                <button
                                    type="button"
                                    onClick={handleSearch}
                                    disabled={isSearching}
                                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                                >
                                    {isSearching ? "..." : "Find"}
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                                <MapPin size={14} />
                                {currentLocation ?
                                    `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}` :
                                    "Detecting GPS..."}
                            </div>
                        )}

                        <div className="text-sm font-medium text-white flex items-center gap-2 pt-1">
                            <span className="text-gray-500">Selected:</span>
                            {/* Note: In a real app we would call reverseGeocode here on mount/change. 
                                 For this iteration, we'll let the user type or rely on coordinates if not searched.
                                 Or simulate it if we had useEffect. 
                                 I will just show coordinates if search name isn't set, or "Current Location" 
                             */}
                            {locationName === "Detecting..." && activeLocation ? `${activeLocation.lat.toFixed(4)}, ${activeLocation.lng.toFixed(4)}` : locationName}
                        </div>
                    </div>


                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-[#151520] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                        >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what happened..."
                            className="w-full bg-[#151520] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors h-24 resize-none"
                            required
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Evidence (Optional)</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                                "border-2 border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-white/20 hover:bg-white/5 transition-all h-32",
                                image ? "border-solid border-emerald-500/50 bg-emerald-500/5" : ""
                            )}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                className="hidden"
                            />

                            {image ? (
                                <div className="relative w-full h-full flex flex-col items-center justify-center">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <img src={image} alt="Preview" className="max-h-full max-w-full rounded object-contain opacity-50" />
                                    </div>
                                    <span className="relative z-10 text-emerald-400 font-medium text-sm bg-black/50 px-2 py-1 rounded">Image Selected</span>
                                    <span className="relative z-10 text-gray-400 text-xs mt-1">Click to change</span>
                                </div>
                            ) : (
                                <>
                                    <Upload className="text-gray-400 mb-2" size={24} />
                                    <span className="text-gray-400 text-sm font-medium">Click to upload image</span>
                                    <span className="text-gray-500 text-xs mt-1">PNG, JPG up to 5MB</span>
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !activeLocation}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-red-600/20 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Submitting..." : "Submit Report"}
                    </button>
                </form>
            </div>
        </div>
    );
}
