import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  MapPin,
  Clock,
  IndianRupee,
  ExternalLink,
  Calendar,
  Leaf,
  Volume2,
  Square,
  Globe,
} from 'lucide-react';
import type { Place } from './PlaceCard';
import { getPlaceImage } from '../utils/imageMapper';

interface PlaceDetailModalProps {
  place: Place | null;
  onClose: () => void;
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

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({ place, onClose }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!place) return null;

  const getNarrationPhonics = (langKey: string): string => {
    const desc = place.description || place.short_description;
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
        return `Welcome to ${place.name} located in ${place.city}, ${place.state}. ${desc}`;
    }
  };

  const handleToggleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const phonicText = getNarrationPhonics(selectedLang.langKey);
    const utterance = new SpeechSynthesisUtterance(phonicText);

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

  const handleCloseModal = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    onClose();
  };

  const displayImg = getPlaceImage(place.name, place.image_url);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white max-w-2xl w-full rounded-3xl overflow-hidden border border-slate-200 shadow-2xl relative flex flex-col my-8 text-left"
        >
          {/* Header Image */}
          <div className="relative h-64 w-full bg-slate-100">
            <img src={displayImg} alt={place.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 text-slate-700 hover:bg-white flex items-center justify-center shadow-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
              <div>
                <span className="bg-amber-500 text-white font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider">
                  {place.category}
                </span>
                <h2 className="text-2xl font-black text-white mt-2 leading-tight">{place.name}</h2>
                <p className="text-xs text-slate-200 font-semibold flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" /> {place.city}, {place.state}
                </p>
              </div>

              <div className="bg-amber-500 text-white font-black text-sm px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-md">
                <Star className="w-4 h-4 fill-white" /> {place.rating}
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 flex flex-col gap-5">
            {/* Audio Narration Bar */}
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-3.5 rounded-2xl">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-900">Audio Speech Guide:</span>
                <select
                  value={selectedLang.label}
                  onChange={(e) => {
                    const l = LANGUAGES.find((item) => item.label === e.target.value);
                    if (l) setSelectedLang(l);
                    if (isSpeaking) {
                      window.speechSynthesis.cancel();
                      setIsSpeaking(false);
                    }
                  }}
                  className="bg-white border border-amber-300 rounded-lg text-xs font-extrabold text-amber-900 px-2 py-1 focus:outline-none"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.label} value={lang.label}>
                      {lang.name} ({lang.label})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleToggleSpeak}
                className={`text-xs font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                  isSpeaking
                    ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-white" /> Stop Narration
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" /> Play Narration
                  </>
                )}
              </button>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                About Destination
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                {place.description || place.short_description}
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                  <IndianRupee className="w-3 h-3 text-emerald-600" /> Est. Cost
                </span>
                <span className="text-sm font-black text-slate-900 mt-0.5">
                  ₹{Math.round(place.estimated_cost)}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3 text-sky-600" /> Duration
                </span>
                <span className="text-sm font-black text-slate-900 mt-0.5">
                  {place.recommended_duration} Hours
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-600" /> Best Time
                </span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 line-clamp-1">
                  {place.best_time || 'Oct - Mar'}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                  <Leaf className="w-3 h-3 text-emerald-600" /> Eco Score
                </span>
                <span className="text-xs font-black text-emerald-700 mt-0.5">
                  {place.sustainability_score}/10
                </span>
              </div>
            </div>

            {/* Tags */}
            {place.tags && (
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Attributes & Highlights:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(place.tags) ? place.tags : (place.tags as string).split('|')).map(
                    (t, idx) => (
                      <span
                        key={idx}
                        className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full"
                      >
                        #{t.trim()}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors"
              >
                Open in Google Maps <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={handleCloseModal}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
