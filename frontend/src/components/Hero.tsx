import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  MapPin,
  Compass,
  ShieldCheck,
  Zap,
  ArrowRight,
  Landmark,
  TreePine,
  Mountain,
  Waves,
  Landmark as Temple,
  Sunset,
  Palmtree,
  Star,
} from 'lucide-react';

interface HeroProps {
  onPlanTripClick: () => void;
  onExploreClick: () => void;
}

const CATEGORY_CHIPS = [
  { name: 'Heritage', icon: Landmark },
  { name: 'Nature', icon: TreePine },
  { name: 'Spiritual', icon: Temple },
  { name: 'Adventure', icon: Mountain },
  { name: 'Beach', icon: Waves },
  { name: 'Hill Station', icon: Sunset },
  { name: 'Wildlife', icon: Palmtree },
];

const STREAM_ROW_1 = [
  { name: 'Taj Mahal', location: 'Agra, UP', tag: 'Heritage', rating: '4.9', image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=600' },
  { name: 'Munnar Hills', location: 'Kerala', tag: 'Nature', rating: '4.8', image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=600' },
  { name: 'Amer Fort', location: 'Jaipur, RJ', tag: 'Royal', rating: '4.9', image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=600' },
  { name: 'Hampi Temples', location: 'Karnataka', tag: 'History', rating: '4.9', image: 'https://images.unsplash.com/photo-1600100397608-f010e423b963?q=80&w=600' },
  { name: 'Dal Lake', location: 'Srinagar, J&K', tag: 'Scenic', rating: '4.8', image: '/static/images/places/dallake.jpg' },
  { name: 'Baga Beach', location: 'North Goa', tag: 'Beach', rating: '4.7', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=600' },
  { name: 'Kedarnath', location: 'Uttarakhand', tag: 'Spiritual', rating: '5.0', image: '/static/images/places/kedarnath.jpg' },
];

const STREAM_ROW_2 = [
  { name: 'Statue of Unity', location: 'Gujarat', tag: 'Iconic', rating: '4.9', image: 'https://images.unsplash.com/photo-1603201667141-5a2d4c673378?q=80&w=600' },
  { name: 'Alleppey Stays', location: 'Kerala', tag: 'Backwaters', rating: '4.8', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=600' },
  { name: 'Spiti Valley', location: 'Himachal', tag: 'Adventure', rating: '4.9', image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=600' },
  { name: 'Varanasi Ghats', location: 'Uttar Pradesh', tag: 'Sacred', rating: '4.9', image: '/static/images/places/kashi.jpg' },
  { name: 'Jaisalmer Fort', location: 'Rajasthan', tag: 'Desert', rating: '4.8', image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600' },
  { name: 'Cherrapunji', location: 'Meghalaya', tag: 'Waterfall', rating: '4.8', image: '/static/images/places/cherrapunji.jpg' },
  { name: 'Ajanta Caves', location: 'Maharashtra', tag: 'Ancient', rating: '4.8', image: '/static/images/places/ajanta.jpg' },
];

export const Hero: React.FC<HeroProps> = ({ onPlanTripClick, onExploreClick }) => {
  // Duplicate arrays for seamless infinite horizontal scrolling loops
  const row1Items = [...STREAM_ROW_1, ...STREAM_ROW_1, ...STREAM_ROW_1];
  const row2Items = [...STREAM_ROW_2, ...STREAM_ROW_2, ...STREAM_ROW_2];

  return (
    <section className="relative py-16 lg:py-24 overflow-hidden bg-gradient-to-b from-amber-50/60 via-slate-50 to-white border-b border-slate-200/80 text-slate-900 min-h-[85vh] flex items-center justify-center">
      {/* Dynamic Background Image Stream Wall (-rotate-2 for diagonal tilt) */}
      <div className="absolute inset-0 overflow-hidden opacity-75 pointer-events-none -rotate-2 scale-105 flex flex-col justify-center gap-6">
        {/* Infinite Row 1 - Left to Right */}
        <div className="flex w-max">
          <motion.div
            animate={{ x: ['0%', '-33.333%'] }}
            transition={{
              repeat: Infinity,
              ease: 'linear',
              duration: 35,
            }}
            className="flex gap-4 px-2"
          >
            {row1Items.map((item, idx) => (
              <div
                key={`r1-${idx}`}
                className="w-64 h-40 rounded-2xl overflow-hidden relative group border border-amber-200/60 shadow-lg flex-shrink-0 bg-white"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=600';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                      {item.tag}
                    </span>
                    <span className="text-[10px] bg-amber-500 text-white font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-xs">
                      <Star className="w-2.5 h-2.5 fill-white" /> {item.rating}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white leading-tight truncate mt-0.5">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-200 flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-rose-400" /> {item.location}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Infinite Row 2 - Right to Left */}
        <div className="flex w-max">
          <motion.div
            animate={{ x: ['-33.333%', '0%'] }}
            transition={{
              repeat: Infinity,
              ease: 'linear',
              duration: 40,
            }}
            className="flex gap-4 px-2"
          >
            {row2Items.map((item, idx) => (
              <div
                key={`r2-${idx}`}
                className="w-64 h-40 rounded-2xl overflow-hidden relative group border border-amber-200/60 shadow-lg flex-shrink-0 bg-white"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=600';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                      {item.tag}
                    </span>
                    <span className="text-[10px] bg-amber-500 text-white font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-xs">
                      <Star className="w-2.5 h-2.5 fill-white" /> {item.rating}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white leading-tight truncate mt-0.5">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-200 flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-rose-400" /> {item.location}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Light Soft Overlay Mask (Light Theme & Crisp Visibility) */}
      <div className="absolute inset-0 bg-white/45 backdrop-blur-[2px] pointer-events-none z-0" />

      {/* Central Light-Theme Hero Card Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10 my-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/92 backdrop-blur-sm border border-slate-200/90 p-8 sm:p-12 rounded-3xl shadow-xl shadow-amber-900/5 flex flex-col items-center gap-6"
        >
          {/* Top Hackathon Badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-4 py-1.5 rounded-full text-xs font-bold shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Incredible India • Smart AI Travel Engine</span>
          </motion.div>

          {/* Main Hero Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]"
          >
            Plan Your Perfect Trip Across <br />
            <span className="text-gradient-amber">
              Incredible India
            </span>
          </motion.h1>

          {/* Subtitle Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base sm:text-xl text-slate-600 font-medium max-w-2xl leading-relaxed"
          >
            AI-powered day-wise itineraries, weighted interest matching, budget optimization, and economic stay recommendations for seamless travel discovery.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-2"
          >
            <button
              onClick={onPlanTripClick}
              className="flex items-center gap-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black px-8 py-4 rounded-2xl shadow-lg shadow-amber-500/20 text-base transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 stroke-[2.5]" />
              Plan My Trip Now
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>

            <button
              onClick={onExploreClick}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-7 py-4 rounded-2xl font-bold text-base transition-all shadow-xs hover:border-slate-400 cursor-pointer"
            >
              <Compass className="w-5 h-5 text-amber-600" />
              Explore Destinations
            </button>
          </motion.div>

          {/* Category Chips Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-2 pt-2 max-w-3xl"
          >
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider me-1">
              Popular Vibes:
            </span>
            {CATEGORY_CHIPS.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.name}
                  onClick={onExploreClick}
                  className="flex items-center gap-1.5 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-300 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Icon className="w-3.5 h-3.5 text-amber-600" />
                  {cat.name}
                </button>
              );
            })}
          </motion.div>

          {/* Key Metric Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl pt-6 border-t border-slate-200/80 mt-2"
          >
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-sm font-black text-slate-900">68+ Curated Spots</span>
                <span className="block text-[11px] font-medium text-slate-500">All 28 Indian States</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-sm font-black text-slate-900">Weighted AI Model</span>
                <span className="block text-[11px] font-medium text-slate-500">35% Interest & 20% Budget</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-sm font-black text-slate-900">100% Offline Fallback</span>
                <span className="block text-[11px] font-medium text-slate-500">Seamless Demo Safety</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
