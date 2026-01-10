
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { action, requesterId, helperId, offerId } = await request.json();

        if (action === 'OFFER') {
            if (!requesterId || !helperId) return NextResponse.json({ error: 'Missing IDs' }, { status: 400 });

            // Create or update help offer
            const offer = await prisma.helpOffer.upsert({
                where: {
                    requesterId_helperId: {
                        requesterId,
                        helperId
                    }
                },
                update: {
                    status: 'PENDING',
                    createdAt: new Date() // specific update acts as a "bump"
                },
                create: {
                    requesterId,
                    helperId,
                    status: 'PENDING'
                }
            });
            return NextResponse.json({ success: true, offer });
        }

        if (action === 'ACCEPT') {
            if (!offerId) return NextResponse.json({ error: 'Missing Offer ID' }, { status: 400 });

            // Update status to ACCEPTED
            const offer = await prisma.helpOffer.update({
                where: { id: offerId },
                data: { status: 'ACCEPTED' }
            });
            return NextResponse.json({ success: true, offer });
        }

        return NextResponse.json({ error: 'Invalid Action' }, { status: 400 });

    } catch (error) {
        console.error('Help Offer API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const requesterId = searchParams.get('requesterId');

        if (!requesterId) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        // Get pending offers for this requester
        const offers = await prisma.helpOffer.findMany({
            where: {
                requesterId,
                status: 'PENDING'
            },
            include: {
                helper: {
                    select: { lat: true, lng: true } // Return basic location of helper to show who is offering
                }
            }
        });

        return NextResponse.json({ offers });

    } catch (error) {
        console.error('Error fetching offers:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
