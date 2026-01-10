import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateRiskScore, generateAlerts } from '@/lib/risk';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const lat = parseFloat(searchParams.get('lat') || '0');
        const lng = parseFloat(searchParams.get('lng') || '0');

        // If no valid location provided, return empty or safe default?
        // Let's assume global/recent if 0,0 but the frontend enforces location now.
        // For localized risk, we want incidents nearby.
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

        const riskAnalysis = calculateRiskScore(incidents);
        const alerts = generateAlerts(incidents);

        return NextResponse.json({
            ...riskAnalysis,
            alerts
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to analyze risk' }, { status: 500 });
    }
}
