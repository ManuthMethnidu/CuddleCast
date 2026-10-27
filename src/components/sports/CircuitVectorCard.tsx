import React, { useId } from 'react';
import {
  MapPin,
  Flag,
  RotateCw,
  Trophy,
  Zap,
} from 'lucide-react';

export interface CircuitVectorCardProps {
  circuitName: string;
  country: string;
  lengthKm: string;
  laps: number;
  lapRecord: string;
  recordHolder: string;
  drsZones: number;
  turnsCount?: number;
  className?: string;
}

// High-fidelity vector path geometry for iconic Formula 1 circuits (viewBox 0 0 500 320)
const TRACK_SVGS: Record<
  string,
  {
    d: string;
    s1Point: { x: number; y: number };
    s2Point: { x: number; y: number };
    s3Point: { x: number; y: number };
    startFinish: { x: number; y: number };
    drsZonesCoords: Array<{ x1: number; y1: number; x2: number; y2: number }>;
    defaultTurns: number;
  }
> = {
  monaco: {
    d: 'M 160 250 C 120 250 80 230 75 180 C 70 120 120 80 180 75 C 240 70 290 85 330 70 C 370 55 420 80 435 120 C 445 150 420 190 380 195 C 340 200 320 170 290 175 C 260 180 260 220 230 235 C 200 250 180 250 160 250 Z',
    s1Point: { x: 180, y: 75 },
    s2Point: { x: 420, y: 140 },
    s3Point: { x: 260, y: 200 },
    startFinish: { x: 160, y: 250 },
    drsZonesCoords: [{ x1: 160, y1: 250, x2: 90, y2: 210 }],
    defaultTurns: 19,
  },
  silverstone: {
    d: 'M 120 240 C 90 220 80 160 100 120 C 120 80 170 70 230 85 C 290 100 340 70 380 80 C 420 90 445 130 425 170 C 405 210 370 220 330 200 C 290 180 270 240 230 250 C 190 260 150 260 120 240 Z',
    s1Point: { x: 180, y: 75 },
    s2Point: { x: 395, y: 100 },
    s3Point: { x: 310, y: 215 },
    startFinish: { x: 120, y: 240 },
    drsZonesCoords: [
      { x1: 120, y1: 240, x2: 90, y2: 170 },
      { x1: 340, y1: 75, x2: 410, y2: 105 },
    ],
    defaultTurns: 18,
  },
  monza: {
    d: 'M 90 220 L 390 220 C 440 220 450 180 430 140 C 410 100 360 80 320 80 L 190 80 C 140 80 120 110 100 150 L 90 220 Z',
    s1Point: { x: 280, y: 80 },
    s2Point: { x: 435, y: 145 },
    s3Point: { x: 260, y: 220 },
    startFinish: { x: 90, y: 220 },
    drsZonesCoords: [
      { x1: 120, y1: 220, x2: 360, y2: 220 },
      { x1: 300, y1: 80, x2: 190, y2: 80 },
    ],
    defaultTurns: 11,
  },
  spa: {
    d: 'M 110 240 C 80 200 90 140 120 100 C 160 50 240 60 300 80 C 360 100 420 80 440 130 C 460 180 420 230 360 250 C 300 270 240 250 190 260 C 140 270 130 260 110 240 Z',
    s1Point: { x: 210, y: 65 },
    s2Point: { x: 430, y: 130 },
    s3Point: { x: 280, y: 260 },
    startFinish: { x: 110, y: 240 },
    drsZonesCoords: [
      { x1: 110, y1: 240, x2: 150, y2: 110 },
      { x1: 330, y1: 90, x2: 420, y2: 110 },
    ],
    defaultTurns: 19,
  },
  cota: {
    d: 'M 100 220 C 80 170 90 110 140 80 C 190 50 250 80 300 100 C 350 120 410 90 430 140 C 450 190 400 240 340 240 C 280 240 250 190 200 200 C 150 210 120 250 100 220 Z',
    s1Point: { x: 220, y: 70 },
    s2Point: { x: 415, y: 120 },
    s3Point: { x: 280, y: 230 },
    startFinish: { x: 100, y: 220 },
    drsZonesCoords: [
      { x1: 100, y1: 220, x2: 130, y2: 100 },
      { x1: 320, y1: 110, x2: 410, y2: 100 },
    ],
    defaultTurns: 20,
  },
  mexico: {
    d: 'M 110 230 L 370 230 C 420 230 440 190 420 150 C 400 110 360 90 310 90 L 180 90 C 130 90 100 120 90 160 L 110 230 Z',
    s1Point: { x: 250, y: 90 },
    s2Point: { x: 420, y: 160 },
    s3Point: { x: 240, y: 230 },
    startFinish: { x: 110, y: 230 },
    drsZonesCoords: [
      { x1: 130, y1: 230, x2: 350, y2: 230 },
      { x1: 290, y1: 90, x2: 190, y2: 90 },
    ],
    defaultTurns: 17,
  },
};

/**
 * CircuitVectorCard renders an interactive high-contrast vector circuit diagram
 * with sector markers, DRS activation zones, track length, and lap records.
 */
