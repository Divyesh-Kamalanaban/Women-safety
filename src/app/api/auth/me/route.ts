import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const session = await getSession();
    if (!session || !session.sub) {
        return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.sub as string },
        select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            emergencyContactName: true,
            emergencyContactNumber: true,
            isPhoneVerified: true,
            location: {
                select: {
                    lat: true,
                    lng: true
                }
            }
        }
    });

    if (!user) {
        return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
}
