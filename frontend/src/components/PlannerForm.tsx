import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, Calendar, IndianRupee, Users, Gauge, Heart, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export interface TravelPreferences {
  starting_location: string;
  destination: string;
  num_days: number;
  budget: number;
  travel_type: string;
  travel_pace: string;
  interests: string[];
}

interface PlannerFormProps {
  onSubmit: (prefs: TravelPreferences) => void;
  isLoading: boolean;
}

const POPULAR_DESTINATIONS = ['Rajasthan', 'Kerala', 'Himachal Pradesh', 'Goa', 'Madhya Pradesh', 'Uttarakhand', 'Tamil Nadu', 'Gujarat'];
const TRAVEL_TYPES = ['Solo', 'Couple', 'Family', 'Friends'];
const PACES = ['Relaxed', 'Balanced', 'Fast-Paced'];
const INTEREST_OPTIONS = ['History', 'Culture', 'Architecture', 'Nature', 'Wildlife', 'Spiritual', 'Adventure', 'Beach', 'Food', 'Hill Station'];

export const PlannerForm: React.FC<PlannerFormProps> = ({ onSubmit, isLoading }) => {
  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState<TravelPreferences>({
    starting_location: 'New Delhi',
    destination: 'Rajasthan',
    num_days: 4,
    budget: 15000,
    travel_type: 'Friends',
    travel_pace: 'Balanced',
    interests: ['History', 'Culture', 'Food'],
  });

  const toggleInterest = (interest: string) => {
    if (prefs.interests.includes(interest)) {
      setPrefs({ ...prefs, interests: prefs.interests.filter((i) => i !== interest) });
    } else {
      setPrefs({ ...prefs, interests: [...prefs.interests, interest] });
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else onSubmit(prefs);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="max-w-3xl mx-auto glass-panel p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xl relative text-left bg-white">
      {/* Step Indicators */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                s === step
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-110'
                  : s < step
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {s < step ? <CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> : s}
            </div>
            <span className={`text-xs font-extrabold hidden sm:inline ${s === step ? 'text-amber-600' : 'text-slate-400'}`}>
              {s === 1 ? 'Route & Duration' : s === 2 ? 'Budget & Group' : 'Interests'}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-6"
          >
            <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-amber-600" />
                Where are you travelling?
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">Select starting city & target destination state/city</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Starting City
                </label>
                <input
                  type="text"
                  value={prefs.starting_location}
                  onChange={(e) => setPrefs({ ...prefs, starting_location: e.target.value })}
                  placeholder="e.g. New Delhi"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 focus:outline-none focus:border-amber-500 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Destination State or City
                </label>
                <input
                  type="text"
                  value={prefs.destination}
                  onChange={(e) => setPrefs({ ...prefs, destination: e.target.value })}
                  placeholder="e.g. Rajasthan"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 focus:outline-none focus:border-amber-500 text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <span className="block text-xs font-bold text-slate-500 mb-2">Popular Destination Hotspots:</span>
              <div className="flex flex-wrap gap-2">
                {POPULAR_DESTINATIONS.map((dest) => (
                  <button
                    key={dest}
                    type="button"
                    onClick={() => setPrefs({ ...prefs, destination: dest })}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all font-bold ${
                      prefs.destination === dest
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-amber-500/50'
                    }`}
                  >
                    {dest}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  Trip Duration (Days)
                </label>
                <span className="text-amber-600 font-black text-sm">{prefs.num_days} Days</span>
              </div>
              <input
                type="range"
                min={1}
                max={15}
                value={prefs.num_days}
                onChange={(e) => setPrefs({ ...prefs, num_days: parseInt(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-6"
          >
            <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <IndianRupee className="w-6 h-6 text-emerald-600" />
                Budget & Travel Companion Style
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">Set total budget limit & group dynamic</p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Total Estimated Budget</span>
                <span className="text-emerald-600 font-black text-xl">₹{prefs.budget.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={2000}
                max={100000}
                step={1000}
                value={prefs.budget}
                onChange={(e) => setPrefs({ ...prefs, budget: parseInt(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-bold">
                <span>Budget (₹2,000)</span>
                <span>Standard (₹25,000)</span>
                <span>Luxury (₹100,000)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-600" />
                Who are you travelling with?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TRAVEL_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPrefs({ ...prefs, travel_type: type })}
                    className={`py-3 px-4 rounded-2xl font-bold text-xs transition-all border ${
                      prefs.travel_type === type
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20 scale-105'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-amber-600" />
                Preferred Pace
              </label>
              <div className="grid grid-cols-3 gap-3">
                {PACES.map((pace) => (
                  <button
                    key={pace}
                    type="button"
                    onClick={() => setPrefs({ ...prefs, travel_pace: pace })}
                    className={`py-3 px-3 rounded-2xl font-bold text-xs transition-all border ${
                      prefs.travel_pace === pace
                        ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {pace}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-6"
          >
            <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Heart className="w-6 h-6 text-rose-600" />
                Select Your Travel Interests
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">Our 3D weighted AI model matches spots based on selected tags</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {INTEREST_OPTIONS.map((interest) => {
                const isSelected = prefs.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-between border transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span>{interest}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
        {step > 1 ? (
          <button
            type="button"
            onClick={handlePrev}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={handleNext}
          disabled={isLoading}
          className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin" /> Computing 3D Matches...
            </span>
          ) : step < 3 ? (
            <span>Next Step <ArrowRight className="w-4 h-4 inline ms-1" /></span>
          ) : (
            <span><Sparkles className="w-4 h-4 inline me-1.5" /> Generate 3D Trip Matrix</span>
          )}
        </button>
      </div>
    </div>
  );
};
