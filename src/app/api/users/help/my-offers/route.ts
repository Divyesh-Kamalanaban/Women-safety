import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET: Retrieve all help offers received by the current user (where they are the helper)
 * Query params: 
 *   - id: The user's ID
 *   - status: (optional) Filter by status (PENDING, ACCEPTED, REJECTED)
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const helperId = searchParams.get('id');
        const status = searchParams.get('status'); // PENDING, ACCEPTED, REJECTED

        if (!helperId) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        const whereClause: any = {
            helperId
        };

        // Filter by status if provided
        if (status && ['PENDING', 'ACCEPTED', 'REJECTED'].includes(status)) {
            whereClause.status = status;
        }

        const offers = await prisma.helpOffer.findMany({
            where: whereClause,
            include: {
                requester: {
                    select: { 
                        id: true,
                        lat: true, 
                        lng: true,
                        lastUpdated: true,
                        helpRequestedAt: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ offers });

    } catch (error) {
        console.error('Error fetching my offers:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * PATCH: Update offer status (Accept, Reject)
 * Body:
 *   - offerId: The offer ID
 *   - status: The status to update to (ACCEPTED, REJECTED)
 */
export async function PATCH(request: Request) {
    try {
        const { offerId, status } = await request.json();

        if (!offerId || !status) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        if (!['ACCEPTED', 'REJECTED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const offer = await prisma.helpOffer.update({
            where: { id: offerId },
            data: { status },
            include: {
                requester: true,
                helper: true
            }
        });

        return NextResponse.json({ success: true, offer });

    } catch (error) {
        console.error('Error updating offer:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