export const CircuitVectorCard: React.FC<CircuitVectorCardProps> = ({
  circuitName,
  country,
  lengthKm,
  laps,
  lapRecord,
  recordHolder,
  drsZones,
  turnsCount,
  className = '',
}) => {
  const gradientId = useId();

  // Match circuit geometry or default to Monaco / Mexico
  const lowerName = circuitName.toLowerCase();
  let selectedCircuitKey = 'monaco';
  if (lowerName.includes('silverstone') || lowerName.includes('britain')) {
    selectedCircuitKey = 'silverstone';
  } else if (lowerName.includes('monza') || lowerName.includes('italy')) {
    selectedCircuitKey = 'monza';
  } else if (lowerName.includes('spa') || lowerName.includes('belgium')) {
    selectedCircuitKey = 'spa';
  } else if (lowerName.includes('cota') || lowerName.includes('americas')) {
    selectedCircuitKey = 'cota';
  } else if (lowerName.includes('mexic') || lowerName.includes('rodriguez')) {
    selectedCircuitKey = 'mexico';
  }

  const trackData = TRACK_SVGS[selectedCircuitKey] || TRACK_SVGS.monaco;
  const turns = turnsCount || trackData.defaultTurns;

  return (
    <div
      role="region"
      aria-label={`Circuit Layout and Specifications for ${circuitName}`}
      className={`bg-[#353f49] text-white rounded-xl border border-white/10 p-4 shadow-xl select-none ${className}`}
    >
      {/* Circuit Header */}
      <div className="flex items-start justify-between pb-3 mb-3 border-b border-white/10">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            <Flag className="h-4 w-4 text-[#0070F3]" />
            {circuitName}
          </h3>
          <div className="flex items-center gap-1 text-xs text-zinc-400 mt-0.5">
            <MapPin className="h-3 w-3 text-zinc-400" />
            <span>{country}</span>
          </div>
        </div>

        {/* DRS Zones Badge */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0070F3]/15 text-[#0070F3] border border-[#0070F3]/30 text-xs font-mono font-semibold">
          <Zap className="h-3.5 w-3.5 fill-current" />
          <span>{drsZones} DRS ZONES</span>
        </div>
      </div>

      {/* SVG Circuit Vector Layout Canvas */}
      <div className="relative w-full aspect-[5/3] bg-[#303841] rounded-lg border border-white/5 overflow-hidden flex items-center justify-center p-2 mb-3 group">
        <svg
          viewBox="0 0 500 320"
          className="w-full h-full max-h-56 filter drop-shadow-[0_0_12px_rgba(0,112,243,0.3)] transition-transform duration-300 group-hover:scale-[1.02]"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0070F3" />
              <stop offset="50%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
            <filter id={`glow-${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Circuit Guideline */}
          <path
            d={trackData.d}
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Neon Active Track Layout Path */}
          <path
            d={trackData.d}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#glow-${gradientId})`}
          />

          {/* DRS Activation Zones (Cyan Dashed Glow) */}
          {trackData.drsZonesCoords.map((drs, idx) => (
            <line
              key={idx}
              x1={drs.x1}
              y1={drs.y1}
              x2={drs.x2}
              y2={drs.y2}
              stroke="#00F0FF"
              strokeWidth="6"
              strokeDasharray="6 4"
              strokeLinecap="round"
              className="animate-pulse"
            />
          ))}

          {/* Sector 1 Marker */}
          <g transform={`translate(${trackData.s1Point.x}, ${trackData.s1Point.y})`}>
            <circle r="7" fill="#A855F7" />
            <text
              y="3"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="8"
              fontWeight="bold"
              fontFamily="monospace"
            >
              S1
            </text>
          </g>

          {/* Sector 2 Marker */}
          <g transform={`translate(${trackData.s2Point.x}, ${trackData.s2Point.y})`}>
            <circle r="7" fill="#22C55E" />
            <text
              y="3"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="8"
              fontWeight="bold"
              fontFamily="monospace"
            >
              S2
            </text>
          </g>

          {/* Sector 3 Marker */}
          <g transform={`translate(${trackData.s3Point.x}, ${trackData.s3Point.y})`}>
            <circle r="7" fill="#EAB308" />
            <text
              y="3"
              textAnchor="middle"
              fill="#000000"
              fontSize="8"
              fontWeight="bold"
              fontFamily="monospace"
            >
              S3
            </text>
          </g>

          {/* Start / Finish Line */}
          <g transform={`translate(${trackData.startFinish.x}, ${trackData.startFinish.y})`}>
            <rect x="-3" y="-12" width="6" height="24" fill="#FFFFFF" rx="1" />
            <circle r="3" fill="#EF4444" />
          </g>
        </svg>

        {/* Legend Overlay at corner */}
        <div className="absolute bottom-2 left-2 flex items-center gap-2 text-[10px] font-mono px-2 py-1 rounded bg-black/60 backdrop-blur-xs border border-white/10 text-zinc-300">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#A855F7]" /> S1
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#22C55E]" /> S2
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#EAB308]" /> S3
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded bg-cyan-400" /> DRS
          </span>
        </div>
      </div>

      {/* Circuit Metadata Specs Grid */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div className="bg-[#303841] p-2 rounded-lg border border-white/5">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
            LENGTH
          </span>
          <span className="text-xs sm:text-sm font-mono font-bold text-white">
            {lengthKm}
          </span>
        </div>

        <div className="bg-[#303841] p-2 rounded-lg border border-white/5">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
            RACE LAPS
          </span>
          <span className="text-xs sm:text-sm font-mono font-bold text-white flex items-center justify-center gap-1">
            <RotateCw className="h-3 w-3 text-zinc-400" />
            {laps}
          </span>
        </div>

        <div className="bg-[#303841] p-2 rounded-lg border border-white/5">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
            TURNS
          </span>
          <span className="text-xs sm:text-sm font-mono font-bold text-white">
            {turns}
          </span>
        </div>
      </div>

      {/* Lap Record Footer */}
      <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Trophy className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-[11px] font-medium">Lap Record:</span>
        </div>
        <div className="text-right">
          <span className="font-mono font-bold text-white text-xs">{lapRecord}</span>
          <span className="text-[11px] text-zinc-400 ml-1.5">({recordHolder})</span>
        </div>
      </div>
    </div>
  );
};
