import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, setSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { name, email, password, phoneNumber, emergencyContactName, emergencyContactNumber } = await request.json();

        if (!email || !password || !phoneNumber || !emergencyContactName || !emergencyContactNumber) {
            return NextResponse.json({ error: 'All fields including emergency contacts are required for your safety.' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        const hashedPassword = await hashPassword(password);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phoneNumber,
                emergencyContactName,
                emergencyContactNumber
            }
        });

        // Auto login
        const token = await signToken({ sub: user.id, email: user.email, name: user.name });
        await setSession(token);

        return NextResponse.json({ id: user.id, email: user.email, name: user.name });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
