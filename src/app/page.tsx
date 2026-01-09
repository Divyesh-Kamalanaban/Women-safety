'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import ReportForm from '@/components/ReportForm';
import { Incident } from '@prisma/client';
import { RiskAnalysis } from '@/lib/risk';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Dynamic Import Map
const MapWrapper = dynamic(() => import('@/components/MapWrapper'), {
  ssr: false,
  loading: () => <p className="text-neutral-500">Loading Map...</p>
});

export default function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [riskData, setRiskData] = useState<{ analysis: RiskAnalysis, alerts: string[] } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<{ id: string, lat: number, lng: number }[]>([]);

  const [user, setUser] = useState<{ id: string, name: string | null, email: string } | null>(null);
  const router = useRouter();

  // Initialize Session
  useEffect(() => {
    // Check for logged in user
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('safety_user_id', data.user.sub); // Sync auth id to local session
        } else {
          // Guest mode
          let sessionId = localStorage.getItem('safety_user_id');
          if (!sessionId) {
            sessionId = crypto.randomUUID();
            localStorage.setItem('safety_user_id', sessionId);
          }
        }
      })
      .catch(err => console.error("Auth check failed", err));
  }, []);

  const fetchData = async () => {
    try {
      const [incRes, riskRes] = await Promise.all([
        fetch('/api/incidents'),
        fetch('/api/risk-data')
      ]);
      const incData = await incRes.json();
      const riskData = await riskRes.json();

      setIncidents(incData);
      setRiskData({ analysis: riskData, alerts: riskData.alerts });
    } catch (e) {
      console.error(e);
    }
  };

  // Location Tracking & Multi-User Polling
  useEffect(() => {
    if (!navigator.geolocation) return;

    // We use the ID from localStorage which is either the Auth ID (if logged in) or Random UUID (guest)
    const sessionId = localStorage.getItem('safety_user_id');

    // Watch Position
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        // Send Heartbeat
        if (sessionId) {
          try {
            await fetch('/api/users/location', {
              method: 'POST',
              body: JSON.stringify({ id: sessionId, lat: latitude, lng: longitude })
            });
          } catch (e) { console.error("Heartbeat failed", e); }
        }
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
        if (err.code === 1) {
          alert("Location permission denied.");
        }
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );

    // Poll Nearby Users
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/users/nearby');
        const users = await res.json();
        const currentId = localStorage.getItem('safety_user_id');
        setNearbyUsers(users.filter((u: any) => u.id !== currentId));
      } catch (e) { console.error("Poll failed", e); }
    }, 5000);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      clearInterval(interval);
    }
  }, [user]); // Re-run if user logs in to switch IDs

  useEffect(() => {
    fetchData();
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setShowReportForm(true);
  };

  const handleReportSuccess = () => {
    setShowReportForm(false);
    setSelectedLocation(null);
    fetchData();
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    localStorage.removeItem('safety_user_id'); // Clear auth ID
    // Reset to guest ID
    const newGuestId = crypto.randomUUID();
    localStorage.setItem('safety_user_id', newGuestId);
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="bg-neutral-900 text-white p-4 shadow-md flex justify-between items-center z-50">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="w-3 h-3 bg-primary rounded-full animate-pulse"></span>
            SafeCity Analytics
          </h1>
          <p className="text-xs text-slate-400">Women Safety Intelligence Platform</p>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold">{user.name || user.email}</div>
                <div className="text-xs text-emerald-400">● Live Protected</div>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-neutral-400 hover:text-white underline"
              >
                Logout
              </button>
              <button
                onClick={() => { setSelectedLocation(null); setShowReportForm(true); }}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-colors"
              >
                + Report
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <a href="/login" className="text-sm font-semibold hover:text-primary transition-colors">Login</a>
              <a href="/register" className="px-4 py-2 bg-secondary hover:bg-secondary-hover text-white rounded-lg text-sm font-semibold transition-colors">
                Join Now
              </a>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        {/* Map Area */}
        <div className="flex-1 relative z-0">
          <MapWrapper
            incidents={incidents}
            userLocation={userLocation}
            nearbyUsers={nearbyUsers}
            onMapClick={handleMapClick}
          />

          {/* Map Legend Overlay */}
          <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg text-xs z-[400] border border-neutral-200">
            <h4 className="font-bold mb-2">Safety Heatmap</h4>
            <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-primary/50"></span> High Risk Area</div>
            <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-accent/50"></span> Moderate Risk</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-secondary/50"></span> Safe Zone</div>
            <div className="mt-2 pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full border-2 border-white shadow-sm bg-blue-500"></span> You</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full border-2 border-white shadow-sm bg-emerald-500"></span> Nearby User</div>
            </div>
          </div>
        </div>

        {/* Sidebar Panel */}
        <div className="w-full md:w-96 bg-white border-l border-neutral-200 flex flex-col z-10 shadow-xl overflow-y-auto h-[40vh] md:h-auto transition-all duration-300">

          {/* Reporting Modal / Panel */}
          {showReportForm ? (
            <div className="p-6 bg-neutral-50 border-b border-neutral-200 min-h-full">
              <h2 className="text-lg font-bold mb-4">Report Safety Incident</h2>
              {!user && (
                <div className="mb-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg">
                  Tip: <Link href="/login" className="font-bold underline">Login</Link> to track your reports and get verified status.
                </div>
              )}
              <ReportForm
                selectedLocation={selectedLocation}
                onSuccess={handleReportSuccess}
                onCancel={() => setShowReportForm(false)}
              />
            </div>
          ) : (
            <div className="p-6">
              <h2 className="text-lg font-bold mb-4 text-neutral-800">Current Area Risk</h2>

              {/* Risk Score Card */}
              <div className={`p-4 rounded-xl text-white mb-6 shadow-sm transition-colors ${riskData?.analysis.level === 'CRITICAL' ? 'bg-red-600' :
                riskData?.analysis.level === 'HIGH' ? 'bg-orange-500' :
                  riskData?.analysis.level === 'MODERATE' ? 'bg-accent' : 'bg-secondary'
                }`}>
                <div className="text-xs font-bold opacity-90 uppercase tracking-wider">Risk Level</div>
                <div className="text-3xl font-bold mt-1">{riskData?.analysis.level || 'Loading...'}</div>
                <div className="text-xs opacity-75 mt-1 font-mono">Score: {riskData?.analysis.score.toFixed(0)} / 100</div>
              </div>

              {/* Alerts */}
              <h3 className="font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                Active Alerts
                <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold">{riskData?.alerts.length || 0}</span>
              </h3>
              <div className="space-y-3 mb-6">
                {riskData?.alerts.length === 0 && <p className="text-sm text-neutral-400 italic">No active alerts for this time.</p>}
                {riskData?.alerts.map((alert, i) => (
                  <div key={i} className="p-3 bg-red-50 border-l-4 border-red-500 text-sm text-neutral-700 rounded-r shadow-sm">
                    {alert}
                  </div>
                ))}
              </div>

              {/* Recent Feed */}
              <h3 className="font-semibold text-neutral-700 mb-3">Recent Reports</h3>
              <div className="space-y-3">
                {incidents.slice(0, 5).map(inc => (
                  <div key={inc.id} className="p-3 border border-neutral-200 rounded-lg bg-neutral-50 hover:bg-white transition-colors shadow-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-neutral-800">{inc.category}</span>
                      <span className="text-xs text-neutral-500 whitespace-nowrap">
                        {new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 line-clamp-2">{inc.description || "No description provided."}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
