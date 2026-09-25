import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import autoAnimate from '@formkit/auto-animate';
import { PlaceCard } from './PlaceCard';
import type { Place } from './PlaceCard';
import { Search, Gem, Compass } from 'lucide-react';

const CATEGORIES = ['All', 'Heritage', 'Nature', 'Adventure', 'Spiritual', 'Wildlife', 'Beach', 'Hill Station'];

export const ExploreGrid: React.FC<{
  onSelectPlace?: (place: Place) => void;
  limit?: number;
  onExploreClick?: () => void;
}> = ({ onSelectPlace, limit, onExploreClick }) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [onlyHiddenGems, setOnlyHiddenGems] = useState(false);
  const [loading, setLoading] = useState(true);

  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (parentRef.current) {
      autoAnimate(parentRef.current, { duration: 350, easing: 'ease-in-out' });
    }
  }, [parentRef]);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await axios.get('/api/places/');
        const placesData = Array.isArray(res.data) ? res.data : (res.data.places || []);
        if (Array.isArray(placesData)) {
          setPlaces(placesData);
        }
      } catch (err) {
        console.error('Failed to fetch places:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  const filteredPlaces = places.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase()) ||
      p.state.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesGem = !onlyHiddenGems || p.is_hidden_gem;
    return matchesSearch && matchesCategory && matchesGem;
  });

  const displayedPlaces = limit ? filteredPlaces.slice(0, limit) : filteredPlaces;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-8 text-left">
      {/* Title & Filter Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/20 mb-2">
            <Compass className="w-3.5 h-3.5 text-amber-600" /> Explore India's Wonders
          </div>
          <h1 className="text-3xl font-black text-slate-900">Top Tourist Destinations</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Discover {filteredPlaces.length} incredible spots across architecture, nature, spirituality, and wild sanctuaries.
          </p>
        </div>

        {/* Search & Gem Toggle */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:flex-grow">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by spot name, city, or state (e.g. Kedarnath, Jaipur)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-slate-900 text-xs font-semibold focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={() => setOnlyHiddenGems(!onlyHiddenGems)}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border text-xs font-extrabold transition-all ${
              onlyHiddenGems
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-500/40'
            }`}
          >
            <Gem className="w-4 h-4" />
            Hidden Gems Only
          </button>
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-4 py-2 rounded-full font-bold transition-all border ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid with AutoAnimate Fluid Morphing */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm font-semibold animate-pulse">
          Loading destination catalog...
        </div>
      ) : displayedPlaces.length === 0 ? (
        <div className="py-20 text-center text-slate-500 text-sm font-semibold">
          No destinations matched your criteria.
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <div ref={parentRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedPlaces.map((p) => (
              <div key={p.id}>
                <PlaceCard place={p} onSelect={onSelectPlace} />
              </div>
            ))}
          </div>

          {/* View All Button when Limited */}
          {limit && filteredPlaces.length > limit && onExploreClick && (
            <div className="flex justify-center pt-4">
              <button
                onClick={onExploreClick}
                className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                View All {filteredPlaces.length} Destinations →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
