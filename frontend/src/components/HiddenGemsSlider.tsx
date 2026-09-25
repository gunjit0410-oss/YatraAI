import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { PlaceCard } from './PlaceCard';
import type { Place } from './PlaceCard';
import { Gem, ChevronLeft, ChevronRight } from 'lucide-react';

interface HiddenGemsSliderProps {
  places: Place[];
  onSelectPlace?: (place: Place) => void;
}

export const HiddenGemsSlider: React.FC<HiddenGemsSliderProps> = ({ places, onSelectPlace }) => {
  // Filter places where is_hidden_gem is true, or fallback to top quiet spots
  const hiddenGems = places.filter((p) => p.is_hidden_gem);
  const displayPlaces = hiddenGems.length > 0 ? hiddenGems : places.slice(5, 15);

  if (!displayPlaces || displayPlaces.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 my-16 text-left relative">
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/20 mb-2">
            <Gem className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" /> Off-the-Beaten-Track
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Hidden Gems of India
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Unexplored paradises, serene valleys, and secret heritage spots away from crowds
          </p>
        </div>

        {/* Custom Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button
            id="gems-prev"
            className="w-10 h-10 rounded-full bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 flex items-center justify-center shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer z-10"
            aria-label="Previous Hidden Gem"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <button
            id="gems-next"
            className="w-10 h-10 rounded-full bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 flex items-center justify-center shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer z-10"
            aria-label="Next Hidden Gem"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        grabCursor={true}
        slidesPerView={1}
        spaceBetween={20}
        navigation={{
          prevEl: '#gems-prev',
          nextEl: '#gems-next',
        }}
        autoplay={{
          delay: 4500,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 24 },
          1024: { slidesPerView: 3, spaceBetween: 24 },
          1280: { slidesPerView: 4, spaceBetween: 24 },
        }}
        className="pb-12 !px-1"
      >
        {displayPlaces.map((place) => (
          <SwiperSlide key={place.id} className="h-auto">
            <PlaceCard place={place} onSelect={onSelectPlace} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
