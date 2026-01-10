import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request) {
    try {
        const { id, phoneNumber, emergencyContactName, emergencyContactNumber } = await request.json();

        if (!id || !phoneNumber || !emergencyContactName || !emergencyContactNumber) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // --- Validation Logic ---
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;

        if (!phoneRegex.test(phoneNumber)) {
            return NextResponse.json({ error: 'Invalid user phone number format' }, { status: 400 });
        }

        if (!phoneRegex.test(emergencyContactNumber)) {
            return NextResponse.json({ error: 'Invalid emergency contact number format' }, { status: 400 });
        }

        if (phoneNumber === emergencyContactNumber) {
            return NextResponse.json({ error: 'User phone and emergency contact number cannot be the same' }, { status: 400 });
        }
        // ------------------------

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                phoneNumber,
                emergencyContactName,
                emergencyContactNumber,
                isPhoneVerified: true // Assuming self-verification for now
            }
        });

        return NextResponse.json({ user: updatedUser });

    } catch (error) {
        console.error("Update failed", error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
