import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bookmark, Calendar, IndianRupee, MapPin, Trash2, ArrowRight } from 'lucide-react';
import type { AIItineraryResponse } from './ItineraryView';

interface SavedTripItem {
  id: number;
  trip_name: string;
  destination: string;
  num_days: number;
  budget: number;
  created_at: string;
  itinerary_json: AIItineraryResponse;
}

interface SavedTripsProps {
  onLoadItinerary: (itinerary: AIItineraryResponse) => void;
}

export const SavedTrips: React.FC<SavedTripsProps> = ({ onLoadItinerary }) => {
  const [trips, setTrips] = useState<SavedTripItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedTrips = async () => {
    try {
      const res = await axios.get('/api/my-trips/');
      if (res.data && Array.isArray(res.data.trips)) {
        setTrips(res.data.trips);
      }
    } catch (err) {
      console.error('Failed to load saved trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedTrips();
  }, []);

  const deleteTrip = async (id: number) => {
    try {
      await axios.delete(`/api/delete-trip/${id}/`);
      setTrips(trips.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Failed to delete trip:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-8 text-left">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/20 mb-2">
          <Bookmark className="w-3.5 h-3.5 text-amber-600" /> Your Saved Itineraries
        </div>
        <h1 className="text-3xl font-black text-slate-900">My Saved Trips</h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">Re-visit and manage your saved 3D itineraries</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm font-semibold animate-pulse">
          Fetching saved itineraries...
        </div>
      ) : trips.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center border border-slate-200 bg-white shadow-sm flex flex-col items-center gap-3">
          <Bookmark className="w-12 h-12 text-slate-400" />
          <h3 className="text-lg font-bold text-slate-900">No Saved Trips Yet</h3>
          <p className="text-xs text-slate-500 font-semibold">Generate an AI trip itinerary and click "Save Trip" to save it here!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((t) => (
            <div
              key={t.id}
              className="glass-card p-6 rounded-3xl border border-slate-200 flex flex-col justify-between gap-4 hover:border-amber-500/50 transition-all shadow-sm"
            >
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-black text-slate-900">{t.trip_name}</h3>
                  <button
                    onClick={() => deleteTrip(t.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-500 font-bold flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> {t.destination}
                </p>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 mt-4 text-xs font-bold">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Calendar className="w-4 h-4 text-sky-600" /> {t.num_days} Days
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <IndianRupee className="w-4 h-4" /> ₹{t.budget.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <button
                onClick={() => t.itinerary_json && onLoadItinerary(t.itinerary_json)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md shadow-amber-500/20 transition-all"
              >
                View 3D Itinerary <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
