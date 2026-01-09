import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        // Clean up old users (inactive for > 5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        // In a real app with PostGIS, we'd use geospatial queries.
        // For SQLite demo, we'll fetch recently active users and filter client-side or just return all active.
        // Given the scale of a demo, returning all active users is fine.

        const activeUsers = await prisma.userLocation.findMany({
            where: {
                lastUpdated: {
                    gte: fiveMinutesAgo
                }
            },
            select: {
                id: true,
                lat: true,
                lng: true,
                lastUpdated: true // Optional, for client to show "seen just now"
            }
        });

        return NextResponse.json(activeUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
