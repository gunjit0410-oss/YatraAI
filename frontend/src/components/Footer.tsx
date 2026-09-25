import React from 'react';
import { Compass } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="glass-panel bg-white border-t border-slate-200 py-12 px-4 lg:px-8 mt-20 relative z-10 text-left">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white">
              <Compass className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-xl font-black text-slate-900">Yatra<span className="text-amber-600">AI</span></span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            Incredible India Smart Tourism Discovery & Personal AI Travel Planner.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-3">Key Technologies</h4>
          <ul className="text-xs text-slate-600 flex flex-col gap-2 font-semibold">
            <li>React 19 & TypeScript</li>
            <li>Framer Motion & Leaflet Maps</li>
            <li>Swiper.js & Lenis Inertia Scroll</li>
            <li>Gemini 3.6 Flash AI & Offline Engine</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-3">Popular Circuits</h4>
          <ul className="text-xs text-slate-600 flex flex-col gap-2 font-semibold">
            <li>Golden Triangle (Delhi-Jaipur-Agra)</li>
            <li>Kerala Backwaters & Tea Gardens</li>
            <li>Himachal Snow & Pass Treks</li>
            <li>Varanasi & Kedarnath Spiritual Circuit</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Repository</h4>
          <a
            href="https://github.com/gunjit0410-oss/YatraAI"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-amber-600 hover:text-amber-700"
          >
            github.com/gunjit0410-oss/YatraAI
          </a>
          <p className="text-[11px] text-slate-500 font-medium">
            Crafted with passion for Indian Tourism.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-100 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 font-bold gap-2">
        <span>© 2026 YatraAI. All rights reserved.</span>
        <span>Built with React, Framer Motion & Django REST API</span>
      </div>
    </footer>
  );
};
