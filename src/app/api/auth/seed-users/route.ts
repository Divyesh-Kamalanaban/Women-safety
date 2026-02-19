import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        // Create test users
        const testUsers = [
            {
                name: 'Alice Johnson',
                email: 'alice@example.com',
                password: 'password123',
                phoneNumber: '9876543210',
                emergencyContactName: 'Bob Johnson',
                emergencyContactNumber: '9876543211'
            },
            {
                name: 'Priya Singh',
                email: 'priya@example.com',
                password: 'password123',
                phoneNumber: '8765432109',
                emergencyContactName: 'Rajesh Singh',
                emergencyContactNumber: '8765432108'
            },
            {
                name: 'Emma Wilson',
                email: 'emma@example.com',
                password: 'password123',
                phoneNumber: '7654321098',
                emergencyContactName: 'David Wilson',
                emergencyContactNumber: '7654321097'
            }
        ];

        const createdUsers = [];

        for (const user of testUsers) {
            // Check if user exists
            const existingUser = await prisma.user.findUnique({
                where: { email: user.email }
            });

            if (existingUser) {
                console.log(`User ${user.email} already exists, skipping...`);
                createdUsers.push({
                    email: user.email,
                    status: 'already_exists',
                    id: existingUser.id
                });
                continue;
            }

            // Create new user
            const hashedPassword = await hashPassword(user.password);
            const newUser = await prisma.user.create({
                data: {
                    name: user.name,
                    email: user.email,
                    password: hashedPassword,
                    phoneNumber: user.phoneNumber,
                    emergencyContactName: user.emergencyContactName,
                    emergencyContactNumber: user.emergencyContactNumber
                }
            });

            createdUsers.push({
                email: user.email,
                status: 'created',
                id: newUser.id
            });
        }

        return NextResponse.json({
            message: 'Test users created',
            users: createdUsers,
            testCredentials: [
                { email: 'alice@example.com', password: 'password123' },
                { email: 'priya@example.com', password: 'password123' },
                { email: 'emma@example.com', password: 'password123' }
            ]
        });

    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({
            error: 'Failed to seed users',
            details: String(error)
        }, { status: 500 });
    }
}
