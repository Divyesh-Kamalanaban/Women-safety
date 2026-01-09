import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateRiskScore, generateAlerts } from '@/lib/risk';

export async function GET(request: Request) {
    try {
        // In a real app, we would take bounds (lat/lng) querystrings
        // For this demo, we analyze the global state (or last 100)
        const incidents = await prisma.incident.findMany({
            take: 100,
            orderBy: { timestamp: 'desc' } // Analyze most recent
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
