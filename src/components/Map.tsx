'use client';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Incident } from '@prisma/client';
import { Plus, Minus, Navigation } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

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

// ... (Icons code remains same, omitted for brevity if unchanged, but I must provide full replacement for the block I'm targeting or ensure context matches)
// Since I am replacing the whole file content structure essentially to add styles/logic, I will rewrite the component.
// Note: To be safe with replace_file_content, I need to match exact context.
// I will target the component definition onwards.

// Custom icons
const createIcon = (color: string) => L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 3px solid #050509; box-shadow: 0 0 10px ${color}, 0 0 20px ${color};"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
});

const userIcon = L.divIcon({
    className: 'user-marker',
    html: `<div style="background-color: #2E2BAC; width: 16px; height: 16px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 0 4px rgba(46, 43, 172, 0.5);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
});

const nearbyIcon = L.divIcon({
    className: 'nearby-marker',
    html: `<div style="background-color: #10b981; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #050509; box-shadow: 0 0 8px #10b981;"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
});

const helpRequestedIcon = L.divIcon({
    className: 'help-marker',
    html: `<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.5); animation: pulse 1s infinite;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});


export default function SafetyMap({ incidents, userLocation, nearbyUsers = [], onMapClick, onOfferHelp }: MapProps) {
    const [position, setPosition] = useState<[number, number]>([28.6139, 77.2090]);
    const [map, setMap] = useState<L.Map | null>(null);

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

    // Custom Map Controller to expose map instance
    function MapController() {
        const mapInstance = useMapEvents({});
        useEffect(() => {
            setMap(mapInstance);
        }, [mapInstance]);
        return null;
    }

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

    const handleZoomIn = () => map?.zoomIn();
    const handleZoomOut = () => map?.zoomOut();
    const handleRecenter = () => {
        if (userLocation && map) {
            setTracking(true);
            map.flyTo([userLocation.lat, userLocation.lng], ZOOM_LEVEL, { animate: true });
        }
    };

    return (
        <div className="h-full w-full overflow-hidden bg-[#050509] relative">
            <MapContainer
                center={position}
                zoom={5}
                minZoom={4}
                maxBounds={[[6.0, 68.0], [37.0, 97.0]]}
                maxBoundsViscosity={1.0}
                style={{ height: '100%', width: '100%', background: '#050509' }}
                zoomControl={false} // Disable default
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                <MapController />
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

                {/* Incidents */}
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

                {/* Heatmap Simulation */}
                {incidents.map((incident) => (
                    <Circle
                        key={`heat-${incident.id}`}
                        center={[incident.lat, incident.lng]}
                        pathOptions={{ fillColor: 'red', color: 'transparent', fillOpacity: 0.1 }}
                        radius={500}
                    />
                ))}
            </MapContainer>

            {/* Custom Controls Container - Right Center */}
            <div className="absolute top-1/2 right-6 -translate-y-1/2 flex flex-col gap-2 z-[400]">
                <button
                    onClick={handleZoomIn}
                    className="bg-[#0A0A10]/90 p-3 rounded-xl shadow-lg text-white border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-md"
                    title="Zoom In"
                >
                    <Plus size={20} />
                </button>
                <button
                    onClick={handleZoomOut}
                    className="bg-[#0A0A10]/90 p-3 rounded-xl shadow-lg text-white border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-md"
                    title="Zoom Out"
                >
                    <Minus size={20} />
                </button>

                {/* Separator */}
                <div className="h-2"></div>

                {userLocation && (
                    <button
                        onClick={handleRecenter}
                        className={`p-3 rounded-xl shadow-lg border border-white/10 transition-colors backdrop-blur-md ${tracking
                            ? "bg-blue-600 text-white shadow-blue-600/20"
                            : "bg-[#0A0A10]/90 text-blue-500 hover:bg-white/10"
                            }`}
                        title="Recenter Map"
                    >
                        <Navigation size={20} className={tracking ? "fill-current" : ""} />
                    </button>
                )}
            </div>
        </div>
    );
}

