import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET: Retrieve all pending help offers for a requester
 * Query params:
 *   - id: The requester's ID
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const requesterId = searchParams.get('id');

        if (!requesterId) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

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
        console.error('Error fetching pending offers:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
