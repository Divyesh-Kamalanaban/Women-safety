"use client";

import { X, MapPin, Calendar, Trash2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface IncidentDetailsModalProps {
    incident: any;
    onClose: () => void;
    onDelete: (id: number) => void;
}

export default function IncidentDetailsModal({ incident, onClose, onDelete }: IncidentDetailsModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    if (!incident) return null;

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/incidents?id=${incident.id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                onDelete(incident.id);
                onClose();
            } else {
                alert("Failed to delete incident.");
            }
        } catch (error) {
            console.error("Error deleting incident:", error);
            alert("Error deleting incident.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="bg-[#0A0A10] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        Incident Details
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Category Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 font-medium text-sm border border-red-500/20">
                        <AlertTriangle size={14} /> {incident.category}
                    </div>

                    {/* Image if available */}
                    {incident.imageUrl && (
                        <div className="w-full h-48 bg-black/50 rounded-xl overflow-hidden border border-white/10">
                            <img src={incident.imageUrl} alt="Evidence" className="w-full h-full object-cover" />
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">Description</h3>
                        <p className="text-white text-base leading-relaxed bg-[#151520] p-3 rounded-lg border border-white/5">
                            {incident.description || "No description provided."}
                        </p>
                    </div>

                    {/* Meta Data */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="col-span-2 flex items-center gap-2 text-gray-300 bg-white/5 p-2 rounded-lg border border-white/10">
                            <MapPin size={16} className="text-primary shrink-0" />
                            <span className="truncate">{incident.location || "Location name not available"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                            <MapPin size={16} className="text-gray-600" />
                            <span className="font-mono text-xs">{incident.lat.toFixed(6)}, {incident.lng.toFixed(6)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                            <Calendar size={16} className="text-primary" />
                            <span>{new Date(incident.timestamp).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="p-5 border-t border-white/10 bg-white/5 flex flex-col gap-3">
                    {confirmDelete ? (
                        <div className="w-full">
                            <p className="text-red-400 text-sm text-center mb-3 font-medium">Are you sure you want to delete this report?</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmDelete(false)}
                                    className="flex-1 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? "Deleting..." : "Confirm Delete"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="w-full py-3 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                            <Trash2 size={18} /> Delete Report
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
