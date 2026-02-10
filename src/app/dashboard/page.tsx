'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import ReportForm from '@/components/ReportForm';
import Chat from '@/components/Chat';
import { Incident } from '@prisma/client';
import { RiskAnalysis } from '@/lib/risk';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Dynamic Import Map
const MapWrapper = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <p className="text-neutral-500">Loading Map...</p>
});

// Help Offer Type
interface HelpOffer {
  id: string;
  requesterId: string;
  helperId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  helper: { lat: number, lng: number };
}

export default function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [riskData, setRiskData] = useState<{ analysis: RiskAnalysis, alerts: string[] } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<{ id: string, lat: number, lng: number, isHelpRequested?: boolean, isAuthorized?: boolean }[]>([]);

  const [user, setUser] = useState<{ id: string, name: string | null, email: string, emergencyContactNumber?: string } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(true);

  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [isHelpActive, setIsHelpActive] = useState(false);
  const [incomingOffers, setIncomingOffers] = useState<HelpOffer[]>([]);
  const [selectedChatPartner, setSelectedChatPartner] = useState<{ id: string, name: string } | null>(null);
  const router = useRouter();

  // Check notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        setAlertsEnabled(true);
      }
    }
  }, []);

  const handleEnableAlerts = () => {
    if (!('Notification' in window)) {
      alert("This browser does not support desktop notifications");
      return;
    }
    Notification.requestPermission().then(perm => {
      if (perm === 'granted') {
        setAlertsEnabled(true);
        new Notification("Sororine Alerts Enabled", { body: "You will receive alerts for high-risk areas." });
      }
    });
  };

  const handleRequestHelp = async () => {
    if (!user) {
      alert("Please login to request help.");
      router.push('/login');
      return;
    }

    // Toggle help
    const newStatus = !isHelpActive;
    setIsHelpActive(newStatus);

    try {
      // We use the same ID we track location with (safety_user_id) if it maps to a record
      const sessionId = localStorage.getItem('safety_user_id');
      await fetch('/api/users/help', {
        method: 'POST',
        body: JSON.stringify({ id: sessionId, active: newStatus })
      });

      if (newStatus) {
        alert("Help Request Broadcasted to nearby users!");
      } else {
        alert("Help Request Cancelled.");
        setIncomingOffers([]); // Clear UI
        setSelectedChatPartner(null); // Close active chat
      }
    } catch (e) {
      console.error("Failed to toggle help", e);
      setIsHelpActive(!newStatus); // revert
    }
  };

  // Initialize Session
  useEffect(() => {
    // Check for logged in user
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          // Sync Device ID with Real User ID to prevent identity leaks
          const currentDeviceId = localStorage.getItem('safety_user_id');
          if (currentDeviceId !== data.user.id) {
            console.log("Switching identity to logged-in user");
            localStorage.setItem('safety_user_id', data.user.id);
            setIncomingOffers([]);
            setSelectedChatPartner(null);
            setIsHelpActive(false);
          }

          // Force Clean Slate on Reload logic for Logged In User too
          // (If they refreshed mid-session, we want to close it or sync it, user preferred closing)
          /* 
             Actually, we already sync safety_user_id. 
             If we want to force-close active sessions on reload for logged-in users too: 
          */
          fetch('/api/users/help', {
            method: 'POST',
            body: JSON.stringify({ id: data.user.id, active: false })
          }).catch(console.error);

        } else {
          // No user -> Redirect to Login (Mandatory)
          router.push('/login');
        }
      })
      .catch(err => {
        console.error("Auth check failed", err);
        router.push('/login');
      });
  }, []);

  const fetchData = async (lat: number, lng: number) => {
    try {
      const [incRes, riskRes] = await Promise.all([
        fetch(`/api/incidents?lat=${lat}&lng=${lng}`),
        fetch(`/api/risk-data?lat=${lat}&lng=${lng}`)
      ]);
      const incData = await incRes.json();
      const riskData = await riskRes.json();

      if (Array.isArray(incData)) {
        setIncidents(incData);
      } else {
        console.warn("Incidents API returned non-array:", incData);
        setIncidents([]);
      }
      setRiskData({ analysis: riskData, alerts: riskData.alerts });
    } catch (e) {
      console.error(e);
      setIncidents([]); // Fallback
    }
  };

  // Location Tracking & Strict Enforcement
  useEffect(() => {
    // 1. Try to recover last known location immediately to show something
    const savedLoc = localStorage.getItem('last_known_loc');
    if (savedLoc) {
      const { lat, lng } = JSON.parse(savedLoc);
      setUserLocation({ lat, lng });
      fetchData(lat, lng);
      setLoadingLocation(false);
    }

    if (!navigator.geolocation) {
      setLocationDenied(true);
      setLoadingLocation(false);
      return;
    }

    const sessionId = localStorage.getItem('safety_user_id');

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        // If this is the first fresh lock or moved significantly (e.g. > 10m), update data
        setUserLocation(prev => {
          if (!prev) return { lat: latitude, lng: longitude };
          const dist = Math.sqrt(Math.pow(latitude - prev.lat, 2) + Math.pow(longitude - prev.lng, 2));
          // Rough deg to meter: 1 deg ~ 111km. 0.0001 ~ 11m
          if (dist > 0.0001) {
            return { lat: latitude, lng: longitude };
          }
          return prev;
        });

        // Save for reload
        localStorage.setItem('last_known_loc', JSON.stringify({ lat: latitude, lng: longitude }));

        // If we were loading or denied, clear it
        setLoadingLocation(false);
        setLocationDenied(false);

        // Refresh data with new location (optimally debounce this in real app)
        // For this demo, we'll just re-fetch occasionally or relying on the initial fetch if it was successful.
        // Let's re-fetch if we moved significantly? For simplicity, let's just fetch once on first lock or if we didn't have saved data.
        // Actually, let's just call fetchData here to keep it "Live" for the user's area.
        // To avoid spamming, strict debouncing is better, but watchPosition might fire often.
        // Let's simple check distance or just run it. We will assume the API usage is low.
        fetchData(latitude, longitude);

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
        if (err.code === 1) { // PERMISSION_DENIED
          // Only block if we don't have a fallback
          if (!localStorage.getItem('last_known_loc')) {
            setLocationDenied(true);
          }
        }
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );

    const interval = setInterval(async () => {
      try {
        const currentId = localStorage.getItem('safety_user_id');
        const res = await fetch('/api/users/nearby', {
          headers: {
            'x-user-id': currentId || ''
          }
        });
        const users = await res.json();

        if (Array.isArray(users)) {
          // Double protection: Client-side filter
          const filtered = users.filter((u: any) => u.id !== currentId && u.id !== user?.id);
          setNearbyUsers(filtered);
        } else {
          console.warn("Nearby users API returned non-array:", users);
        }
      } catch (e) { console.error("Poll failed", e); }
    }, 2000); // 2s polling

    return () => {
      navigator.geolocation.clearWatch(watchId);
      clearInterval(interval);
    }
  }, []); // Note: 'user' dependency might be missing here if checking user.id!

  // Auto-close chat for Helper if partner cancels help (disappears from nearby valid list)
  useEffect(() => {
    if (selectedChatPartner && !isHelpActive) {
      // Logic for Helper: If I am chatting with someone, and they are NOT in my authorized list anymore, close it.
      // However, we need to be careful not to close it for the Requester!
      // The Requester has 'isHelpActive' = true. The Helper has 'isHelpActive' = false (usually).

      const partnerIsNeedy = nearbyUsers.find(u => u.id === selectedChatPartner.id);

      // If I am a Helper (isHelpActive=false for me)
      // And the partner I am chatting with is no longer authorized (help ended)
      if (partnerIsNeedy && !partnerIsNeedy.isAuthorized) {
        setSelectedChatPartner(null);
        alert("The help session has ended.");
      }
      // If they disappeared from map entirely, also close
      if (!partnerIsNeedy && nearbyUsers.length > 0) {
        // Only close if we have actual data (length > 0) to avoid closing on initial load
        // But actually, we might want to wait a bit. 
        // For now, strict closing is safer for privacy.
        // setSelectedChatPartner(null); 
      }
    }
  }, [nearbyUsers, selectedChatPartner, isHelpActive]);

  // Polling for Incoming Help Offers
  useEffect(() => {
    if (!isHelpActive) return;

    const offerInterval = setInterval(async () => {
      const myId = localStorage.getItem('safety_user_id');
      if (!myId) return;

      console.log("DEBUG: Polling for offers for RequesterID:", myId);

      try {
        const res = await fetch(`/api/users/help/offer?requesterId=${myId}`);
        const data = await res.json();
        console.log("DEBUG: Offers response:", data);

        if (data.offers) {
          setIncomingOffers(data.offers);
        }
      } catch (e) { console.error("Error fetching offers", e); }
    }, 3000);

    return () => clearInterval(offerInterval);
  }, [isHelpActive]);

  // Warn before reload if help is active
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isHelpActive) {
        e.preventDefault();
        e.returnValue = ''; // Chrome requires this
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isHelpActive]);

  if (loadingLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold">Locating You...</h2>
          <p className="text-neutral-400 mt-2">We need your location to provide safety alerts.</p>
        </div>
      </div>
    );
  }

  if (locationDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white p-6">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 12H16c-.7 2-2 3-4 3s-3.3-1-4-3H2.5" /><path d="M5.5 5.1L2 12v6c0 1.1.9 2 2 2h16a2 2 0 002-2v-6l-3.5-6.9A2 2 0 0016.8 4H7.2a2 2 0 00-1.8 1.1z" /></svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Location Access Required</h2>
          <p className="text-neutral-300 mb-8">
            This app relies on real-time location data to warn you about safety risks in your immediate area.
            Without location access, the safety features cannot function.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold transition-colors w-full"
          >
            I've Enabled Location, Try Again
          </button>
        </div>
      </div>
    );
  }



  const handleOfferHelp = async (targetUserId: string) => {
    console.log("Attempting to offer help to:", targetUserId);
    const myId = localStorage.getItem('safety_user_id');
    if (targetUserId === myId) {
      alert("You cannot offer help to yourself.");
      return;
    }
    // Force sync own location first to ensure record exists (Fixes Foreign Key Error)
    if (userLocation) {
      try {
        await fetch('/api/users/location', {
          method: 'POST',
          body: JSON.stringify({ id: myId, lat: userLocation.lat, lng: userLocation.lng })
        });
      } catch (e) {
        console.error("Failed to sync location before offer", e);
      }
    } else {
      alert("We need your location to offer help. Please enable GPS.");
      return;
    }

    try {
      const res = await fetch('/api/users/help/offer', {
        method: 'POST',
        body: JSON.stringify({
          action: 'OFFER',
          requesterId: targetUserId,
          helperId: myId
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Help Offer Sent! Waiting for them to accept.");
      } else {
        alert("Failed to send offer: " + (data.error || "Unknown error"));
      }
    } catch (e) { alert("Error sending offer"); }
  };

  const handleAcceptHelp = async (offerId: string) => {
    try {
      const offer = incomingOffers.find(o => o.id === offerId);

      const res = await fetch('/api/users/help/offer', {
        method: 'POST',
        body: JSON.stringify({
          action: 'ACCEPT',
          offerId: offerId
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Help Accepted! Location sharing enabled with this helper.");

        // Auto-open chat
        if (offer) {
          setSelectedChatPartner({ id: offer.helperId, name: 'Helper' });
        }

        // Immediately fetch updated offers to show the "My Helpers" list
        const myId = localStorage.getItem('safety_user_id');
        if (myId) {
          fetch(`/api/users/help/offer?requesterId=${myId}`)
            .then(r => r.json())
            .then(d => { if (d.offers) setIncomingOffers(d.offers); });
        }
      }
    } catch (e) { alert("Error accepting offer"); }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setShowReportForm(true);
  };

  const handleReportSuccess = () => {
    setShowReportForm(false);
    setSelectedLocation(null);
    if (userLocation) {
      fetchData(userLocation.lat, userLocation.lng);
    }
  };

  const handleLogout = async () => {
    // If help is active, force end it to clean up DB (offers, auth)
    if (isHelpActive) {
      try {
        const sessionId = localStorage.getItem('safety_user_id');
        await fetch('/api/users/help', {
          method: 'POST',
          body: JSON.stringify({ id: sessionId, active: false })
        });
      } catch (e) { console.error("Logout cleanup failed", e); }
    }

    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setIsHelpActive(false);
    setIncomingOffers([]);
    setSelectedChatPartner(null);
    localStorage.removeItem('safety_user_id'); // Clear auth ID
    localStorage.removeItem('last_known_loc'); // Clear cached location
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
            Sororine Analytics
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

      {/* Strict Profile Completion Modal */}
      {user && !user.emergencyContactNumber && (
        <div className="fixed inset-0 bg-neutral-900/90 z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900">Mandatory Safety Update</h2>
              <p className="text-neutral-500 mt-2">
                To ensure your safety, we now require verified emergency contact details. You cannot use the app until this is completed.
              </p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const phone = formData.get('phone') as string;
                const emName = formData.get('emName') as string;
                const emPhone = formData.get('emPhone') as string;

                // Validation
                const phoneRegex = /^\+?[1-9]\d{1,14}$/;
                if (!phoneRegex.test(phone)) {
                  alert("Invalid user phone number. Use format: +919876543210");
                  return;
                }
                if (!phoneRegex.test(emPhone)) {
                  alert("Invalid emergency contact number. Use format: +919876543210");
                  return;
                }
                if (phone === emPhone) {
                  alert("Your phone number and emergency contact number cannot be the same.");
                  return;
                }

                try {
                  const res = await fetch('/api/users/update', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      id: user.id,
                      phoneNumber: phone,
                      emergencyContactName: emName,
                      emergencyContactNumber: emPhone
                    })
                  });

                  const data = await res.json();

                  if (res.ok) {
                    window.location.reload();
                  } else {
                    alert(data.error || "Update failed. Please try again.");
                  }
                } catch (err) {
                  console.error(err);
                  alert("Error updating profile.");
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">Your Phone Number</label>
                <input name="phone" type="tel" required placeholder="+91..." className="w-full p-3 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">Emergency Contact Name</label>
                <input name="emName" type="text" required placeholder="Parent/Guardian" className="w-full p-3 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">Emergency Contact Number</label>
                <input name="emPhone" type="tel" required placeholder="+91..." className="w-full p-3 border rounded-lg" />
              </div>
              <button type="submit" className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg">
                Save & Continue
              </button>
            </form>
          </div>
        </div>
      )}


      <main className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        {/* Map Area */}
        <div className="flex-1 relative z-0">
          <MapWrapper
            incidents={incidents}
            userLocation={userLocation}
            nearbyUsers={nearbyUsers}
            onMapClick={handleMapClick}
            onOfferHelp={handleOfferHelp}
          />



          // ... (rest of the file)

          {/* Map Legend Overlay */}
          <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg text-xs z-[400] border border-neutral-200 pointer-events-auto">
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
        <div className="w-full md:w-96 bg-white border-l border-neutral-200 flex flex-col z-10 shadow-xl overflow-y-auto h-[45vh] md:h-auto transition-all duration-300 md:border-l-0 md:border-l border-t md:border-t-0">

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
              <div className={`p-4 rounded-xl text-white mb-6 shadow-sm transition-colors ${!riskData ? 'bg-neutral-400' :
                riskData.analysis.level === 'CRITICAL' ? 'bg-red-600' :
                  riskData.analysis.level === 'HIGH' ? 'bg-orange-500' :
                    riskData.analysis.level === 'MODERATE' ? 'bg-accent' : 'bg-secondary'
                }`}>
                <div className="text-xs font-bold opacity-90 uppercase tracking-wider">Risk Level</div>
                <div className="text-3xl font-bold mt-1">{riskData?.analysis.level || 'Loading...'}</div>
                <div className="text-xs opacity-75 mt-1 font-mono">
                  Score: {riskData?.analysis.score ? riskData.analysis.score.toFixed(0) : '0'} / 100
                </div>
              </div>

              {/* Emergency Actions */}
              <div className="mb-6 grid grid-cols-1 gap-3">
                {(riskData?.analysis.level === 'HIGH' || riskData?.analysis.level === 'CRITICAL') && (
                  <button
                    onClick={() => {
                      if (user?.emergencyContactNumber) {
                        window.open(`tel:${user.emergencyContactNumber}`);
                      } else {
                        alert('No emergency contact saved. Please update your profile.');
                      }
                    }}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 animate-pulse"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    SOS: Call Emergency Contact
                  </button>
                )}

                <button
                  onClick={handleRequestHelp}
                  className={`w-full py-3 rounded-xl font-bold text-lg shadow-md flex items-center justify-center gap-2 transition-all ${isHelpActive
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-white border-2 border-amber-500 text-amber-600 hover:bg-amber-50'
                    }`}
                >
                  {isHelpActive ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      I'M SAFE (END HELP)
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                      REQUEST NEARBY HELP
                    </>
                  )}
                </button>
              </div>

              {/* Incoming Help Offers */}
              {incomingOffers.length > 0 && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3 animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="font-bold text-blue-800 flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                    Incoming Help! ({incomingOffers.length})
                  </h3>
                  {incomingOffers.map(offer => (
                    <div key={offer.id} className="bg-white p-3 rounded-lg shadow-sm border border-blue-100 flex justify-between items-center">
                      <div className="text-sm">
                        <div className="font-semibold text-neutral-800">Nearby Helper</div>
                        <div className="text-xs text-neutral-500">~{((Math.abs(offer.helper.lat - (userLocation?.lat || 0)) + Math.abs(offer.helper.lng - (userLocation?.lng || 0))) * 111).toFixed(1)} km away</div>
                      </div>
                      {offer.status === 'ACCEPTED' ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 font-bold text-xs rounded-full">Coming</span>
                      ) : (
                        <button
                          onClick={() => handleAcceptHelp(offer.id)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-sm"
                        >
                          Accept
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}


              {/* Accepted Helpers List (For Requester) */}
              {incomingOffers.some(o => o.status === 'ACCEPTED') && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl space-y-3">
                  <h3 className="font-bold text-green-800">My Helpers</h3>
                  {incomingOffers.filter(o => o.status === 'ACCEPTED').map(offer => (
                    <div key={offer.id} className="bg-white p-3 rounded-lg shadow-sm border border-green-100 flex justify-between items-center">
                      <div className="text-sm">
                        <div className="font-semibold text-neutral-800">Safety Helper</div>
                        <div className="text-xs text-neutral-500">Arriving...</div>
                      </div>
                      <button
                        onClick={() => setSelectedChatPartner({ id: offer.helperId, name: 'Safety Helper' })}
                        className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 shadow-sm flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        Chat
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Active Missions List (For Helper) */}
              {nearbyUsers.some(u => u.isAuthorized) && (
                <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-3">
                  <h3 className="font-bold text-indigo-800">People You Are Helping</h3>
                  {nearbyUsers.filter(u => u.isAuthorized).map(u => (
                    <div key={u.id} className="bg-white p-3 rounded-lg shadow-sm border border-indigo-100 flex justify-between items-center">
                      <div className="text-sm">
                        <div className="font-semibold text-neutral-800">Person in Need</div>
                        <div className="text-xs text-neutral-500">Location Revealed</div>
                      </div>
                      <button
                        onClick={() => setSelectedChatPartner({ id: u.id, name: 'Person in Need' })}
                        className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 shadow-sm flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        Chat
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Alerts */}
              <h3 className="font-semibold text-neutral-700 mb-3 flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  Active Alerts
                  <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold">
                    {riskData?.alerts?.length || 0}
                  </span>
                </div>
                {alertsEnabled ? (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Enabled
                  </span>
                ) : (
                  <button
                    onClick={handleEnableAlerts}
                    className="text-xs bg-white border border-primary text-primary hover:bg-primary hover:text-white px-3 py-1 rounded-md font-semibold transition-all shadow-sm active:scale-95"
                  >
                    Enable Alerts
                  </button>
                )}
              </h3>
              <div className="space-y-3 mb-6">
                {(!riskData || riskData.alerts?.length === 0) && (
                  <p className="text-sm text-neutral-400 italic">No active alerts for this time.</p>
                )}
                {riskData?.alerts?.map((alert, i) => (
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

      {/* Chat Integration */}
      {(() => {
        const myId = typeof window !== 'undefined' ? localStorage.getItem('safety_user_id') : null;

        if (selectedChatPartner && myId) {
          return (
            <Chat
              myId={myId}
              partnerId={selectedChatPartner.id}
              partnerName={selectedChatPartner.name}
              onClose={() => setSelectedChatPartner(null)}
            />
          );
        }
        return null;
      })()}

    </div>
  );
}
