import React from 'react';
import { Sparkles } from 'lucide-react';
import { MediaItem } from '../types/schema';

interface FourKViewProps {
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
  onPlay?: (item: MediaItem) => void;
}

export const FourKView: React.FC<FourKViewProps> = ({
  items,
  onSelect,
}) => {

  return (
    <div className="mx-auto max-w-[1560px] px-3.5 sm:px-12 pt-16 sm:pt-20 pb-20 select-none animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400"
          >
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>4K Ultra HD & IMAX Remux</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                2160p HDR
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Highest-bitrate 4K UHD masters, Dolby Vision color, and lossless Dolby Atmos audio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-[#18181d] px-3 py-1.5 rounded-xl border border-white/10">
          <span>Target Bitrate:</span>
          <span className="font-bold text-amber-400">80+ Mbps</span>
        </div>
      </div>

      {/* Grid of 4K Titles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pt-8">
        {items.map(item => (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className="group relative cursor-pointer overflow-hidden rounded-xl bg-[#18181d] border border-white/5 hover:border-amber-500/40 transition-all duration-300 hover:scale-105"
          >
            {/* 4K Badges */}
            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500 text-black shadow">
                4K UHD
              </span>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-black/80 text-white backdrop-blur border border-white/20">
                HDR10+
              </span>
            </div>

            <div className="relative aspect-[2/3] w-full">
              <img
                src={item.poster_path || item.backdrop_path}
                alt={item.title || item.name}
                loading="lazy"
                className="h-full w-full object-cover"
              />

              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3">
                <span className="text-xs font-bold text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                  {item.title || item.name}
                </span>
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono mt-0.5">
                  <span className="text-amber-400">★ {item.vote_average.toFixed(1)}</span>
                  <span>•</span>
                  <span>Dolby Atmos</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
