import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signToken, setSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        let user;
        try {
            user = await prisma.user.findUnique({ where: { email } });
        } catch (dbError) {
            console.error('Database query error:', dbError);
            return NextResponse.json({ error: 'Database error. Please try again.' }, { status: 500 });
        }

        if (!user) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        let isValid;
        try {
            isValid = await verifyPassword(password, user.password);
        } catch (verifyError) {
            console.error('Password verification error:', verifyError);
            return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
        }

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        let token;
        try {
            token = await signToken({ sub: user.id, email: user.email, name: user.name });
        } catch (tokenError) {
            console.error('Token signing error:', tokenError);
            return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
        }

        try {
            await setSession(token);
        } catch (sessionError) {
            console.error('Session error:', sessionError);
            return NextResponse.json({ error: 'Failed to set session' }, { status: 500 });
        }

        return NextResponse.json({ id: user.id, email: user.email, name: user.name });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
    }
}
