
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { id, active } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        if (active) {
            await prisma.userLocation.update({
                where: { id },
                data: { helpRequestedAt: new Date() }
            });
        } else {
            console.log(`[API] Deactivating help for ID: ${id}. Removing offers...`);
            // Deactivate help request AND resolve all associated offers
            const result = await prisma.$transaction([
                prisma.userLocation.update({
                    where: { id },
                    data: { helpRequestedAt: null }
                }),
                prisma.helpOffer.deleteMany({
                    where: { requesterId: id }
                })
            ]);
            console.log(`[API] Help ended. Offers deleted count:`, result[1].count);
        }

        return NextResponse.json({ success: true, status: active ? 'active' : 'inactive' });

    } catch (error) {
        console.error('Error updating help status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        const userLoc = await prisma.userLocation.findUnique({
            where: { id },
            select: { helpRequestedAt: true }
        });

        const isActive = !!(userLoc?.helpRequestedAt && (Date.now() - new Date(userLoc.helpRequestedAt).getTime() < 15 * 60 * 1000));
        return NextResponse.json({ active: isActive });

    } catch (error) {
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}
