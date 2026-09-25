import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import {
  Star,
  MapPin,
  Clock,
  IndianRupee,
  Heart,
  Sparkles,
  Gem,
  ArrowRight,
  Volume2,
  Square,
  Globe,
} from 'lucide-react';
import { getPlaceImage } from '../utils/imageMapper';

export interface Place {
  id: number;
  name: string;
  state: string;
  city: string;
  category: string;
  description: string;
  short_description: string;
  best_time: string;
  estimated_cost: number;
  recommended_duration: number;
  latitude: number;
  longitude: number;
  rating: number;
  image_url: string;
  tags: string[];
  is_hidden_gem: boolean;
  sustainability_score: number;
}

interface PlaceCardProps {
  place: Place;
  onSelect?: (place: Place) => void;
  isFavourite?: boolean;
  onToggleFavourite?: (id: number) => void;
}

const LANGUAGES = [
  { code: 'hi-IN', label: 'HI', name: 'Hindi', langKey: 'hi' },
  { code: 'gu-IN', label: 'GU', name: 'Gujarati', langKey: 'gu' },
  { code: 'mr-IN', label: 'MR', name: 'Marathi', langKey: 'mr' },
  { code: 'te-IN', label: 'TE', name: 'Telugu', langKey: 'te' },
  { code: 'ml-IN', label: 'ML', name: 'Malayalam', langKey: 'ml' },
  { code: 'hi-IN', label: 'BH', name: 'Bhojpuri', langKey: 'bh' },
  { code: 'en-IN', label: 'EN', name: 'English', langKey: 'en' },
];

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  onSelect,
  isFavourite = false,
  onToggleFavourite,
}) => {
  const [fav, setFav] = useState(isFavourite);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [8, -8]);
  const rotateY = useTransform(x, [-100, 100], [-8, 8]);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const toggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFav(!fav);
    if (onToggleFavourite) {
      onToggleFavourite(place.id);
    }
  };

  const getNarrationPhonics = (langKey: string): string => {
    const desc = place.short_description || place.description;
    switch (langKey) {
      case 'gu':
        return `Namaste! ${place.name} ${place.city}, ${place.state} ma aavelu ek sundar ${place.category} sthal chhe. ${desc}`;
      case 'mr':
        return `Namaskar! ${place.name} he ${place.city}, ${place.state} madhil ek prasiddha ${place.category} thikan ahe. ${desc}`;
      case 'te':
        return `Namaskaram! ${place.name} anedi ${place.city}, ${place.state} lo unna oka prasiddha ${place.category} pradesam. ${desc}`;
      case 'ml':
        return `Namaskaram! ${place.name} ${place.city}, ${place.state} yil sthithi cheyyunna ${place.category} sthalam aanu. ${desc}`;
      case 'bh':
        return `Pranam! ${place.name} ${place.city}, ${place.state} ke bahut sundar ${place.category} jagah ba. ${desc}`;
      case 'hi':
        return `Namaste! ${place.name} ${place.city}, ${place.state} mein sthit ek prasiddh ${place.category} sthal hai. ${desc}`;
      case 'en':
      default:
        return `Welcome to ${place.name} located in ${place.city}, ${place.state}. It is a famous ${place.category} destination. ${desc}`;
    }
  };

  const handleToggleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const phonicText = getNarrationPhonics(selectedLang.langKey);
    const utterance = new SpeechSynthesisUtterance(phonicText);

    // Dynamic Voice Matching
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().includes(selectedLang.langKey) ||
        v.lang.toLowerCase().includes(selectedLang.code.toLowerCase()) ||
        v.name.toLowerCase().includes(selectedLang.name.toLowerCase())
    );

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    } else {
      utterance.lang = selectedLang.code;
    }

    utterance.rate = 0.92;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleSelectLang = (e: React.MouseEvent, lang: typeof LANGUAGES[0]) => {
    e.stopPropagation();
    setSelectedLang(lang);
    setShowLangMenu(false);
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const displayImage = getPlaceImage(place.name, place.image_url);

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.025 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      onClick={() => onSelect && onSelect(place)}
      className="glass-card rounded-3xl overflow-hidden cursor-pointer flex flex-col h-full relative group border border-slate-200/90 shadow-md hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300"
    >
      {/* Glass Sheen Light Sweep Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none z-20" />

      {/* Image Header */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-100">
        <img
          src={displayImage}
          alt={place.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=800';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/65 via-transparent to-transparent" />

        {/* Category Pill */}
        <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-amber-700 border border-amber-500/20 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
          {place.category}
        </span>

        {/* Hidden Gem Badge */}
        {place.is_hidden_gem && (
          <span className="absolute top-4 right-14 bg-emerald-500 text-white font-black text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md animate-pulse">
            <Gem className="w-3 h-3 fill-white" />
            Gem
          </span>
        )}

        {/* Favourite Button with Heart Pulse */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={toggleFav}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              fav ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-400 hover:text-rose-400'
            }`}
          />
        </motion.button>

        {/* Multi-Language Audio Narration Controls */}
        <div className="absolute bottom-3 right-4 flex items-center gap-1.5 z-10">
          {/* Language Selector Trigger */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowLangMenu(!showLangMenu);
              }}
              className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-amber-300 font-black text-[10px] px-2 py-1 rounded-lg flex items-center gap-1 border border-white/20 shadow-md transition-colors cursor-pointer"
            >
              <Globe className="w-3 h-3 text-amber-400" />
              <span>{selectedLang.label}</span>
            </button>

            {/* Language Menu Dropdown */}
            {showLangMenu && (
              <div className="absolute bottom-8 right-0 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl p-1.5 shadow-xl flex flex-col gap-1 w-28 text-left z-30">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.label}
                    onClick={(e) => handleSelectLang(e, lang)}
                    className={`text-[11px] font-bold px-2 py-1 rounded-lg text-left transition-colors flex items-center justify-between cursor-pointer ${
                      selectedLang.label === lang.label
                        ? 'bg-amber-500 text-white font-extrabold'
                        : 'text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    <span>{lang.name}</span>
                    <span className="text-[9px] opacity-75">{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Speak / Stop Button */}
          <button
            onClick={handleToggleSpeak}
            title={isSpeaking ? 'Stop Narration' : `Listen in ${selectedLang.name}`}
            className={`backdrop-blur-md text-white font-bold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md transition-all cursor-pointer ${
              isSpeaking
                ? 'bg-rose-600 hover:bg-rose-700 animate-pulse border border-rose-400'
                : 'bg-black/60 hover:bg-amber-600 border border-white/10'
            }`}
          >
            {isSpeaking ? (
              <>
                <Square className="w-3 h-3 fill-white" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                <span>Listen</span>
              </>
            )}
          </button>
        </div>

        {/* Rating Floating Tag */}
        <div className="absolute bottom-3 left-4 flex items-center gap-1 bg-amber-500 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-md">
          <Star className="w-3.5 h-3.5 fill-white" />
          <span>{place.rating}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-grow justify-between gap-3 text-left">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
            {place.name}
          </h3>
          <p className="text-xs text-slate-500 font-bold flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            {place.city}, {place.state}
          </p>
          <p className="text-xs text-slate-600 font-medium line-clamp-2 mt-2.5 leading-relaxed">
            {place.short_description || place.description}
          </p>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 mt-2">
          <div className="flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-emerald-600" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Est. Cost</span>
              <span className="text-xs font-black text-slate-900">₹{Math.round(place.estimated_cost)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-600" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Duration</span>
              <span className="text-xs font-black text-slate-900">{place.recommended_duration} hrs</span>
            </div>
          </div>
        </div>

        {/* Action Link Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
          <div className="flex items-center gap-1 text-[11px] text-amber-700 font-bold">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Eco Score: {place.sustainability_score}/10
          </div>
          <span className="text-xs font-bold text-slate-600 group-hover:text-amber-600 flex items-center gap-1 transition-colors">
            Details <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </motion.div>
  );
};
