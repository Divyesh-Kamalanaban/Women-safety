<<<<<<< HEAD
"use client";

import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import GlobalFilters from '@/components/GlobalFilters';
import KPICard from '@/components/KPICard';
import AnalyticsWidget from '@/components/AnalyticsWidget';
import MapSearch from '@/components/MapSearch';
import Chat from '@/components/Chat';
import { ShieldAlert, Users, Activity, MapPin, HandHelping } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import ReportIncidentModal from '@/components/ReportIncidentModal';
import IncidentDetailsModal from '@/components/IncidentDetailsModal';

// Dynamic import for Map to avoid SSR issues
const SafetyMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#050509] flex items-center justify-center text-gray-500">Loading Map...</div>
});

export default function Dashboard() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [currentRisk, setCurrentRisk] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);

  // Location & Users
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null); // My User ID

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);

  // Help System State
  const [isHelpActive, setIsHelpActive] = useState(false);
  const [acceptedHelperId, setAcceptedHelperId] = useState<string | null>(null);
  const [activeChatPartner, setActiveChatPartner] = useState<{ id: string, name: string } | null>(null);

  // 1. Get User Location & Identity on Mount
  useEffect(() => {
    // Check for existing session ID or generate one
    let storedId = localStorage.getItem('sororine_user_id');
    if (!storedId) {
      storedId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sororine_user_id', storedId);
    }
    setUserId(storedId);

    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(loc);
          // Update location on server
          if (storedId) {
            fetch('/api/users/location', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: storedId, ...loc })
            }).catch(console.error);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback to Delhi
          setUserLocation({ lat: 28.6139, lng: 77.2090 });
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000 }
      );
    } else {
      setUserLocation({ lat: 28.6139, lng: 77.2090 });
    }
  }, []);

  // 2. Fetch Data (Polled)
  const fetchData = useCallback(async () => {
    if (!userLocation) return;

    try {
      // A. Incidents
      const incidentsRes = await fetch('/api/incidents?limit=100');
      if (incidentsRes.ok) {
        const data = await incidentsRes.json();
        const parsedIncidents = data.map((inc: any) => ({
          ...inc,
          timestamp: new Date(inc.timestamp),
          createdAt: new Date(inc.createdAt)
        }));
        setIncidents(parsedIncidents);
      }

      // B. Risk Data
      const riskRes = await fetch(`/api/risk-data?lat=${userLocation.lat}&lng=${userLocation.lng}`);
      if (riskRes.ok) {
        const riskData = await riskRes.json();
        setCurrentRisk(riskData);

        const dist = riskData.factors.timeDistribution;
        const chartData = [
          { name: 'Morning', alerts: dist.morning || 0 },
          { name: 'Afternoon', alerts: dist.afternoon || 0 },
          { name: 'Evening', alerts: dist.evening || 0 },
          { name: 'Night', alerts: dist.night || 0 },
        ];
        setAnalyticsData(chartData);
      }

      // C. Nearby Users
      if (userId) {
        const usersRes = await fetch('/api/users/nearby', {
          headers: { 'x-user-id': userId }
        });
        if (usersRes.ok) {
          const users = await usersRes.json();
          setNearbyUsers(users);
        }

        // D. Help Status (Offers & My Request)
        // Check if I have help requested
        const myHelpRes = await fetch(`/api/users/help?id=${userId}`);
        if (myHelpRes.ok) {
          const data = await myHelpRes.json();
          setIsHelpActive(data.active);
        }

        // If I requested help, check for accepted offers to start chat
        if (isHelpActive) {
          // In a real app we'd poll for 'ACCEPTED' offers. 
          // For now, let's assume if we are active, we look for offers.
          // We can re-use the nearby users logic or a specific endpoint.
          // Simplified: If I have an accepted offer, set chat partner.
          // (This part requires a specific 'my-offers' endpoint or extending existing ones.
          //  For now, we'll demonstrate the "Offer Help" flow more fully).
        }

        // Check if *I* have offered help and it was accepted
        // (This would be another poll. For simplicity, we'll trust the flow)
      }

    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  }, [userLocation, userId, isHelpActive]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [fetchData]);


  // Handlers
  const toggleHelp = async () => {
    if (!userId) return;
    const newStatus = !isHelpActive;
    setIsHelpActive(newStatus);

    try {
      await fetch('/api/users/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, active: newStatus })
      });

      if (!newStatus) {
        // Reset chat if help ended
        setActiveChatPartner(null);
      }
    } catch (e) {
      console.error("Failed to toggle help", e);
      setIsHelpActive(!newStatus); // Revert
    }
  };

  const handleOfferHelp = async (targetUserId: string) => {
    if (!userId) return;
    try {
      // Send Offer
      const res = await fetch('/api/users/help/offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'OFFER',
          requesterId: targetUserId,
          helperId: userId
        })
      });

      if (res.ok) {
        alert("Help offer sent! Waiting for them to accept...");
        // In a real app, we would wait for a "notification" or poll for acceptance state.
        // Simulating acceptance for demo if needed, or just waiting.
        // For now, we will open chat optimistically or wait for the other user (if we could act as them).
        // Since we are one user, we can't easily "accept" our own offer to another dummy user.
        // But if we use two browsers, this works.
        // To enable Chat on the HELPER side, we need to know if status is ACCEPTED.
        // We'll add a poller for that or just open chat for demo purposes?
        // Let's stick to reality: Helper waits.
      }
    } catch (e) {
      console.error(e);
    }
  };

  // This would be triggered if we detect our offer was accepted
  // setActiveChatPartner({ id: targetUserId, name: "Person in Distress" });

