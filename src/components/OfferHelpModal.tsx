'use client';

import { useState, useEffect } from 'react';
import { X, Heart, MapPin, Clock, AlertCircle } from 'lucide-react';

interface NearbyUser {
    id: string;
    lat: number;
    lng: number;
    lastUpdated: string;
    isHelpRequested: boolean;
    isAuthorized: boolean;
}

interface OfferHelpModalProps {
    userId: string;
    isOpen: boolean;
    onClose: () => void;
    nearbyUsers: NearbyUser[];
    onOfferHelp: (targetUserId: string) => Promise<void>;
}

export default function OfferHelpModal({
    userId,
    isOpen,
    onClose,
    nearbyUsers,
    onOfferHelp
}: OfferHelpModalProps) {
    const [offering, setOffering] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Filter for users requesting help nearby
    const usersNeedingHelp = nearbyUsers.filter(u => u.isHelpRequested && u.id !== userId);

    const handleOffer = async (targetUserId: string) => {
        try {
            setOffering(targetUserId);
            setLoading(true);
            setMessage(null);

            await onOfferHelp(targetUserId);

            setMessage({
                type: 'success',
                text: 'Help offer sent! Waiting for acceptance...'
            });

            setTimeout(() => {
                setMessage(null);
            }, 3000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Failed to send help offer. Please try again.'
            });
            console.error(error);
        } finally {
            setOffering(null);
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-800">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Nearby Help Requests</h2>
                        <p className="text-neutral-400 text-sm mt-1">
                            {usersNeedingHelp.length} {usersNeedingHelp.length === 1 ? 'person' : 'people'} nearby requesting help
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-neutral-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {usersNeedingHelp.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Heart className="w-12 h-12 text-neutral-700 mb-4" />
                            <p className="text-neutral-400 text-lg font-medium">No nearby help requests</p>
                            <p className="text-neutral-500 text-sm mt-2">
                                Check back soon - someone might need your help!
                            </p>
                        </div>
                    ) : (
                        usersNeedingHelp.map((user) => {
                            // Calculate distance (simple approximation)
                            const distance = Math.sqrt(
                                Math.pow(user.lat - (nearbyUsers[0]?.lat || user.lat), 2) +
                                Math.pow(user.lng - (nearbyUsers[0]?.lng || user.lng), 2)
                            ) * 111; // Rough km conversion

                            return (
                                <div
                                    key={user.id}
                                    className="p-4 bg-gradient-to-r from-red-600/10 to-orange-600/10 border border-red-500/30 rounded-xl hover:border-red-500/50 transition-all"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold text-white flex items-center gap-2">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center animate-pulse">
                                                    <Heart className="w-5 h-5 text-white" />
                                                </div>
                                                Person in Distress #{user.id.slice(0, 8)}
                                            </h3>
                                        </div>
                                        <div className="text-xs text-red-300 flex items-center gap-1 bg-red-500/20 px-2 py-1 rounded-full">
                                            <AlertCircle className="w-3 h-3" />
                                            Requesting Help
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-neutral-300">
                                            <MapPin className="w-4 h-4 text-blue-500" />
                                            <span className="font-medium">{distance.toFixed(2)} km away</span>
                                            <span className="text-neutral-400">
                                                at {user.lat.toFixed(4)}, {user.lng.toFixed(4)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-neutral-400">
                                            <Clock className="w-3 h-3" />
                                            Last seen {new Date(user.lastUpdated).toLocaleTimeString()}
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => handleOffer(user.id)}
                                        disabled={offering === user.id || loading}
                                        className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:from-neutral-600 disabled:to-neutral-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all transform hover:scale-105 disabled:scale-100"
                                    >
                                        {offering === user.id ? (
                                            <>
                                                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Heart className="w-4 h-4" />
                                                Offer Help
                                            </>
                                        )}
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Message */}
                {message && (
                    <div className={`p-4 border-t ${message.type === 'success' ? 'bg-green-600/10 border-green-500/30 text-green-300' : 'bg-red-600/10 border-red-500/30 text-red-300'}`}>
                        {message.text}
                    </div>
                )}

                {/* Footer */}
                <div className="border-t border-neutral-800 p-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
