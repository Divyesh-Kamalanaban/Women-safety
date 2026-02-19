"use client";

import Link from 'next/link';
import { ShieldAlert, Users, Key, RefreshCw, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function DemoPage() {
    const [seedStatus, setSeedStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [seedMessage, setSeedMessage] = useState('');
    const [testUsers, setTestUsers] = useState<any[]>([]);

    const handleSeedUsers = async () => {
        setSeedStatus('loading');
        try {
            const res = await fetch('/api/auth/seed-users');
            const data = await res.json();
            
            if (res.ok) {
                setSeedStatus('success');
                setSeedMessage('Test users created successfully!');
                setTestUsers(data.testCredentials);
            } else {
                setSeedStatus('error');
                setSeedMessage(data.error || 'Failed to seed users');
            }
        } catch (error) {
            setSeedStatus('error');
            setSeedMessage('Error seeding users');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-950 text-white p-4">
            <div className="max-w-4xl mx-auto py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <ShieldAlert className="w-8 h-8 text-blue-500" />
                        <h1 className="text-4xl font-bold">Sororine Demo</h1>
                    </div>
                    <p className="text-neutral-400 text-lg">Getting started with the women safety platform</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Test Credentials */}
                    <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-8">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Key className="w-6 h-6 text-blue-500" />
                            Test Credentials
                        </h2>
                        <div className="space-y-4 mb-6">
                            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                <p className="text-sm text-neutral-400 mb-2">Use any of these to login:</p>
                                <div className="space-y-2 font-mono text-sm">
                                    <div>
                                        <p className="text-neutral-300">alice@example.com</p>
                                        <p className="text-blue-400">password123</p>
                                    </div>
                                    <div>
                                        <p className="text-neutral-300">priya@example.com</p>
                                        <p className="text-blue-400">password123</p>
                                    </div>
                                    <div>
                                        <p className="text-neutral-300">emma@example.com</p>
                                        <p className="text-blue-400">password123</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Link
                            href="/login"
                            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                        >
                            Go to Login
                        </Link>
                    </div>

                    {/* Create Test Users */}
                    <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-8">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Users className="w-6 h-6 text-green-500" />
                            Initialize Database
                        </h2>
                        <div className="space-y-4">
                            <p className="text-neutral-400">
                                Create test users in the database. Click the button below to generate demo accounts.
                            </p>
                            <button
                                onClick={handleSeedUsers}
                                disabled={seedStatus === 'loading'}
                                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-neutral-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {seedStatus === 'loading' ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Creating Users...
                                    </>
                                ) : (
                                    <>
                                        <Users className="w-4 h-4" />
                                        Create Test Users
                                    </>
                                )}
                            </button>

                            {seedMessage && (
                                <div className={`p-4 rounded-lg ${
                                    seedStatus === 'success' 
                                        ? 'bg-green-500/10 border border-green-500/30 text-green-300' 
                                        : 'bg-red-500/10 border border-red-500/30 text-red-300'
                                }`}>
                                    {seedMessage}
                                </div>
                            )}

                            {testUsers.length > 0 && (
                                <div className="p-4 bg-neutral-700/50 rounded-lg">
                                    <p className="text-sm text-neutral-400 mb-2">Ready to login with:</p>
                                    <div className="space-y-1 font-mono text-sm text-blue-400">
                                        {testUsers.map((user, i) => (
                                            <p key={i}>{user.email}</p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-12 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                    <div className="flex gap-4">
                        <AlertCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-bold text-lg mb-2">How to Get Started</h3>
                            <ol className="space-y-2 text-neutral-300 text-sm list-decimal list-inside">
                                <li>Click "Create Test Users" to initialize the database with demo accounts</li>
                                <li>Go to the Login page and use any of the test credentials</li>
                                <li>You'll be redirected to the Dashboard after successful login</li>
                                <li>Explore the safety features, request help, and interact with the real-time map</li>
                            </ol>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="mt-12 flex gap-4 justify-center">
                    <Link
                        href="/"
                        className="px-6 py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-bold rounded-lg transition-colors"
                    >
                        Back to Home
                    </Link>
                    <Link
                        href="/login"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
