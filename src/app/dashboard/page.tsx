"use client";

import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import GlobalFilters from '@/components/GlobalFilters';
import KPICard from '@/components/KPICard';
import AnalyticsWidget from '@/components/AnalyticsWidget';
import MapSearch from '@/components/MapSearch';
import Chat from '@/components/Chat';
import HelpModal from '@/components/HelpModal';
import OfferHelpModal from '@/components/OfferHelpModal';
import { ShieldAlert, Users, Activity, MapPin, HandHelping, Heart } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ReportIncidentModal from '@/components/ReportIncidentModal';
import IncidentDetailsModal from '@/components/IncidentDetailsModal';

// Dynamic import for Map to avoid SSR issues
const SafetyMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#050509] flex items-center justify-center text-gray-500">Loading Map...</div>
});

export default function Dashboard() {
  const router = useRouter();
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Help System State
  const [isHelpActive, setIsHelpActive] = useState(false);
  const [acceptedHelperId, setAcceptedHelperId] = useState<string | null>(null);
  const [activeChatPartner, setActiveChatPartner] = useState<{ id: string, name: string } | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isOfferHelpModalOpen, setIsOfferHelpModalOpen] = useState(false);
  const [pendingOffers, setPendingOffers] = useState<any[]>([]);

  // 1. Check Authentication on Mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          // Not authenticated
          setIsAuthenticated(false);
          router.push('/login');
          return;
        }
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  // 2. Get User Location & Identity on Mount
  useEffect(() => {
    if (!isAuthenticated) return;

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
        const myHelpRes = await fetch(`/api/users/help?id=${userId}`);
        if (myHelpRes.ok) {
          const data = await myHelpRes.json();
          setIsHelpActive(data.active);
        }

        // E. If Help is Active, Check for Accepted Offers
        if (isHelpActive) {
          const offersRes = await fetch(`/api/users/help/offer?requesterId=${userId}`);
          if (offersRes.ok) {
            const data = await offersRes.json();
            const acceptedOffers = data.offers.filter((o: any) => o.status === 'ACCEPTED');
            
            if (acceptedOffers.length > 0 && !activeChatPartner) {
              const helper = acceptedOffers[0].helper;
              setAcceptedHelperId(acceptedOffers[0].helperId);
              setActiveChatPartner({
                id: acceptedOffers[0].helperId,
                name: `Helper #${acceptedOffers[0].helperId.slice(0, 8)}`
              });
            }
          }
        }

        // F. If User is Potentially a Helper, Get Their Pending Offers (to help others)
        const myOffersRes = await fetch(`/api/users/help/my-offers?id=${userId}`);
        if (myOffersRes.ok) {
          const data = await myOffersRes.json();
          setPendingOffers(data.offers || []);
        }
      }

    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  }, [userLocation, userId, isHelpActive, activeChatPartner]);

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
        setAcceptedHelperId(null);
      } else {
        // Open help modal when help is requested
        setIsHelpModalOpen(true);
      }
    } catch (e) {
      console.error("Failed to toggle help", e);
      setIsHelpActive(!newStatus); // Revert
    }
  };

  const handleOfferHelp = async (targetUserId: string) => {
    if (!userId) return;
    try {
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
        console.log("Help offer sent successfully");
        return true;
      } else {
        const error = await res.json();
        console.error("Failed to send help offer:", error.error);
        return false;
      }
    } catch (e) {
      console.error("Error offering help:", e);
      return false;
    }
  };

  const handleAcceptOffer = (offerId: string) => {
    // The help modal will handle opening the chat
    // This is called when an offer is accepted
    console.log("Offer accepted:", offerId);
    setIsHelpModalOpen(false);
    fetchData(); // Refresh to get the accepted offer
  };

  const handleRejectOffer = (offerId: string) => {
    console.log("Offer rejected:", offerId);
    fetchData(); // Refresh the list
  };


  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen bg-[#050509] text-white items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
          <p className="text-neutral-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render (redirect is in progress)
  if (!isAuthenticated) {
    return null;
  }

  return (
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

          {/* Offer Help Button (for helpers) */}
          {!isHelpActive && nearbyUsers.some(u => u.isHelpRequested) && (
            <button
              onClick={() => setIsOfferHelpModalOpen(true)}
              className="absolute bottom-24 right-6 z-50 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full shadow-2xl font-bold flex items-center gap-2 transition-all animate-pulse shadow-green-600/50"
            >
              <Heart size={20} />
              Help Someone
            </button>
          )}

          {/* Help Modal */}
          {userId && (
            <HelpModal
              userId={userId}
              isOpen={isHelpModalOpen}
              onClose={() => setIsHelpModalOpen(false)}
              onAcceptOffer={handleAcceptOffer}
              onRejectOffer={handleRejectOffer}
            />
          )}

          {/* Offer Help Modal */}
          {userId && (
            <OfferHelpModal
              userId={userId}
              isOpen={isOfferHelpModalOpen}
              onClose={() => setIsOfferHelpModalOpen(false)}
              nearbyUsers={nearbyUsers}
              onOfferHelp={handleOfferHelp}
            />
          )}

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
    </div>
  );
}
