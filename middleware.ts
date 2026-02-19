import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect dashboard and dashboard-related routes
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/reports') || pathname.startsWith('/settings') || pathname.startsWith('/history') || pathname.startsWith('/alerts')) {
        const token = request.cookies.get('auth_token')?.value;

        // If no token, redirect to login
        if (!token) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Verify token validity
        try {
            const decoded = await verifyToken(token);
            if (!decoded) {
                const loginUrl = new URL('/login', request.url);
                loginUrl.searchParams.set('redirect', pathname);
                return NextResponse.redirect(loginUrl);
            }
        } catch (error) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Allow access to login, register, and home pages without auth
    return NextResponse.next();
}

// Configure which routes this middleware applies to
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/reports/:path*',
        '/settings/:path*',
        '/history/:path*',
        '/alerts/:path*',
    ],
};
