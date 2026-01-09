'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            if (res.ok) {
                localStorage.removeItem('safety_user_id'); // Clear guest session
                router.push('/');
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.error || 'Registration failed');
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
                        <span className="w-3 h-3 bg-secondary rounded-full"></span>
                        SafeCity Join
                    </h1>
                    <p className="text-sm text-neutral-500 mt-2">Create an account to contribute safely</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition"
                            placeholder="Jane Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition"
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
                            className="w-full p-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition"
                            placeholder="At least 6 characters"
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-secondary hover:bg-secondary-hover text-white font-bold rounded-lg shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-70"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-neutral-500">
                    Already have an account? <Link href="/login" className="text-secondary font-semibold hover:underline">Sign in</Link>
                </div>
                <div className="mt-2 text-center text-sm">
                    <Link href="/" className="text-neutral-400 hover:text-neutral-600">Back to Dashboard</Link>
                </div>
            </div>
        </div>
    );
}
