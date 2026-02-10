'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Incident } from '@prisma/client';

interface MapProps {
    incidents: Incident[];
    userLocation?: { lat: number, lng: number } | null;
    nearbyUsers?: { id: string, lat: number, lng: number, isHelpRequested?: boolean }[];
    onMapClick?: (lat: number, lng: number) => void;
    onOfferHelp?: (targetUserId: string) => void;
}

function MapEvents({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            if (onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

// Custom icons
const createIcon = (color: string) => L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.4);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
});

const userIcon = L.divIcon({
    className: 'user-marker',
    html: `<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
});

const nearbyIcon = L.divIcon({
    className: 'nearby-marker',
    html: `<div style="background-color: #10b981; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
});

const helpRequestedIcon = L.divIcon({
    className: 'help-marker',
    html: `<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.5); animation: pulse 1s infinite;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});


export default function SafetyMap({ incidents, userLocation, nearbyUsers = [], onMapClick, onOfferHelp }: MapProps) {
    // Default to a central city location (e.g., Delhi/Mumbai or neutral)
    const [position, setPosition] = useState<[number, number]>([28.6139, 77.2090]);

    useEffect(() => {
        // Fix leaflet icons
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
    }, []);

    const ZOOM_LEVEL = 18;

    function UserLocationUpdater({ location }: { location?: { lat: number, lng: number } | null }) {
        const map = useMapEvents({
            dragstart: () => setTracking(false),
            zoomstart: () => { }
        });

        const prevLoc = useRef<{ lat: number, lng: number } | null>(null);

        useEffect(() => {
            if (location && tracking) {
                const hasMovedSignificantly = !prevLoc.current ||
                    Math.abs(location.lat - prevLoc.current.lat) > 0.0002 ||
                    Math.abs(location.lng - prevLoc.current.lng) > 0.0002;

                if (hasMovedSignificantly) {
                    map.flyTo([location.lat, location.lng], ZOOM_LEVEL, {
                        animate: true,
                        duration: 1.5
                    });
                    prevLoc.current = location;
                }
            }
        }, [location?.lat, location?.lng, map, tracking, ZOOM_LEVEL]);

        return null;
    }

    const [tracking, setTracking] = useState(true);

    return (
        <div className="h-full w-full overflow-hidden shadow-inner">
            <MapContainer
                center={position}
                zoom={5}
                minZoom={4}
                maxBounds={[[6.0, 68.0], [37.0, 97.0]]} // Approximate bounds of India
                maxBoundsViscosity={1.0}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                <MapEvents onMapClick={onMapClick} />
                <UserLocationUpdater location={userLocation} />

                {/* Current User */}
                {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                        <Popup>You are here</Popup>
                        <Circle center={[userLocation.lat, userLocation.lng]} radius={100} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 1 }} />
                    </Marker>
                )}

                {/* Nearby Users */}
                {nearbyUsers.map((u) => (
                    <Marker
                        key={`user-${u.id}`}
                        position={[u.lat, u.lng]}
                        icon={u.isHelpRequested ? helpRequestedIcon : nearbyIcon}
                        zIndexOffset={u.isHelpRequested ? 1000 : 0}
                    >
                        <Popup>
                            {u.isHelpRequested ? (
                                <div className="text-center">
                                    <div className="font-bold text-red-600 mb-2">HELP REQUESTED!</div>
                                    {onOfferHelp && (
                                        <button
                                            onClick={() => {
                                                console.log("Offer Help Clicked for:", u.id);
                                                onOfferHelp(u.id);
                                            }}
                                            className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full hover:bg-blue-700 shadow-sm"
                                        >
                                            Offer Help
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div>Nearby User</div>
                            )}
                        </Popup>
                    </Marker>
                ))}


                {/* Render Incidents */}
                {incidents.map((incident) => (
                    <Marker
                        key={incident.id}
                        position={[incident.lat, incident.lng]}
                    >
                        <Popup>
                            <strong>{incident.category}</strong><br />
                            {incident.description}<br />
                            <span className="text-xs text-neutral-500">
                                {new Date(incident.timestamp).toLocaleString()}
                            </span>
                        </Popup>
                    </Marker>
                ))}

                {/* Heatmap Simulation (Circles) */}
                {incidents.map((incident) => (
                    <Circle
                        key={`heat-${incident.id}`}
                        center={[incident.lat, incident.lng]}
                        pathOptions={{ fillColor: 'red', color: 'transparent', fillOpacity: 0.1 }}
                        radius={500}
                    />
                ))}

            </MapContainer>

            {/* Recenter Button */}
            {!tracking && userLocation && (
                <button
                    onClick={() => setTracking(true)}
                    className="absolute bottom-24 right-6 bg-white p-3 rounded-full shadow-lg z-[400] text-blue-600 border border-neutral-200 hover:bg-blue-50 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg>
                    <span className="sr-only">Recenter</span>
                </button>
            )}
        </div>
    );
}

