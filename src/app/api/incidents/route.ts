import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

        // In production, we'd add viewport bounding box filtering here
        const incidents = await prisma.incident.findMany({
            orderBy: { timestamp: 'desc' },
            take: limit || 500,
        });

        return NextResponse.json(incidents);
    } catch (error) {
        console.error('Error fetching incidents:', error);
        return NextResponse.json({ error: 'Failed to fetch incidents' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { lat, lng, category, description, timestamp, imageUrl, location } = body;

        // Simple validation
        if (!lat || !lng || !category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const incident = await prisma.incident.create({
            data: {
                lat,
                lng,
                category,
                description,
                location,
                imageUrl,
                timestamp: new Date(timestamp || Date.now()),
            },
        });

        return NextResponse.json(incident);
    } catch (error) {
        console.error('Error creating incident:', error);
        return NextResponse.json({ error: 'Failed to create incident' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Incident ID is required' }, { status: 400 });
        }

        await prisma.incident.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting incident:', error);
        return NextResponse.json({ error: 'Failed to delete incident' }, { status: 500 });
    }
}