=======
import Link from 'next/link';
import { Shield, Lock, MapPin, Bell } from 'lucide-react';
>>>>>>> 97bf6a1f067a8d455a4e98836353c862f0697872

export default function LandingPage() {
  return (
<<<<<<< HEAD
    <div className="flex h-screen bg-[#050509] text-white overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col relative ml-0 md:pl-16 transition-all duration-300 w-full">
        {/* Dashboard Content */}
        <div className="flex-1 relative z-0 w-full h-full overflow-hidden flex flex-col">
          {/* Map Background (Absolute) */}
          <div className="absolute inset-0 z-0">
            {userLocation && (
              <SafetyMap
                incidents={incidents}
                userLocation={userLocation}
                nearbyUsers={nearbyUsers}
                onOfferHelp={handleOfferHelp}
                onMapClick={() => { }}
              />
            )}
          </div>
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#050509]/80 via-transparent to-[#050509]/80 z-0"></div>

          {/* Top UI Container (Relative to sit on top of map, respecting sidebar padding) */}
          <div className="relative z-10 p-6 flex flex-col md:flex-row justify-between items-start gap-4 pointer-events-none w-full">

            {/* Left: KPIs */}
            <div className="pointer-events-auto flex flex-col gap-3 w-full md:w-auto md:min-w-[280px] animate-in slide-in-from-left-4 duration-500">
              {/* Header mobile only */}
              {/* Header mobile only */}
              <div className="md:hidden flex justify-center items-center mb-4 w-full relative">
                <span className="font-bold text-xl tracking-wider text-white">
                  SOROR<span className="text-primary">INE</span>
                </span>
                {/* Visual balance spacer if needed, or absolute positioning */}
              </div>

              {currentRisk && (
                <div className="flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0 no-scrollbar">
                  <div className="min-w-[200px] md:min-w-0">
                    <KPICard
                      title="Risk Level"
                      value={currentRisk.level}
                      color={
                        currentRisk.level === 'CRITICAL' ? 'text-red-500' :
                          currentRisk.level === 'HIGH' ? 'text-orange-500' :
                            'text-emerald-500'
                      }
                      change={`${currentRisk.score.toFixed(1)}`}
                      changeType={currentRisk.score > 50 ? "negative" : "positive"}
                      icon={ShieldAlert}
                    />
                  </div>
                  <div className="min-w-[200px] md:min-w-0">
                    <KPICard
                      title="Active Alerts"
                      value={currentRisk.factors.recentIncidents.toString()}
                      change="24h"
                      changeType="neutral"
                      icon={Activity}
                      color="text-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right: Search & Report */}
            <div className="pointer-events-auto flex flex-col items-end gap-3 w-full md:w-auto">
              <div className="w-full md:w-80 shadow-2xl">
                <MapSearch onLocationSelect={(lat, lng) => setUserLocation({ lat, lng })} />
              </div>
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute top-20 right-6 z-50 bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-md">
              Fetching live updates...
            </div>
          )}

          {/* Analytics */}
          <div className="hidden md:block absolute bottom-6 right-6 z-10 w-96 h-64 animate-in slide-in-from-right-4 duration-500 delay-200">
            <AnalyticsWidget data={analyticsData} />
          </div>

          {/* Help Button (Primary Action) */}
          <button
            onClick={toggleHelp}
            className={`absolute bottom-24 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-full shadow-2xl font-bold flex items-center gap-3 transition-all hover:scale-105 ${isHelpActive
              ? "bg-white text-red-600 animate-pulse shadow-red-600/50"
              : "bg-red-600 text-white hover:bg-red-700 shadow-red-600/30"
              }`}
          >
            <HandHelping size={24} />
            {isHelpActive ? "CANCEL HELP REQUEST" : "REQUEST HELP"}
          </button>

          {/* Report Button (Secondary) */}
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-full shadow-lg font-medium flex items-center gap-2 text-sm transition-transform hover:scale-105"
          >
            <ShieldAlert size={16} /> Report Incident
          </button>

          {/* Recent Activity */}
          <div className="hidden md:block absolute bottom-6 left-6 z-10 w-80 glass-card rounded-2xl p-4 animate-in slide-in-from-bottom-4 duration-500 delay-100">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Activity size={16} className="text-primary" /> Recent Activity
            </h3>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {incidents.length > 0 ? (
                incidents.slice(0, 10).map((incident) => (
                  <div
                    key={incident.id}
                    onClick={() => setSelectedIncident(incident)}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-xs border-b border-white/5 last:border-0 cursor-pointer"
                  >
                    <div className="p-1.5 rounded-full bg-red-500/10 text-red-500 mt-0.5">
                      <MapPin size={12} />
                    </div>
                    <div>
                      <p className="font-medium text-white">{incident.category}</p>
                      <p className="text-gray-500 mt-0.5 truncate w-40">{incident.location || incident.description}</p>
                      <p className="text-gray-600 mt-1 text-[10px]">{new Date(incident.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4 text-xs">No recent incidents found.</div>
              )}
            </div>
          </div>

          {/* Report Modal */}
          <ReportIncidentModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            currentLocation={userLocation}
            onSuccess={fetchData}
          />

          {/* Incident Details Modal */}
          <IncidentDetailsModal
            incident={selectedIncident}
            onClose={() => setSelectedIncident(null)}
            onDelete={() => {
              setSelectedIncident(null);
              fetchData();
            }}
          />

          {/* Active Chat */}
          {activeChatPartner && userId && (
            <Chat
              myId={userId}
              partnerId={activeChatPartner.id}
              partnerName={activeChatPartner.name}
              onClose={() => setActiveChatPartner(null)}
            />
          )}

        </div>
      </main>
=======
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
            <Link href="/register" className="px-5 py-2.5 bg-white text-neutral-900 text-sm font-bold rounded-full hover:bg-neutral-200 transition-colors">
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
              <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg shadow-primary/25">
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
>>>>>>> 97bf6a1f067a8d455a4e98836353c862f0697872
    </div>
  );
}
