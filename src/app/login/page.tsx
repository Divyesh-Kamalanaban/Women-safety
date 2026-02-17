"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, LogIn, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
<<<<<<< HEAD
                router.push('/');
                router.refresh();
=======
                // Clear guest session
                localStorage.removeItem('safety_user_id');
                router.push('/dashboard');
                router.refresh(); // Refresh to update auth state in root layout/dashboard
>>>>>>> 97bf6a1f067a8d455a4e98836353c862f0697872
            } else {
                const data = await res.json();
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050509] flex items-center justify-center p-4">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-8">
<<<<<<< HEAD
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6 shadow-2xl shadow-primary/20">
                        <ShieldAlert size={32} className="text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
                    <p className="text-gray-400">Sign in to report and view incidents based on your location.</p>
=======
                    <h1 className="text-2xl font-bold text-neutral-900 flex items-center justify-center gap-2">
                        <span className="w-3 h-3 bg-primary rounded-full"></span>
                        Sororine Login
                    </h1>
                    <p className="text-sm text-neutral-500 mt-2">Sign in to access personalized safety features</p>
>>>>>>> 97bf6a1f067a8d455a4e98836353c862f0697872
                </div>

                <div className="glass-card p-8 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl bg-black/40">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

<<<<<<< HEAD
                        <div className="space-y-4">
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-light"
                                    required
                                />
                            </div>
=======
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition placeholder:text-neutral-400"
                            placeholder="e.g. aditi@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition placeholder:text-neutral-400"
                            placeholder="Enter your password"
                        />
                    </div>
>>>>>>> 97bf6a1f067a8d455a4e98836353c862f0697872

                            <div className="relative group">
                                <Lock className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-light"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            Don't have an account?{' '}
                            <Link href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
<<<<<<< HEAD

                <div className="mt-8 text-center">
                    <Link href="/" className="text-gray-500 hover:text-white text-sm transition-colors flex items-center justify-center gap-2">
                        ← Back to Map
                    </Link>
=======
                <div className="mt-2 text-center text-sm">
                    <Link href="/" className="text-neutral-400 hover:text-neutral-600">Back to Home</Link>
>>>>>>> 97bf6a1f067a8d455a4e98836353c862f0697872
                </div>
            </div>
        </div>
    );
}
