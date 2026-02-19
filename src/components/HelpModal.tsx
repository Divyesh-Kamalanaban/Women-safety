'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, MapPin, Clock, User } from 'lucide-react';

interface HelpOffer {
    id: string;
    helperId: string;
    status: string;
    createdAt: string;
    helper?: {
        id: string;
        lat: number;
        lng: number;
        lastUpdated: string;
    };
}

interface HelpModalProps {
    userId: string;
    isOpen: boolean;
    onClose: () => void;
    onAcceptOffer: (offerId: string) => void;
    onRejectOffer: (offerId: string) => void;
}

export default function HelpModal({
    userId,
    isOpen,
    onClose,
    onAcceptOffer,
    onRejectOffer
}: HelpModalProps) {
    const [offers, setOffers] = useState<HelpOffer[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchOffers();
            const interval = setInterval(fetchOffers, 3000); // Poll for new offers
            return () => clearInterval(interval);
        }
    }, [isOpen, userId]);

    const fetchOffers = async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const res = await fetch(`/api/users/help/offer?requesterId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setOffers(data.offers || []);
            }
        } catch (error) {
            console.error('Error fetching offers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (offerId: string) => {
        try {
            const res = await fetch('/api/users/help/offer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'ACCEPT',
                    offerId
                })
            });

            if (res.ok) {
                onAcceptOffer(offerId);
                setOffers(offers.filter(o => o.id !== offerId));
            }
        } catch (error) {
            console.error('Error accepting offer:', error);
        }
    };

    const handleReject = async (offerId: string) => {
        try {
            const res = await fetch('/api/users/help/offer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'REJECT',
                    offerId
                })
            });

            if (res.ok) {
                onRejectOffer(offerId);
                setOffers(offers.filter(o => o.id !== offerId));
            }
        } catch (error) {
            console.error('Error rejecting offer:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-800">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Help Offers</h2>
                        <p className="text-neutral-400 text-sm mt-1">
                            {offers.length} {offers.length === 1 ? 'person' : 'people'} offering to help
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
                    {loading && offers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mb-4"></div>
                            <p className="text-neutral-400">Fetching offers...</p>
                        </div>
                    ) : offers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <User className="w-12 h-12 text-neutral-700 mb-4" />
                            <p className="text-neutral-400 text-lg font-medium">No help offers yet</p>
                            <p className="text-neutral-500 text-sm mt-2">
                                Your help request has been sent. Helpers will respond soon.
                            </p>
                        </div>
                    ) : (
                        offers.map((offer) => (
                            <div
                                key={offer.id}
                                className="p-4 bg-neutral-800/50 border border-neutral-700 rounded-xl hover:border-neutral-600 transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-semibold text-white flex items-center gap-2">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                <User className="w-5 h-5 text-white" />
                                            </div>
                                            Helper #{offer.helperId.slice(0, 8)}
                                        </h3>
                                    </div>
                                    <div className="text-xs text-neutral-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(offer.createdAt).toLocaleTimeString()}
                                    </div>
                                </div>

                                {offer.helper && (
                                    <div className="mb-4 p-3 bg-neutral-700/50 rounded-lg">
                                        <div className="flex items-center gap-2 text-sm text-neutral-300">
                                            <MapPin className="w-4 h-4 text-blue-500" />
                                            <span>
                                                {offer.helper.lat.toFixed(4)}, {offer.helper.lng.toFixed(4)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleAccept(offer.id)}
                                        className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        Accept Help
                                    </button>
                                    <button
                                        onClick={() => handleReject(offer.id)}
                                        className="flex-1 px-4 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Decline
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

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
