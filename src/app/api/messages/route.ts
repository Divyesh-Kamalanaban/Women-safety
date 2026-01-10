
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const user1 = searchParams.get('user1');
        const user2 = searchParams.get('user2');
        const after = searchParams.get('after'); // Optional: for polling optimization

        if (!user1 || !user2) {
            return NextResponse.json({ error: 'Missing user IDs' }, { status: 400 });
        }

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: user1, receiverId: user2 },
                    { senderId: user2, receiverId: user1 }
                ],
                createdAt: after ? { gt: new Date(after) } : undefined
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        return NextResponse.json({ messages });

    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { senderId, receiverId, content } = await request.json();

        if (!senderId || !receiverId || !content) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const message = await prisma.message.create({
            data: {
                senderId,
                receiverId,
                content
            }
        });

        return NextResponse.json({ success: true, message });

    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
