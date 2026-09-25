import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Calendar,
  Sun,
  Sunset,
  Moon,
  MapPin,
  IndianRupee,
  Clock,
  Bookmark,
  Printer,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Navigation,
} from 'lucide-react';
import type { RecommendedPlace } from './Recommendations';
import { RouteMap } from './RouteMap';
import { HotelRecommendations } from './HotelRecommendations';

interface ItinerarySlot {
  time_of_day: string;
  place_name: string;
  activity: string;
  estimated_cost: number;
  duration: number;
  latitude: number;
  longitude: number;
}

interface DayPlan {
  day: number;
  title: string;
  slots: ItinerarySlot[];
}

export interface AIItineraryResponse {
  trip_name: string;
  destination: string;
  num_days: number;
  total_budget: number;
  total_estimated_cost: number;
  budget_status: string;
  budget_suggestions: string[];
  days: DayPlan[];
  selected_places: RecommendedPlace[];
}

interface ItineraryViewProps {
  itinerary: AIItineraryResponse;
  onSaveTrip?: () => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  itinerary,
  onSaveTrip,
}) => {
  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#10b981', '#06b6d4'],
    });
  }, []);

  const budgetUsagePct = Math.min(
    100,
    Math.round((itinerary.total_estimated_cost / (itinerary.total_budget || 1)) * 100)
  );

  // Build Full Master Circuit Google Maps Direction URL
  const selectedSpots = itinerary.selected_places || [];
  const fullCircuitUrl = selectedSpots.length > 0
    ? `https://www.google.com/maps/dir/${encodeURIComponent(itinerary.destination)}/${selectedSpots
        .map((s) => `${s.latitude},${s.longitude}`)
        .join('/')}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(itinerary.destination)}`;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-8 text-left">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 relative overflow-hidden bg-white shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 px-3.5 py-1 rounded-full border border-amber-500/20 text-xs font-extrabold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Generated with Gemini 3D AI Engine
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900">{itinerary.trip_name}</h1>
            <p className="text-sm text-slate-500 font-semibold mt-1">
              Destination: <strong className="text-slate-900">{itinerary.destination}</strong> • {itinerary.num_days} Days
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={fullCircuitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-slate-900 hover:bg-amber-600 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-amber-400" /> View Full Circuit on Google Maps
            </a>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Itinerary
            </button>
            {onSaveTrip && (
              <button
                onClick={onSaveTrip}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black px-6 py-2.5 rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105 cursor-pointer"
              >
                <Bookmark className="w-4 h-4 stroke-[2.5]" /> Save Trip
              </button>
            )}
          </div>
        </div>

        {/* Budget Progress Meter */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700">Estimated Total Cost vs Budget Limit</span>
              <span className="text-amber-700 font-black">
                ₹{itinerary.total_estimated_cost.toLocaleString('en-IN')} / ₹
                {(itinerary.total_budget || 15000).toLocaleString('en-IN')} ({budgetUsagePct}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  budgetUsagePct > 90 ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-500 to-emerald-500'
                }`}
                style={{ width: `${budgetUsagePct}%` }}
              />
            </div>
          </div>

          <div className="md:col-span-4 flex items-center justify-end gap-2">
            <span
              className={`text-xs font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 border ${
                budgetUsagePct > 90
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {budgetUsagePct > 90 ? (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              ) : (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              )}
              {itinerary.budget_status || 'Well Within Budget'}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Leaflet Route Map */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-600" /> 3D Route & Waypoints Map
          </h3>
          <a
            href={fullCircuitUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-extrabold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            Google Maps Circuit Directions <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
        <RouteMap spots={itinerary.selected_places || []} />
      </div>

      {/* Day Wise Itinerary Timeline */}
      <div className="flex flex-col gap-6">
        <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-amber-600" /> Day-by-Day Schedule
        </h3>

        {itinerary.days &&
          itinerary.days.map((dayPlan) => (
            <motion.div
              key={dayPlan.day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-6 rounded-3xl border border-slate-200 flex flex-col gap-4 bg-white shadow-sm"
            >
              {/* Day Title Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <span className="w-10 h-10 rounded-2xl bg-amber-500 text-white font-black text-base flex items-center justify-center shadow-md">
                  D{dayPlan.day}
                </span>
                <div>
                  <h4 className="text-lg font-extrabold text-slate-900">
                    Day {dayPlan.day}: {dayPlan.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold">
                    Sequential morning to evening itinerary
                  </p>
                </div>
              </div>

              {/* Slots Grid */}
              <div className="flex flex-col gap-4">
                {dayPlan.slots &&
                  dayPlan.slots.map((slot, sIdx) => {
                    const Icon =
                      slot.time_of_day === 'Morning'
                        ? Sun
                        : slot.time_of_day === 'Afternoon'
                        ? Sunset
                        : Moon;
                    const slotColor =
                      slot.time_of_day === 'Morning'
                        ? 'text-amber-700 bg-amber-50 border-amber-200'
                        : slot.time_of_day === 'Afternoon'
                        ? 'text-orange-700 bg-orange-50 border-orange-200'
                        : 'text-indigo-700 bg-indigo-50 border-indigo-200';

                    const slotMapUrl =
                      slot.latitude && slot.longitude
                        ? `https://www.google.com/maps/search/?api=1&query=${slot.latitude},${slot.longitude}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            slot.place_name + ' ' + itinerary.destination
                          )}`;

                    return (
                      <div
                        key={sIdx}
                        className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70 flex flex-col gap-2.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 border ${slotColor}`}
                            >
                              <Icon className="w-3.5 h-3.5" /> {slot.time_of_day}
                            </span>
                            <h5 className="text-base font-bold text-slate-900">
                              {slot.place_name}
                            </h5>
                          </div>

                          <div className="flex items-center gap-3 text-xs font-semibold">
                            <span className="flex items-center gap-1 text-emerald-600 font-bold">
                              <IndianRupee className="w-3.5 h-3.5" /> ₹{slot.estimated_cost}
                            </span>
                            <span className="flex items-center gap-1 text-sky-600 font-bold">
                              <Clock className="w-3.5 h-3.5" /> {slot.duration} hrs
                            </span>

                            {/* Direct Spot Google Maps Link */}
                            <a
                              href={slotMapUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-xl text-xs font-bold transition-colors shadow-xs"
                            >
                              <MapPin className="w-3 h-3 text-rose-500" />
                              Google Maps <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 font-medium leading-relaxed pl-1">
                          {slot.activity}
                        </p>

                        {slot.latitude && slot.longitude && (
                          <HotelRecommendations
                            spotName={slot.place_name}
                            latitude={slot.latitude}
                            longitude={slot.longitude}
                          />
                        )}
                      </div>
                    );
                  })}
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  );
};
