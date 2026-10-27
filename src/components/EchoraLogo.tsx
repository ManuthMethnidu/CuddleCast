import React from 'react';
import { useAccent } from '../context/AccentContext';

interface EchoraLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const EchoraLogo: React.FC<EchoraLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
}) => {
  const { accentHex, accentGlow } = useAccent();

  const heightClass = {
    sm: 'h-6 sm:h-7',
    md: 'h-8 sm:h-9',
    lg: 'h-11 sm:h-12',
  }[size];

  const fontSize = {
    sm: 'text-lg sm:text-xl',
    md: 'text-2xl sm:text-3xl',
    lg: 'text-3xl sm:text-4xl',
  }[size];

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Resonant Wave Emblem */}
      <div className="relative flex items-center justify-center flex-shrink-0">
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${heightClass} w-auto aspect-square`}
          style={{ filter: `drop-shadow(0 0 10px ${accentGlow})` }}
        >
          <defs>
            <linearGradient id="echoraIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={accentHex} />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
          </defs>

          {/* Disc backing */}
          <circle cx="24" cy="24" r="22" fill="#303841" stroke="#3A4750" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="20" fill="url(#echoraIconGrad)" fillOpacity="0.2" />

          {/* Concentric Sonic / Light Resonance Waves */}
          <path
            d="M 12 24 A 12 12 0 0 1 36 24"
            stroke="url(#echoraIconGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M 17 24 A 7 7 0 0 1 31 24"
            stroke="#F3F3F3"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeOpacity="0.9"
          />

          {/* Central Play Beacon */}
          <polygon points="21,18 31,24 21,30" fill="#F3F3F3" />
          <circle cx="24" cy="36" r="2.5" fill={accentHex} />
        </svg>
      </div>

      {/* Wordmark in Bebas Neue / Inter */}
      <div className="flex flex-col leading-none">
        <div className={`flex items-center tracking-wider font-black ${fontSize}`} style={{ fontFamily: "'Bebas Neue', 'Inter', sans-serif" }}>
          <span className="text-[#F3F3F3] drop-shadow-[0_2px_8px_rgba(243,243,243,0.25)]">
            ECH
          </span>
          <span
            style={{
              color: accentHex,
              textShadow: `0 0 12px ${accentGlow}`,
            }}
          >
            ORA
          </span>
        </div>
        {showTagline && (
          <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-[#F3F3F3]/70 font-bold mt-0.5">
            Next-Gen Cinema
          </span>
        )}
      </div>
    </div>
  );
};

export const CuddleCastLogo = EchoraLogo;
