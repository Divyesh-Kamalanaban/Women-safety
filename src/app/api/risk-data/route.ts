import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateRiskScore, generateAlerts } from '@/lib/risk';
import { getStateRiskScore } from '@/lib/risk-dataset';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const lat = parseFloat(searchParams.get('lat') || '0');
        const lng = parseFloat(searchParams.get('lng') || '0');

        // 1. Fetch State using Reverse Geocoding
        // We use OpenStreetMap Nominatim (Free, requires User-Agent)
        let datasetScore = 0;
        let detectedState = 'Unknown';

        if (lat !== 0 && lng !== 0) {
            try {
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
                    headers: {
                        'User-Agent': 'WomenSafetyApp/1.0 (educational project)'
                    }
                });
                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    const address = geoData.address || {};
                    const state = address.state || address.region || '';
                    detectedState = state;
                    datasetScore = getStateRiskScore(state);
                }
            } catch (e) {
                console.error("Geocoding failed", e);
            }
        }

        // 2. Fetch Incidents
        // Prisma SQLite doesn't support complex PostGIS, so we do simple bounding box.
        // 1 deg lat ~= 111km. 0.02 deg ~= 2km.
        const ROUGH_radius = 0.02;

        // Fetch recent incidents within the bounding box
        const incidents = await prisma.incident.findMany({
            where: {
                lat: {
                    gte: lat - ROUGH_radius,
                    lte: lat + ROUGH_radius
                },
                lng: {
                    gte: lng - ROUGH_radius,
                    lte: lng + ROUGH_radius
                }
            },
            take: 100,
            orderBy: { timestamp: 'desc' }
        });

        // 3. Calculate Final Risk
        const riskAnalysis = calculateRiskScore(incidents, datasetScore);
        const alerts = generateAlerts(incidents);

        return NextResponse.json({
            ...riskAnalysis,
            alerts,
            meta: {
                detectedState,
                datasetScore
            }
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to analyze risk' }, { status: 500 });
    }
}
