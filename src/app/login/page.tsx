'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                // Clear guest session
                localStorage.removeItem('safety_user_id');
                router.push('/');
                router.refresh(); // Refresh to update auth state in root layout/dashboard
            } else {
                const data = await res.json();
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-100 p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-neutral-200">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-neutral-900 flex items-center justify-center gap-2">
                        <span className="w-3 h-3 bg-primary rounded-full"></span>
                        SafeCity Login
                    </h1>
                    <p className="text-sm text-neutral-500 mt-2">Sign in to access personalized safety features</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg shadow-lg shadow-red-500/20 transition-all disabled:opacity-70"
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-neutral-500">
                    Don't have an account? <Link href="/register" className="text-primary font-semibold hover:underline">Sign up</Link>
                </div>
                <div className="mt-2 text-center text-sm">
                    <Link href="/" className="text-neutral-400 hover:text-neutral-600">Back to Dashboard</Link>
                </div>
            </div>
        </div>
    );
}
