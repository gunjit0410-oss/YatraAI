import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Hotel, Star, MapPin, ExternalLink } from 'lucide-react';

interface HotelItem {
  name: string;
  category: string;
  type_badge: string;
  price_per_night: number;
  distance_km: number;
  distance_display: string;
  rating: number;
  amenities: string[];
  booking_link: string;
  maps_url?: string;
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
          params: { latitude, longitude, place_name: spotName, sort_by: sortBy },
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
  }, [isOpen, latitude, longitude, spotName, sortBy]);

  return (
    <div className="mt-3 border-t border-slate-200/80 pt-3 text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-amber-50 hover:bg-amber-100 text-amber-900 px-4 py-2.5 rounded-2xl border border-amber-300 text-xs font-bold transition-all cursor-pointer shadow-xs"
      >
        <span className="flex items-center gap-2">
          <Hotel className="w-4 h-4 text-amber-600" />
          Nearby Economic Stays & Hostels (Near {spotName})
        </span>
        <span className="text-[11px] font-extrabold text-amber-800">
          {isOpen ? '▲ Hide Stays' : '▼ View Stays'}
        </span>
      </button>

      {isOpen && (
        <div className="mt-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-3">
          {/* Sorting Header */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 font-bold">Recommended Local Stays</span>
            <div className="flex items-center gap-1">
              <span className="text-slate-500 text-[11px]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white text-slate-900 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold focus:outline-none"
              >
                <option value="distance">Nearest</option>
                <option value="price">Lowest Price</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-6 text-center text-slate-500 text-xs font-semibold animate-pulse">
              Finding economic stays near {spotName}...
            </div>
          ) : hotels.length === 0 ? (
            <div className="py-4 text-center text-slate-500 text-xs font-semibold">
              No stays found nearby.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {hotels.map((h, i) => (
                <div
                  key={i}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between text-left gap-2 hover:border-amber-400 transition-colors"
                >
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-[10px] font-extrabold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                        {h.type_badge || h.category}
                      </span>
                      <span className="text-[11px] font-black text-amber-600 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {h.rating}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-slate-900 mt-1.5 leading-snug">
                      {h.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 font-semibold">
                      <MapPin className="w-3 h-3 text-rose-500" /> {h.distance_display || `${h.distance_km} km`}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-1">
                    <span className="text-xs font-black text-emerald-600">
                      ₹{h.price_per_night}/night
                    </span>
                    <a
                      href={h.booking_link || h.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-extrabold bg-slate-900 hover:bg-amber-600 text-white px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors shadow-xs"
                    >
                      <span>Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
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
