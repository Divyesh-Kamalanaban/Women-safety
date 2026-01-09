'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Incident } from '@prisma/client';

// Fix for default marker icon
const icon = L.icon({
    iconUrl: '/marker-icon.png',
    iconRetinaUrl: '/marker-icon-2x.png',
    shadowUrl: '/marker-shadow.png', // We'll need to provide these or use DivIcon
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// Or better, use DivIcon with Lucide
const createDivIcon = (category: string) => {
    let color = 'bg-red-500';
    if (category === 'Lighting') color = 'bg-amber-500';

    // Clean HTML string for specific marker
    // simpler to just use standard circle markers for heatmap feel
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: var(--primary); width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [12, 12]
    });
};


interface MapProps {
    incidents: Incident[];
    userLocation?: { lat: number, lng: number } | null;
    nearbyUsers?: { id: string, lat: number, lng: number }[];
    onMapClick?: (lat: number, lng: number) => void;
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


export default function SafetyMap({ incidents, userLocation, nearbyUsers = [], onMapClick }: MapProps) {
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

    // Default zoom
    const ZOOM_LEVEL = 15;

    // Fly to user location on first fix or update
    function UserLocationUpdater({ location }: { location?: { lat: number, lng: number } | null }) {
        const map = useMapEvents({});

        useEffect(() => {
            if (location) {
                map.flyTo([location.lat, location.lng], ZOOM_LEVEL, {
                    animate: true,
                    duration: 1.5
                });
            }
        }, [location, map]);

        return null;
    }

    return (
        <div className="h-[600px] w-full rounded-xl overflow-hidden shadow-inner border border-neutral-200">
            <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
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

                {/* Nearby Users using simple markers for now as custom icons can be tricky */}
                {nearbyUsers.map((u) => (
                    <Marker key={`user-${u.id}`} position={[u.lat, u.lng]} icon={nearbyIcon}>
                        <Popup>Nearby User</Popup>
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
        </div>
    );
}
