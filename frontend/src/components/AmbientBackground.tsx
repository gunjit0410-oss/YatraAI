import React from 'react';
import { motion } from 'framer-motion';

export const AmbientBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* 1. Subtle Architectural Dot Grid Pattern */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(#cbd5e1 1.2px, transparent 1.2px)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* 2. Soft Saffron Glowing Mesh Blob Top-Right */}
      <motion.div
        animate={{
          x: [0, 50, -40, 0],
          y: [0, -60, 40, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-40 -right-40 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-amber-300/35 via-orange-200/20 to-transparent blur-3xl"
      />

      {/* 3. Emerald Glowing Mesh Blob Left-Middle */}
      <motion.div
        animate={{
          x: [0, -60, 50, 0],
          y: [0, 50, -50, 0],
          scale: [1, 1.25, 0.85, 1],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-emerald-300/30 via-teal-100/20 to-transparent blur-3xl"
      />

      {/* 4. Warm Gold Mesh Blob Middle-Right */}
      <motion.div
        animate={{
          x: [0, 40, -50, 0],
          y: [0, -40, 60, 0],
          scale: [1, 0.9, 1.15, 1],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-2/3 -right-32 w-[480px] h-[480px] rounded-full bg-gradient-to-bl from-amber-200/30 via-yellow-100/15 to-transparent blur-3xl"
      />

      {/* 5. Sky Blue Mesh Blob Bottom-Left */}
      <motion.div
        animate={{
          x: [0, -30, 40, 0],
          y: [0, -50, 30, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -bottom-32 -left-32 w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-sky-300/25 via-indigo-100/15 to-transparent blur-3xl"
      />

      {/* 6. Rotating Sacred Geometry / Travel Compass SVG Motif (Top-Right) */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
        className="absolute top-20 -right-24 w-96 h-96 opacity-[0.06] text-amber-900"
      >
        <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="100" cy="100" r="90" strokeDasharray="4 4" />
          <circle cx="100" cy="100" r="70" />
          <circle cx="100" cy="100" r="50" strokeDasharray="8 4" />
          <polygon points="100,10 115,85 190,100 115,115 100,190 85,115 10,100 85,85" />
          <circle cx="100" cy="100" r="20" />
        </svg>
      </motion.div>

      {/* 7. Rotating Sacred Geometry Mandala Motif (Bottom-Left) */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 140, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-40 -left-28 w-[450px] h-[450px] opacity-[0.05] text-emerald-900"
      >
        <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="100" cy="100" r="95" strokeDasharray="3 3" />
          <circle cx="100" cy="100" r="80" />
          <path d="M100,5 A95,95 0 0,1 195,100 A95,95 0 0,1 100,195 A95,95 0 0,1 5,100 A95,95 0 0,1 100,5" />
          <rect x="30" y="30" width="140" height="140" transform="rotate(45 100 100)" />
          <rect x="40" y="40" width="120" height="120" />
          <circle cx="100" cy="100" r="30" strokeDasharray="6 3" />
        </svg>
      </motion.div>
    </div>
  );
};
