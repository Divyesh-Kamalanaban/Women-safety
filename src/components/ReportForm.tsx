'use client';

import { useState } from 'react';

export default function ReportForm({ selectedLocation, onSuccess, onCancel }: {
    selectedLocation: { lat: number, lng: number } | null,
    onSuccess: () => void,
    onCancel: () => void
}) {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!selectedLocation) return;

        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = {
            lat: selectedLocation.lat,
            lng: selectedLocation.lng,
            category: formData.get('category'),
            description: formData.get('description'),
            timestamp: formData.get('timestamp') || new Date().toISOString(),
        };

        try {
            const res = await fetch('/api/incidents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                onSuccess();
            } else {
                alert('Failed to submit report');
            }
        } catch (err) {
            console.error(err);
            alert('Error submitting report');
        } finally {
            setLoading(false);
        }
    }

    if (!selectedLocation) {
        return <div className="p-4 bg-yellow-50 text-yellow-800 rounded">Click on the map to select a location first.</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1">Incident Category</label>
                <select name="category" required className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-800 transition focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                    <option value="Harassment">Harassment</option>
                    <option value="Poor Lighting">Poor Lighting</option>
                    <option value="Stalking">Stalking</option>
                    <option value="Unsafe Crowding">Unsafe Crowding</option>
                    <option value="Eve Teasing">Eve Teasing</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1">Time of Incident</label>
                <input
                    type="datetime-local"
                    name="timestamp"
                    required
                    defaultValue={new Date().toISOString().slice(0, 16)}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-800 transition focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1">Description (Optional)</label>
                <textarea
                    name="description"
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-800 transition focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    rows={3}
                    placeholder="Briefly describe what happened..."
                ></textarea>
            </div>

            <div className="flex gap-3 pt-3">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Submitting...' : 'Submit Report'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="py-2.5 px-4 bg-white hover:bg-neutral-100 text-neutral-700 font-semibold border border-neutral-300 rounded-lg transition-all"
                >
                    Cancel
                </button>
            </div>

            <div className="text-xs text-neutral-500 mt-4 pt-4 border-t border-neutral-100">
                <span className="font-semibold">Selected Location:</span> {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
            </div>
        </form>
    );
}
