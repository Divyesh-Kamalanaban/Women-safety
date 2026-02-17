"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, Mail, Lock, User, Phone, HeartPulse, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        emergencyContactName: '',
        emergencyContactNumber: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

<<<<<<< HEAD
=======
        // 1. Password Strength
        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            setLoading(false);
            return;
        }

        // 2. Phone Validation (Indian Format Preferred)
        // Allows +91 or just 10 digits starting with 6-9
        const phoneRegex = /^(\+91[\-\s]?)?[6789]\d{9}$/;
        if (!phoneRegex.test(phoneNumber)) {
            setError('Please enter a valid Indian mobile number (e.g., +91 9876543210).');
            setLoading(false);
            return;
        }

        // 3. Emergency Contact Validation
        if (!emergencyName || !emergencyNumber) {
            setError('Emergency contact details are mandatory.');
            setLoading(false);
            return;
        }

        if (!phoneRegex.test(emergencyNumber)) {
            setError('Please enter a valid emergency contact number (Indian format).');
            setLoading(false);
            return;
        }

        // 4. Circular Reference Check
        if (phoneNumber === emergencyNumber) {
            setError('You cannot be your own emergency contact. Please provide a different number.');
            setLoading(false);
            return;
        }

>>>>>>> 97bf6a1f067a8d455a4e98836353c862f0697872
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
<<<<<<< HEAD
                router.push('/');
=======
                localStorage.removeItem('safety_user_id'); // Clear guest session
                router.push('/dashboard');
>>>>>>> 97bf6a1f067a8d455a4e98836353c862f0697872
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.error || 'Registration failed');
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
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-2xl relative z-10 animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-8">
<<<<<<< HEAD
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Create Account</h1>
                    <p className="text-gray-400">Join the community to ensure safety for everyone.</p>
                </div>

                <div className="glass-card p-8 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl bg-black/40">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                {error}
=======
                    <h1 className="text-2xl font-bold text-neutral-900 flex items-center justify-center gap-2">
                        <span className="w-3 h-3 bg-secondary rounded-full"></span>
                        Sororine Join
                    </h1>
                    <p className="text-sm text-neutral-500 mt-2">Create an account to contribute safely</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-2">
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
                            className="w-full p-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition placeholder:text-neutral-400"
                            placeholder="e.g. Aditi Sharma"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition placeholder:text-neutral-400"
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
                            className="w-full p-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition placeholder:text-neutral-400"
                            placeholder="Min. 8 characters"
                            minLength={8}
                        />
                    </div>

                    <div className="pt-4 border-t border-neutral-100">
                        <h3 className="text-sm font-bold text-neutral-900 mb-3 text-red-600 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            Emergency Contact (Required)
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 mb-1">Your Phone Number</label>
                                <input
                                    type="tel"
                                    required
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full p-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition placeholder:text-neutral-400"
                                    placeholder="+91 98765 43210"
                                />
                                <p className="text-xs text-neutral-400 mt-1">We verify this for safety alerts.</p>
>>>>>>> 97bf6a1f067a8d455a4e98836353c862f0697872
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-5">
                            {/* Personal Info */}
                            <div className="md:col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-[-10px]">Personal Information</div>

                            <div className="relative group">
                                <User className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-light"
                                    required
<<<<<<< HEAD
=======
                                    value={emergencyName}
                                    onChange={(e) => setEmergencyName(e.target.value)}
                                    className="w-full p-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition placeholder:text-neutral-400"
                                    placeholder="e.g. Papa / Mom / Brother"
>>>>>>> 97bf6a1f067a8d455a4e98836353c862f0697872
                                />
                            </div>

                            <div className="relative group">
                                <Phone className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    placeholder="Phone Number"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-light"
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <Mail className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-light"
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-light"
                                    required
                                />
                            </div>

                            {/* Emergency Contact */}
                            <div className="md:col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider mt-2 mb-[-10px]">Emergency Contact (Critical)</div>

                            <div className="relative group">
                                <HeartPulse className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-red-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    name="emergencyContactName"
                                    placeholder="Contact Name"
                                    value={formData.emergencyContactName}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all font-light"
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <Phone className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-red-500 transition-colors" size={18} />
                                <input
                                    type="tel"
                                    name="emergencyContactNumber"
                                    placeholder="Contact Number"
                                    value={formData.emergencyContactNumber}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all font-light"
                                    required
<<<<<<< HEAD
=======
                                    value={emergencyNumber}
                                    onChange={(e) => setEmergencyNumber(e.target.value)}
                                    className="w-full p-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition placeholder:text-neutral-400"
                                    placeholder="+91 98765 43210"
>>>>>>> 97bf6a1f067a8d455a4e98836353c862f0697872
                                />
                                <p className="text-xs text-neutral-400 mt-1">Cannot be your own number.</p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-6"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Create Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
<<<<<<< HEAD
=======

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
                    <Link href="/" className="text-neutral-400 hover:text-neutral-600">Back to Home</Link>
>>>>>>> 97bf6a1f067a8d455a4e98836353c862f0697872
                </div>
            </div>
        </div>
    );
}
