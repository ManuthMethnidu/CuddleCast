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
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Echora Logo Emblem (Uploaded Main Logo) */}
      <div className="relative flex items-center justify-center flex-shrink-0">
        <img
          src="/logo.png"
          alt="Echora"
          className={`${heightClass} w-auto aspect-square object-contain transition-transform duration-300 hover:scale-105`}
          style={{ filter: `drop-shadow(0 0 12px ${accentGlow})` }}
        />
      </div>

      {/* Wordmark in Bebas Neue / Roboto / Inter */}
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
