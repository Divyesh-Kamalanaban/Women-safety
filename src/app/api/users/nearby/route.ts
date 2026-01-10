import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
    try {


        // Clean up old users (inactive for > 5 minutes)
        // Check for viewer identity to determine permission for exact location
        const viewerId = request.headers.get('x-user-id') || (await getSession())?.sub;

        // Clean up old users (inactive for > 5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        const activeUsers = await prisma.userLocation.findMany({
            where: {
                lastUpdated: {
                    gte: fiveMinutesAgo
                },
                // Server-side filtering: Exclude the viewer
                id: viewerId ? { not: viewerId } : undefined
            },
            select: {
                id: true,
                lat: true,
                lng: true,
                lastUpdated: true,
                helpRequestedAt: true,
                receivedOffers: viewerId ? {
                    where: {
                        helperId: viewerId,
                        status: 'ACCEPTED'
                    },
                    select: { id: true }
                } : undefined
            }
        });

        // Fuzzing: Slightly randomize locations to protect exact user privacy
        // UNLESS the viewer is an ACCEPTED helper.
        const fuzzedUsers = activeUsers.map(u => {
            const isHelpRequested = u.helpRequestedAt && (Date.now() - new Date(u.helpRequestedAt).getTime() < 15 * 60 * 1000);

            // If viewer is an accepted helper, reveal exact location
            const isAuthorized = u.receivedOffers && u.receivedOffers.length > 0;
            const fuzzAmount = isAuthorized ? 0 : 0.002;

            return {
                id: u.id,
                lat: u.lat + (Math.random() - 0.5) * fuzzAmount,
                lng: u.lng + (Math.random() - 0.5) * fuzzAmount,
                lastUpdated: u.lastUpdated,
                isHelpRequested: !!isHelpRequested,
                isAuthorized // Let client know if they have special access
            };
        });

        // Ensure no caching for this sensitive endpoint
        return NextResponse.json(fuzzedUsers, {
            headers: {
                'Cache-Control': 'no-store, max-age=0'
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
