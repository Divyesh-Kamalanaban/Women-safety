
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST: Create a new help offer from a helper to a requester
 * Body:
 *   - action: "OFFER" | "ACCEPT" | "REJECT"
 *   - requesterId: ID of user requesting help
 *   - helperId: ID of user offering help
 *   - offerId: ID of offer (for ACCEPT/REJECT actions)
 */
export async function POST(request: Request) {
    try {
        const { action, requesterId, helperId, offerId } = await request.json();

        if (action === 'OFFER') {
            if (!requesterId || !helperId) {
                return NextResponse.json({ error: 'Missing IDs' }, { status: 400 });
            }

            // Verify requester exists and is requesting help
            const requester = await prisma.userLocation.findUnique({
                where: { id: requesterId },
                select: { helpRequestedAt: true }
            });

            if (!requester || !requester.helpRequestedAt) {
                return NextResponse.json({ 
                    error: 'User is not requesting help' 
                }, { status: 400 });
            }

            // Check if offer already exists
            const existingOffer = await prisma.helpOffer.findUnique({
                where: {
                    requesterId_helperId: {
                        requesterId,
                        helperId
                    }
                }
            });

            let offer;
            if (existingOffer) {
                // Update existing offer to bump it
                offer = await prisma.helpOffer.update({
                    where: { id: existingOffer.id },
                    data: {
                        status: 'PENDING',
                        createdAt: new Date()
                    }
                });
            } else {
                // Create new offer
                offer = await prisma.helpOffer.create({
                    data: {
                        requesterId,
                        helperId,
                        status: 'PENDING'
                    }
                });
            }

            return NextResponse.json({ success: true, offer });
        }

        if (action === 'ACCEPT') {
            if (!offerId) {
                return NextResponse.json({ error: 'Missing Offer ID' }, { status: 400 });
            }

            const offer = await prisma.helpOffer.update({
                where: { id: offerId },
                data: { status: 'ACCEPTED' }
            });

            return NextResponse.json({ success: true, offer });
        }

        if (action === 'REJECT') {
            if (!offerId) {
                return NextResponse.json({ error: 'Missing Offer ID' }, { status: 400 });
            }

            const offer = await prisma.helpOffer.update({
                where: { id: offerId },
                data: { status: 'REJECTED' }
            });

            return NextResponse.json({ success: true, offer });
        }

        return NextResponse.json({ error: 'Invalid Action' }, { status: 400 });

    } catch (error: any) {
        console.error('Help Offer API Error:', error);
        
        // Handle Prisma unique constraint error
        if (error.code === 'P2002') {
            return NextResponse.json({ 
                error: 'Offer already exists for this pair' 
            }, { status: 409 });
        }

        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * GET: Get pending help offers for a user
 * Query params:
 *   - requesterId: ID of user requesting help (to get offers FOR them)
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const requesterId = searchParams.get('requesterId');

        if (!requesterId) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        // Get pending offers for this requester
        const offers = await prisma.helpOffer.findMany({
            where: {
                requesterId,
                status: 'PENDING'
            },
            include: {
                helper: {
                    select: { 
                        id: true,
                        lat: true, 
                        lng: true,
                        lastUpdated: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ offers });

    } catch (error) {
        console.error('Error fetching offers:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
