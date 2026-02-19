"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldAlert, LogIn, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [redirectPath, setRedirectPath] = useState('/dashboard');

    useEffect(() => {
        const redirect = searchParams.get('redirect');
        if (redirect) {
            setRedirectPath(redirect);
        }
    }, [searchParams]);

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
                // Clear guest session
                localStorage.removeItem('safety_user_id');
                router.push(redirectPath);
                router.refresh(); // Refresh to update auth state in root layout/dashboard
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
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6 shadow-2xl shadow-primary/20">
                        <ShieldAlert size={32} className="text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
                    <p className="text-gray-400">Sign in to report and view incidents based on your location.</p>
                </div>

                <div className="glass-card p-8 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl bg-black/40">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

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

                    {/* Demo Info Box */}
                    <div className="mt-8 pt-6 border-t border-gray-700">
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <p className="text-xs text-blue-300 font-semibold mb-3 uppercase tracking-wide">Demo Credentials</p>
                            <div className="space-y-2 text-xs text-gray-400 font-mono mb-4">
                                <div className="flex justify-between items-center">
                                    <span>alice@example.com</span>
                                    <span className="text-gray-600">/</span>
                                    <span>password123</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>priya@example.com</span>
                                    <span className="text-gray-600">/</span>
                                    <span>password123</span>
                                </div>
                            </div>
                            <Link 
                                href="/demo" 
                                className="text-xs text-blue-400 hover:text-blue-300 transition-colors underline"
                            >
                                Need to create test users? Visit demo page →
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="mt-8 text-center">
                    <Link href="/" className="text-gray-500 hover:text-white text-sm transition-colors flex items-center justify-center gap-2">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
