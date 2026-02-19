"use client";

import Link from 'next/link';
import { Shield, Lock, MapPin, Bell, Users, Zap, TrendingUp, MessageCircle, Heart, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="w-full bg-neutral-900 text-white font-sans scroll-smooth">
      {/* Navigation Header */}
      <header className="fixed w-full top-0 z-50 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Sororine
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Features</a>
            <a href="#community" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Community</a>
            <a href="#impact" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Impact</a>
            <Link href="/login" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Log in</Link>
            <Link href="/dashboard" className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25">
              Get Started
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-neutral-800/95 backdrop-blur-sm border-t border-neutral-700 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <a href="#features" className="text-sm font-medium text-neutral-300 hover:text-white">Features</a>
              <a href="#community" className="text-sm font-medium text-neutral-300 hover:text-white">Community</a>
              <a href="#impact" className="text-sm font-medium text-neutral-300 hover:text-white">Impact</a>
              <Link href="/login" className="text-sm font-medium text-blue-400 hover:text-blue-300">Log in</Link>
              <Link href="/dashboard" className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-full text-center">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="w-full">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/20 via-purple-600/10 to-neutral-900 z-0"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl -z-10"></div>

          <div className="container mx-auto relative z-10 text-center max-w-5xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-sm text-blue-300 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 hover:border-blue-500/50 transition-colors">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Live in 50+ Cities • 1M+ Users Protected
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-blue-200 to-neutral-500 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100 leading-tight">
              Your Safety,<br />Our Mission.
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-neutral-300 mb-8 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              Real-time safety analytics, community alerts, and peer-to-peer support. Stay informed, stay connected, stay safe.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl text-lg transition-all transform hover:scale-105 shadow-2xl shadow-blue-600/50 flex items-center justify-center gap-2"
              >
                Start for Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-lg border border-neutral-700 transition-all hover:border-neutral-600"
              >
                View Demo
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-neutral-400 text-sm animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>100% Free & Open Source</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Privacy First</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Real Community</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 px-4 sm:px-6 bg-gradient-to-b from-neutral-900 to-neutral-950">
          <div className="container mx-auto">
            <div className="text-center mb-16 animate-in fade-in duration-700">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Intelligence That Protects</h2>
              <p className="text-neutral-400 max-w-2xl mx-auto">Powered by real-time data, community insights, and cutting-edge technology</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<MapPin className="w-6 h-6 text-blue-500" />}
                title="Real-time Heatmaps"
                description="Visualize safety risks in your area with live data updates and 10+ years of historical incident tracking."
                delay={0}
              />
              <FeatureCard
                icon={<Bell className="w-6 h-6 text-red-500" />}
                title="Instant Alerts"
                description="Get notified immediately when entering high-risk zones or when incidents occur nearby in your circle."
                delay={100}
              />
              <FeatureCard
                icon={<Lock className="w-6 h-6 text-emerald-500" />}
                title="One-Tap SOS"
                description="Emergency response triggering automated alerts to trusted contacts, helpers, and authorities instantly."
                delay={200}
              />
              <FeatureCard
                icon={<Users className="w-6 h-6 text-amber-500" />}
                title="Community Support"
                description="Request help and connect with verified helpers in your area. Real people, real support, real safety."
                delay={300}
              />
              <FeatureCard
                icon={<MessageCircle className="w-6 h-6 text-pink-500" />}
                title="Instant Messaging"
                description="Secure, direct communication with helpers and community members. Chat in real-time when you need support."
                delay={400}
              />
              <FeatureCard
                icon={<TrendingUp className="w-6 h-6 text-cyan-500" />}
                title="Risk Analytics"
                description="Data-driven insights about patterns, trends, and safety metrics specific to your location and time."
                delay={500}
              />
            </div>
          </div>
        </section>

        {/* Community Section */}
        <section id="community" className="py-20 px-4 sm:px-6 bg-neutral-950">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="animate-in fade-in slide-in-from-left-8 duration-700">
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">Strength in Community</h2>
                <p className="text-neutral-400 text-lg mb-8">
                  Sororine connects women across cities, creating a network of mutual support and protection. When you request help, our community responds.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    "Help others and earn badges",
                    "Build real-world connections",
                    "Share experiences safely",
                    "Contribute to safety data"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <span className="text-neutral-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all transform hover:scale-105"
                >
                  Join the Community
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="relative animate-in fade-in slide-in-from-right-8 duration-700 delay-100">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl"></div>
                <div className="relative bg-neutral-900 border border-neutral-800 rounded-2xl p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-400">1M+</span>
                    <span className="text-sm text-neutral-400">Active Users</span>
                  </div>
                  <div className="h-px bg-neutral-800"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-purple-400">50K+</span>
                    <span className="text-sm text-neutral-400">Help Requests Matched</span>
                  </div>
                  <div className="h-px bg-neutral-800"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-400">99%</span>
                    <span className="text-sm text-neutral-400">Response Rate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section id="impact" className="py-20 px-4 sm:px-6 bg-gradient-to-b from-neutral-950 to-neutral-900">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Real Impact</h2>
              <p className="text-neutral-400 max-w-2xl mx-auto">Making a measurable difference in women's safety across India</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { number: "50+", label: "Cities Covered", icon: MapPin },
                { number: "1M+", label: "Women Protected", icon: Shield },
                { number: "50K+", label: "Help Requests", icon: Users },
                { number: "24/7", label: "Support Available", icon: Zap }
              ].map((item, i) => (
                <div
                  key={i}
                  className="relative p-6 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-all transform hover:scale-105 hover:-translate-y-1 duration-300 animate-in fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-xl opacity-0 hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <item.icon className="w-8 h-8 text-blue-500 mb-4" />
                    <div className="text-3xl font-bold mb-2">{item.number}</div>
                    <div className="text-neutral-400 text-sm">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4 sm:px-6 bg-neutral-950">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">Frequently Asked Questions</h2>

            <div className="space-y-4">
              {[
                {
                  q: "Is my location data secure?",
                  a: "Yes. We use end-to-end encryption and your location is never shared without your explicit consent."
                },
                {
                  q: "How does the help system work?",
                  a: "Request help with one tap, and nearby verified helpers in your area can offer assistance. Accept, chat, and coordinate in real-time."
                },
                {
                  q: "Can I use this offline?",
                  a: "The app works best with internet for real-time alerts, but core features are available offline."
                },
                {
                  q: "Is the platform completely free?",
                  a: "Yes, Sororine is 100% free and open-source. No premium features, no ads ever."
                }
              ].map((faq, i) => (
                <details
                  key={i}
                  className="group p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-all cursor-pointer animate-in fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <summary className="flex items-center justify-between font-semibold text-neutral-200 hover:text-white">
                    {faq.q}
                    <span className="text-blue-500 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-neutral-400 mt-4">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-y border-neutral-800">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Stay Safe?</h2>
            <p className="text-neutral-300 mb-8 max-w-2xl mx-auto">Join thousands of women who are already using Sororine to protect themselves and support their community.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-xl shadow-blue-600/50 flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl border border-neutral-700 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 border-t border-neutral-800 py-12 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-blue-500" />
                <span className="font-bold">Sororine</span>
              </div>
              <p className="text-neutral-400 text-sm">Your safety, our mission.</p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-neutral-400 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety Tips</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-neutral-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-neutral-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-8 text-center text-neutral-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Sororine - Women Safety Platform by Divyesh Kamalanaban. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// function FeatureCard({
//   icon,
//   title,
//   description,
//   delay = 0
// }: {
//   icon: React.ReactNode;
//   title: string;
//   description: string;
//   delay?: number;
// }) {
//   return (
//     <div
//       className="relative group p-6 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-blue-500/50 transition-all transform hover:scale-105 hover:-translate-y-2 duration-300 animate-in fade-in"
//       style={{ animationDelay: `${delay}ms` }}
//     >
//       <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
//       <div className="relative z-10">
//         <div className="w-12 h-12 rounded-lg bg-neutral-800 group-hover:bg-neutral-700 flex items-center justify-center mb-4 transition-colors">
//           {icon}
//         </div>
//         <h3 className="text-xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors">{title}</h3>
//         <p className="text-neutral-400 leading-relaxed group-hover:text-neutral-300 transition-colors">{description}</p>
//       </div>
//     </div>
//   );
// }

function FeatureCard({ icon, title, description, delay = 0 }: { icon: React.ReactNode, title: string, description: string, delay?: number }) {
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
