import React from 'react';

export const Logo = ({ size = 'normal', showSubtitle = true, className = '' }) => {
  const isLarge = size === 'large';
  const isSmall = size === 'small';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Dynamic Animated Logo Badge */}
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 p-0.5 shadow-lg shadow-amber-500/20 group hover:scale-105 transition-transform duration-300 ${isSmall ? 'w-9 h-9' : isLarge ? 'w-16 h-16' : 'w-12 h-12'}`}>
        <div className="w-full h-full bg-ocean-950 rounded-[14px] flex items-center justify-center overflow-hidden relative">
          {/* Flame Gold Glow backdrop */}
          <div className="absolute inset-0 bg-gradient-to-t from-amber-500/30 via-orange-500/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
          
          {/* Logo Icon Graphic: Seafood Hotpot & Beer Cheer */}
          <svg className={`relative z-10 text-gold-400 drop-shadow-[0_2px_4px_rgba(245,158,11,0.5)] ${isSmall ? 'w-5 h-5' : isLarge ? 'w-9 h-9' : 'w-7 h-7'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M8 3v3M16 3v3" stroke="#FBBF24" strokeWidth="1.5" />
            <path d="M4 11h16a1 1 0 0 1 1 1v2a7 7 0 0 1-7 7h-4a7 7 0 0 1-7-7v-2a1 1 0 0 1 1-1z" fill="url(#goldGrad)" stroke="#F59E0B" />
            <path d="M8 18h8" stroke="#EF4444" strokeWidth="2" />
            <circle cx="12" cy="14" r="2" fill="#FBBF24" />
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#D97706" stopOpacity="0.8" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Outer glowing border ring */}
        <span className="absolute -inset-1 rounded-2xl bg-amber-500/20 blur-sm group-hover:bg-amber-400/40 transition-all -z-10"></span>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-wider uppercase font-heading bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)] ${isSmall ? 'text-lg' : isLarge ? 'text-3xl' : 'text-xl'}`}>
            LEM QUÁN
          </span>
          <span className="bg-red-600 text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded tracking-widest shadow-sm uppercase animate-pulse">
            LIVE
          </span>
        </div>
        {showSubtitle && (
          <span className={`tracking-widest uppercase text-amber-200/80 font-bold ${isSmall ? 'text-[9px]' : isLarge ? 'text-xs' : 'text-[10px]'}`}>
            🔥 NHẬU & CHILL • HẢI SẢN 🍺
          </span>
        )}
      </div>
    </div>
  );
};
