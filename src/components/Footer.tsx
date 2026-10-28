import React from 'react';
import { useAccent } from '../context/AccentContext';

export const Footer: React.FC = () => {
  const { accentHex } = useAccent();

  return (
    <footer className="border-t border-white/10 bg-[#303841] py-16 md-typescale-body-small text-zinc-400">
      <div className="mx-auto max-w-[1560px] px-4 md:px-8 lg:px-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="mb-3 flex items-center gap-2.5">
              <img src="/logo.png" alt="Echora" className="h-6 w-6 object-contain" />
              <span
                className="font-black text-2xl uppercase tracking-wider"
                style={{ fontFamily: "'Bebas Neue', sans-serif", color: accentHex }}
              >
                ECHORA
              </span>
              <span className="md-typescale-label-small font-bold tracking-widest text-zinc-400 uppercase">
                Cinema
              </span>
            </div>
            <p className="leading-relaxed text-zinc-400 md-typescale-body-small">
              A high-performance cinematic streaming platform with multi-provider failover, live TV, manga reader, and watch parties. Built on Google Material 3 Expressive, React 18, TypeScript, Tailwind CSS, TanStack Query, and Zustand.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-12 text-zinc-400 md-typescale-body-small">
            <div className="flex flex-col gap-2.5">
              <span className="font-semibold text-zinc-200">Navigation</span>
              <a href="#home" className="hover:text-white transition-colors">Home</a>
              <a href="#discover" className="hover:text-white transition-colors">Discover</a>
              <a href="#movies" className="hover:text-white transition-colors">Movies</a>
              <a href="#series" className="hover:text-white transition-colors">Series</a>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="font-semibold text-zinc-200">Echora Features</span>
              <a href="#billboard" className="hover:text-white transition-colors">Rotating Billboard</a>
              <a href="#hover" className="hover:text-white transition-colors">Hover Preview Cards</a>
              <a href="#sports" className="hover:text-white transition-colors">Formula 1 & Live Sports</a>
              <a href="#panel" className="hover:text-white transition-colors">Picture & Sound Panel</a>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="font-semibold text-zinc-200">Connect</span>
              <a href="https://github.com/ManuthMethnidu/CuddleCast" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub Repository</a>
              <span className="text-zinc-600">v2.15 Echora Edition</span>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between text-zinc-600">
          <p>© {new Date().getFullYear()} Echora · Next-Gen Cinema & Multi-Provider Streaming Platform.</p>
          <p className="mt-2 sm:mt-0 text-zinc-500">
            Evidence-backed REA inspection from notdxbi/dxbi-stremio.
          </p>
        </div>
      </div>
    </footer>
  );
};
