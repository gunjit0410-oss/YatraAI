import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star, MapPin, Check, Plus, Clock, IndianRupee, ArrowRight } from 'lucide-react';
import type { Place } from './PlaceCard';
import { getPlaceImage } from '../utils/imageMapper';

export interface RecommendedPlace extends Place {
  match_score: number;
  match_percentage: number;
  rationales: string[];
}

interface RecommendationsProps {
  recommendations: RecommendedPlace[];
  selectedPlaces: RecommendedPlace[];
  onToggleSelect: (place: RecommendedPlace) => void;
  onGenerateItinerary: () => void;
  isGenerating: boolean;
}

export const Recommendations: React.FC<RecommendationsProps> = ({
  recommendations,
  selectedPlaces,
  onToggleSelect,
  onGenerateItinerary,
  isGenerating,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-8 text-left">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-200 shadow-sm bg-white">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-700 text-xs font-extrabold px-3 py-1 rounded-full border border-amber-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> 3D Preference Matching Matrix
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Recommended Tourist Spots</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Selected spots will be scheduled into your day-wise itinerary map.
          </p>
        </div>

        <button
          onClick={onGenerateItinerary}
          disabled={selectedPlaces.length === 0 || isGenerating}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white font-black px-7 py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin" /> Synthesizing AI Itinerary...
            </span>
          ) : (
            <span>
              Generate AI Itinerary ({selectedPlaces.length} Spots) <ArrowRight className="w-4 h-4 inline ms-1" />
            </span>
          )}
        </button>
      </div>

      {/* Grid of Recommended Spots */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((spot, idx) => {
          const isSelected = selectedPlaces.some((p) => p.id === spot.id);
          const displayImg = getPlaceImage(spot.name, spot.image_url);

          return (
            <motion.div
              key={spot.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`glass-card rounded-3xl overflow-hidden border transition-all flex flex-col justify-between ${
                isSelected ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/30' : 'border-slate-200'
              }`}
            >
              {/* Image & Match Tag */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img
                  src={displayImg}
                  alt={spot.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=800';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                {/* Match Percentage Pill */}
                <div className="absolute top-4 left-4 bg-white/95 border border-amber-500/30 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-amber-700 shadow-sm flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  {Math.round(spot.match_percentage || 85)}% Match
                </div>

                <button
                  onClick={() => onToggleSelect(spot)}
                  className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center font-bold transition-all shadow-md ${
                    isSelected
                      ? 'bg-amber-500 text-white scale-110'
                      : 'bg-white/90 text-slate-700 hover:bg-white'
                  }`}
                >
                  {isSelected ? <Check className="w-5 h-5 stroke-[3]" /> : <Plus className="w-5 h-5" />}
                </button>
              </div>

              {/* Content Body */}
              <div className="p-5 flex flex-col gap-3 flex-grow justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 line-clamp-1">{spot.name}</h3>
                    <span className="text-xs font-bold text-amber-700 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {spot.rating}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-bold flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" /> {spot.city}, {spot.state}
                  </p>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed font-medium">
                    {spot.short_description || spot.description}
                  </p>

                  {/* Rationales tags */}
                  {spot.rationales && spot.rationales.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {spot.rationales.map((rat, rIdx) => (
                        <span
                          key={rIdx}
                          className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-500/20 px-2 py-0.5 rounded-full"
                        >
                          ✓ {rat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Details */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500 font-semibold">
                  <span className="flex items-center gap-1 text-emerald-600 font-bold">
                    <IndianRupee className="w-3.5 h-3.5" /> ₹{Math.round(spot.estimated_cost)}
                  </span>
                  <span className="flex items-center gap-1 text-sky-600 font-bold">
                    <Clock className="w-3.5 h-3.5" /> {spot.recommended_duration} hrs
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
