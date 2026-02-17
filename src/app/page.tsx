"use client";

import Link from 'next/link';
import { Shield, Lock, MapPin, Bell } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans">
      <header className="fixed w-full top-0 z-50 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold tracking-tight">Sororine</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Features</a>
            <a href="#about" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">About</a>
            <Link href="/login" className="text-sm font-medium text-white hover:text-primary transition-colors">Log in</Link>
            <Link href="/dashboard" className="px-5 py-2.5 bg-white text-neutral-900 text-sm font-bold rounded-full hover:bg-neutral-200 transition-colors">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-neutral-900/0 to-neutral-900 z-0"></div>
          <div className="container mx-auto relative z-10 text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800/50 border border-neutral-700 text-sm text-neutral-300 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live in 50+ Cities
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
              Your Safety, <br /> Our Priority.
            </h1>
            <p className="text-xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              Real-time safety analytics, emergency response coordination, and community-driven alerts—all in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg shadow-primary/25">
                Start for Free
              </Link>
              <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-lg border border-neutral-700 transition-all">
                Live Demo
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 bg-neutral-950">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-16">Intelligence that Protects</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<MapPin className="w-6 h-6 text-blue-500" />}
                title="Real-time Heatmaps"
                description="visualize safety risks in your area with live data updates and historical incident tracking."
              />
              <FeatureCard
                icon={<Bell className="w-6 h-6 text-red-500" />}
                title="Instant Alerts"
                description="Get notified immediately when entering high-risk zones or when incidents occur nearby."
              />
              <FeatureCard
                icon={<Lock className="w-6 h-6 text-emerald-500" />}
                title="Secure SOS"
                description="One-tap emergency response triggering automated alerts to trusted contacts and authorities."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-neutral-900 border-t border-neutral-800 py-12">
        <div className="container mx-auto px-6 text-center text-neutral-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Women Safety Analytics Platform by Divyesh Kamalanaban. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors">
      <div className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-neutral-400 leading-relaxed">{description}</p>
    </div>
  );
}
