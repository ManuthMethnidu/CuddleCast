import React from 'react';
import { useAccent } from '../context/AccentContext';

export const Footer: React.FC = () => {
  const { accentHex } = useAccent();

  return (
    <footer className="border-t border-white/10 bg-[#0b0b0d] py-16 text-xs text-zinc-500">
      <div className="mx-auto max-w-[1560px] px-4 md:px-8 lg:px-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="mb-3 flex items-center gap-2">
              <span
                className="font-black text-2xl uppercase tracking-wider"
                style={{ fontFamily: "'Bebas Neue', sans-serif", color: accentHex }}
              >
                DX.BI
              </span>
              <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                CuddleCast
              </span>
            </div>
            <p className="leading-relaxed text-zinc-400">
              A cinematic, Netflix-inspired interface for movies, series, and streaming. Built with React 18, TypeScript, Tailwind CSS, HLS.js, and Supabase.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-12 text-zinc-400">
            <div className="flex flex-col gap-2.5">
              <span className="font-semibold text-zinc-200">Navigation</span>
              <a href="#home" className="hover:text-white transition-colors">Home</a>
              <a href="#discover" className="hover:text-white transition-colors">Discover</a>
              <a href="#movies" className="hover:text-white transition-colors">Movies</a>
              <a href="#series" className="hover:text-white transition-colors">Series</a>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="font-semibold text-zinc-200">DX.BI Features</span>
              <a href="#billboard" className="hover:text-white transition-colors">Rotating Billboard</a>
              <a href="#hover" className="hover:text-white transition-colors">Hover Preview Cards</a>
              <a href="#party" className="hover:text-white transition-colors">Encrypted Watch Party</a>
              <a href="#panel" className="hover:text-white transition-colors">Picture & Sound Panel</a>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="font-semibold text-zinc-200">Connect</span>
              <a href="https://github.com/ManuthMethnidu/CuddleCast" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub Repository</a>
              <a href="https://discord.gg/nnVBjqZ84F" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Discord Community</a>
              <span className="text-zinc-600">v2.15 Clean-Room 1:1 Edition</span>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between text-zinc-600">
          <p>© {new Date().getFullYear()} CuddleCast · DX.BI 1:1 Clean-Room Reconstruction.</p>
          <p className="mt-2 sm:mt-0 text-zinc-500">
            Evidence-backed REA inspection from notdxbi/dxbi-stremio.
          </p>
        </div>
      </div>
    </footer>
  );
};
