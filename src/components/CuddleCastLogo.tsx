import React from 'react';

interface CuddleCastLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const CuddleCastLogo: React.FC<CuddleCastLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
}) => {
  const heightClass = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-12',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Glowing CuddleCast Emblem */}
      <div className="relative flex items-center justify-center">
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${heightClass} w-auto aspect-square drop-shadow-[0_0_12px_rgba(56,189,248,0.65)]`}
        >
          <defs>
            <linearGradient id="cuddleGradientPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="45%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
            <linearGradient id="cuddleGradientSecondary" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#67E8F9" />
              <stop offset="60%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Ambient background soft disc */}
          <circle cx="24" cy="24" r="22" fill="#0B132B" stroke="#1E293B" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="20" fill="url(#cuddleGradientPrimary)" fillOpacity="0.12" />

          {/* Cast Radial Signal Waves (Intertwined Cuddle Arcs) */}
          <path
            d="M 12 34 C 10 24, 16 14, 25 11 C 32 8, 38 13, 38 18 C 38 23, 33 27, 28 29"
            stroke="url(#cuddleGradientSecondary)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#softGlow)"
          />
          <path
            d="M 16 36 C 22 40, 31 38, 35 33 C 39 28, 38 20, 33 16"
            stroke="url(#cuddleGradientPrimary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Center Play Beacon Triangle */}
          <polygon
            points="21,17 32,24 21,31"
            fill="#FFFFFF"
            filter="drop-shadow(0 0 6px rgba(56, 189, 248, 0.9))"
          />

          {/* Pulse Signal Dot */}
          <circle cx="36" cy="12" r="2.5" fill="#38BDF8" className="animate-pulse" />
        </svg>
      </div>

      {/* Modern Gradient Typography */}
      <div className="flex flex-col">
        <div className="flex items-center tracking-tight font-black leading-none text-xl sm:text-2xl">
          <span className="text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
            Cuddle
          </span>
          <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]">
            Cast
          </span>
        </div>
        {showTagline && (
          <span className="text-[9px] uppercase tracking-widest text-sky-300/80 font-bold -mt-0.5">
            Stream Together
          </span>
        )}
      </div>
    </div>
  );
};
