import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { PlaceCard } from './PlaceCard';
import type { Place } from './PlaceCard';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface FeaturedSliderProps {
  places: Place[];
  onSelectPlace?: (place: Place) => void;
}

export const FeaturedSlider: React.FC<FeaturedSliderProps> = ({ places, onSelectPlace }) => {
  if (!places || places.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 my-12 text-left relative">
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Featured Hotspots
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Trending Destinations Across India
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Swipe or use arrows to explore top-rated travel circuits
          </p>
        </div>

        {/* Custom Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button
            id="featured-prev"
            className="w-10 h-10 rounded-full bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-300 flex items-center justify-center shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer z-10"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <button
            id="featured-next"
            className="w-10 h-10 rounded-full bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-300 flex items-center justify-center shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer z-10"
            aria-label="Next Slide"
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
          prevEl: '#featured-prev',
          nextEl: '#featured-next',
        }}
        autoplay={{
          delay: 4000,
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
        {places.map((place) => (
          <SwiperSlide key={place.id} className="h-auto">
            <PlaceCard place={place} onSelect={onSelectPlace} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
