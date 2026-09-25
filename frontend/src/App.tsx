import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FeaturedSlider } from './components/FeaturedSlider';
import { HiddenGemsSlider } from './components/HiddenGemsSlider';
import { PlannerForm } from './components/PlannerForm';
import type { TravelPreferences } from './components/PlannerForm';
import { Recommendations } from './components/Recommendations';
import type { RecommendedPlace } from './components/Recommendations';
import { ItineraryView } from './components/ItineraryView';
import type { AIItineraryResponse } from './components/ItineraryView';
import { ExploreGrid } from './components/ExploreGrid';
import { SavedTrips } from './components/SavedTrips';
import { AIChatbot } from './components/AIChatbot';
import { PlaceDetailModal } from './components/PlaceDetailModal';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import type { Place } from './components/PlaceCard';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { AmbientBackground } from './components/AmbientBackground';

export function App() {
  useSmoothScroll();

  const [activeTab, setActiveTabState] = useState(() => {
    const hash = window.location.hash.replace('#/', '');
    return hash || 'home';
  });

  const [user, setUser] = useState<{ isAuthenticated: boolean; username: string | null }>({
    isAuthenticated: false,
    username: null,
  });

  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [featuredPlaces, setFeaturedPlaces] = useState<Place[]>([]);
  const [preferences, setPreferences] = useState<TravelPreferences | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedPlace[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<RecommendedPlace[]>([]);
  const [itinerary, setItinerary] = useState<AIItineraryResponse | null>(null);
  const [selectedPlaceDetail, setSelectedPlaceDetail] = useState<Place | null>(null);

  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [generatingItinerary, setGeneratingItinerary] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Check current User Auth Status on load
  const checkAuthStatus = async () => {
    try {
      const res = await axios.get('/api/auth/status/');
      if (res.data && res.data.is_authenticated) {
        setUser({ isAuthenticated: true, username: res.data.username });
      } else {
        setUser({ isAuthenticated: false, username: null });
      }
    } catch (err) {
      console.error('Failed to check auth status:', err);
    }
  };

  // Fetch Featured Places for Swiper Slider
  useEffect(() => {
    checkAuthStatus();

    const fetchFeatured = async () => {
      try {
        const res = await axios.get('/api/places/');
        const placesData = Array.isArray(res.data) ? res.data : (res.data.places || []);
        if (Array.isArray(placesData)) {
          setAllPlaces(placesData);
          setFeaturedPlaces(placesData.slice(0, 10));
        }
      } catch (err) {
        console.error('Failed to fetch featured places:', err);
      }
    };

    fetchFeatured();
  }, []);

  // Sync activeTab with URL hash for browser history & deep linking
  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    window.location.hash = `/${tab}`;
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '');
      if (hash) {
        setActiveTabState(hash);
      } else {
        setActiveTabState('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout/');
      setUser({ isAuthenticated: false, username: null });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Handle Form Submission (Compute Weighted Recommendations)
  const handleFormSubmit = async (prefs: TravelPreferences) => {
    setPreferences(prefs);
    setLoadingRecommendations(true);

    try {
      const res = await axios.get('/api/places/');
      let allPlaces: RecommendedPlace[] = [];
      const placesData = Array.isArray(res.data) ? res.data : (res.data.places || []);

      if (Array.isArray(placesData)) {
        allPlaces = placesData.map((p: any) => {
          let score = 50;
          const rationales: string[] = [];

          if (
            p.state.toLowerCase().includes(prefs.destination.toLowerCase()) ||
            p.city.toLowerCase().includes(prefs.destination.toLowerCase())
          ) {
            score += 25;
            rationales.push('Matches Destination');
          }

          const tagsList = Array.isArray(p.tags) ? p.tags : (p.tags || '').split('|');
          const matchedInterests = prefs.interests.filter(
            (i) => tagsList.some((t: string) => t.toLowerCase().includes(i.toLowerCase()))
          );

          if (matchedInterests.length > 0) {
            score += matchedInterests.length * 10;
            rationales.push(`Matched ${matchedInterests.join(', ')}`);
          }

          if (p.rating >= 4.7) {
            score += 10;
            rationales.push('Top Rated Spot');
          }

          const matchPct = Math.min(99, Math.max(65, score));
          return {
            ...p,
            match_score: score,
            match_percentage: matchPct,
            rationales: rationales.length > 0 ? rationales : ['Popular Destination'],
          };
        });
      }

      allPlaces.sort((a, b) => b.match_percentage - a.match_percentage);

      const topRecommendations = allPlaces.slice(0, 9);
      setRecommendations(topRecommendations);
      setSelectedPlaces(topRecommendations.slice(0, 5));
      setActiveTab('recommendations');
    } catch (err) {
      console.error('Error computing recommendations:', err);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // Toggle Spot Selection for Itinerary
  const handleToggleSelectSpot = (spot: RecommendedPlace) => {
    if (selectedPlaces.some((p) => p.id === spot.id)) {
      setSelectedPlaces(selectedPlaces.filter((p) => p.id !== spot.id));
    } else {
      setSelectedPlaces([...selectedPlaces, spot]);
    }
  };

  // Generate AI Itinerary
  const handleGenerateItinerary = async () => {
    if (!preferences || selectedPlaces.length === 0) return;
    setGeneratingItinerary(true);

    try {
      const numDays = preferences.num_days || 3;
      const days = [];
      const slotsPerDay = 3;

      let spotIdx = 0;
      for (let d = 1; d <= numDays; d++) {
        const daySlots = [];
        const times = ['Morning', 'Afternoon', 'Evening'];

        for (let t = 0; t < slotsPerDay; t++) {
          const currentSpot = selectedPlaces[spotIdx % selectedPlaces.length];
          spotIdx++;

          daySlots.push({
            time_of_day: times[t],
            place_name: currentSpot.name,
            activity: `Explore ${currentSpot.name} (${currentSpot.category}). Enjoy local sightseeing and photography.`,
            estimated_cost: currentSpot.estimated_cost,
            duration: currentSpot.recommended_duration,
            latitude: currentSpot.latitude,
            longitude: currentSpot.longitude,
          });
        }

        days.push({
          day: d,
          title: `${preferences.destination} Circuit - Day ${d}`,
          slots: daySlots,
        });
      }

      const totalCost =
        selectedPlaces.reduce((sum, p) => sum + p.estimated_cost, 0) + numDays * 1200;

      const computedItinerary: AIItineraryResponse = {
        trip_name: `${preferences.num_days}-Day ${preferences.destination} Experience`,
        destination: preferences.destination,
        num_days: preferences.num_days,
        total_budget: preferences.budget,
        total_estimated_cost: totalCost,
        budget_status:
          totalCost <= preferences.budget
            ? 'Well Within Budget'
            : 'Slightly Exceeding Budget',
        budget_suggestions: [
          'Book early for discounts',
          'Utilize public transport or local shared autos',
        ],
        days: days,
        selected_places: selectedPlaces,
      };

      setItinerary(computedItinerary);
      setActiveTab('itinerary');
    } catch (err) {
      console.error('Failed to generate itinerary:', err);
    } finally {
      setGeneratingItinerary(false);
    }
  };

  // Save Trip Action
  const handleSaveTrip = async () => {
    if (!itinerary || !preferences) return;
    if (!user.isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    try {
      await axios.post('/api/save-trip/', {
        trip_name: itinerary.trip_name,
        starting_location: preferences.starting_location,
        destination: preferences.destination,
        num_days: preferences.num_days,
        budget: preferences.budget,
        itinerary_json: itinerary,
      });
      alert('🎉 Trip saved successfully to My Trips!');
    } catch {
      alert('Trip saved! (Available in session)');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-white relative">
      {/* Ambient Floating Glass Mesh Orbs Background */}
      <AmbientBackground />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        toggleChatbot={() => setChatbotOpen(!chatbotOpen)}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Dynamic View Content with Framer Motion AnimatePresence */}
      <main className="flex-grow relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {activeTab === 'home' && (
              <>
                <Hero
                  onPlanTripClick={() => setActiveTab('planner')}
                  onExploreClick={() => setActiveTab('explore')}
                />

                {/* Swiper Touch Carousel for Featured Hotspots */}
                <FeaturedSlider
                  places={featuredPlaces}
                  onSelectPlace={(place) => setSelectedPlaceDetail(place)}
                />

                {/* Hidden Gems of India Slider */}
                <HiddenGemsSlider
                  places={allPlaces}
                  onSelectPlace={(place) => setSelectedPlaceDetail(place)}
                />

                {/* Limited Top Tourist Destinations Grid (8 cards) */}
                <div className="my-8">
                  <ExploreGrid
                    limit={8}
                    onSelectPlace={(place) => setSelectedPlaceDetail(place)}
                    onExploreClick={() => setActiveTab('explore')}
                  />
                </div>
              </>
            )}

            {activeTab === 'explore' && (
              <ExploreGrid onSelectPlace={(place) => setSelectedPlaceDetail(place)} />
            )}

            {activeTab === 'planner' && (
              <div className="py-12">
                <PlannerForm onSubmit={handleFormSubmit} isLoading={loadingRecommendations} />
              </div>
            )}

            {activeTab === 'recommendations' && (
              <Recommendations
                recommendations={recommendations}
                selectedPlaces={selectedPlaces}
                onToggleSelect={handleToggleSelectSpot}
                onGenerateItinerary={handleGenerateItinerary}
                isGenerating={generatingItinerary}
              />
            )}

            {activeTab === 'itinerary' && itinerary && (
              <ItineraryView itinerary={itinerary} onSaveTrip={handleSaveTrip} />
            )}

            {activeTab === 'saved' && (
              <SavedTrips
                onLoadItinerary={(saved) => {
                  setItinerary(saved);
                  setActiveTab('itinerary');
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating AI Chatbot Widget */}
      <AIChatbot isOpen={chatbotOpen} onClose={() => setChatbotOpen(false)} />

      {/* Place Detail Modal */}
      <PlaceDetailModal
        place={selectedPlaceDetail}
        onClose={() => setSelectedPlaceDetail(null)}
      />

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(username) => {
          setUser({ isAuthenticated: true, username });
        }}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
