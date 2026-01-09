import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Clear existing? Optional
        // await prisma.incident.deleteMany();

        const center = { lat: 28.6139, lng: 77.2090 };
        const categories = ['Harassment', 'Poor Lighting', 'Stalking', 'Unsafe Crowding', 'Eve Teasing'];

        const incidents = [];

        // Generate 20 incidents
        for (let i = 0; i < 20; i++) {
            // Random offset 0.01 degrees (~1km)
            const lat = center.lat + (Math.random() - 0.5) * 0.02;
            const lng = center.lng + (Math.random() - 0.5) * 0.02;

            // Random time in last 3 days
            const timeOffset = Math.random() * 3 * 24 * 60 * 60 * 1000;
            const timestamp = new Date(Date.now() - timeOffset);

            // Weigh towards night for demo risk
            if (Math.random() > 0.5) {
                timestamp.setHours(20 + Math.floor(Math.random() * 4)); // 8PM - 12AM
            }

            incidents.push({
                lat,
                lng,
                category: categories[Math.floor(Math.random() * categories.length)],
                description: "Generated demo report for safety analytics.",
                timestamp
            });
        }

        await prisma.incident.createMany({
            data: incidents
        });

        return NextResponse.json({ message: 'Seeded 20 incidents', count: incidents.length });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to seed' }, { status: 500 });
    }
}
