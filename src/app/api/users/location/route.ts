import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { id, lat, lng } = await request.json();

        if (!id || typeof lat !== 'number' || typeof lng !== 'number') {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        const location = await prisma.userLocation.upsert({
            where: { id },
            update: { lat, lng, lastUpdated: new Date() },
            create: { id, lat, lng, lastUpdated: new Date() },
        });

        return NextResponse.json(location);
    } catch (error) {
        console.error('Error updating location:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
