import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Hotel, Star, MapPin, ArrowUpRight } from 'lucide-react';

interface HotelItem {
  name: string;
  type: string;
  type_badge: string;
  price_per_night: number;
  distance_km: number;
  rating: number;
  amenities: string[];
  booking_link: string;
}

interface HotelRecommendationsProps {
  spotName: string;
  latitude: number;
  longitude: number;
}

export const HotelRecommendations: React.FC<HotelRecommendationsProps> = ({
  spotName,
  latitude,
  longitude,
}) => {
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<string>('distance');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchHotels = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/nearby-hotels/', {
          params: { latitude, longitude, sort_by: sortBy },
        });
        if (res.data && res.data.hotels) {
          setHotels(res.data.hotels);
        }
      } catch (err) {
        console.error('Failed to load nearby hotels:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [isOpen, latitude, longitude, sortBy]);

  return (
    <div className="mt-3 border-t border-white/10 pt-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-slate-900/80 hover:bg-slate-800 text-amber-300 px-4 py-2.5 rounded-2xl border border-amber-500/20 text-xs font-bold transition-all"
      >
        <span className="flex items-center gap-2">
          <Hotel className="w-4 h-4 text-amber-400" />
          Nearby Economic Stays & Hostels (Near {spotName})
        </span>
        <span className="text-[11px] font-semibold text-slate-400">
          {isOpen ? '▲ Hide Stays' : '▼ View Stays'}
        </span>
      </button>

      {isOpen && (
        <div className="mt-3 bg-slate-950/60 p-4 rounded-2xl border border-white/10 flex flex-col gap-3">
          {/* Sorting Header */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-semibold">Economic Stay Recommendations</span>
            <div className="flex items-center gap-1">
              <span className="text-slate-500 text-[11px]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-900 text-amber-300 border border-white/10 rounded-lg px-2 py-1 text-[11px] font-bold focus:outline-none"
              >
                <option value="distance">Nearest</option>
                <option value="price">Lowest Price</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-6 text-center text-slate-400 text-xs font-semibold animate-pulse">
              Finding economic stays near {spotName}...
            </div>
          ) : hotels.length === 0 ? (
            <div className="py-4 text-center text-slate-400 text-xs">No stays found nearby.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {hotels.map((h, i) => (
                <div
                  key={i}
                  className="bg-slate-900/90 p-3 rounded-xl border border-white/5 flex flex-col justify-between text-left gap-2"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-extrabold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                        {h.type_badge}
                      </span>
                      <span className="text-[11px] font-bold text-amber-400 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400" /> {h.rating}
                      </span>
                    </div>

                    <h4 className="text-xs font-extrabold text-white mt-1 line-clamp-1">{h.name}</h4>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-rose-400" /> {h.distance_km} km from spot
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1">
                    <span className="text-xs font-black text-emerald-400">
                      ₹{h.price_per_night}/night
                    </span>
                    <a
                      href={h.booking_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-0.5"
                    >
                      Book <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
