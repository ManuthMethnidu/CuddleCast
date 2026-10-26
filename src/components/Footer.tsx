import React from 'react';
import { CuddleCastLogo } from './CuddleCastLogo';
import { Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-900 bg-[#05080f] py-16 text-xs text-slate-500">
      <div className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="mb-4">
              <CuddleCastLogo size="sm" showTagline />
            </div>
            <p className="leading-relaxed text-slate-400">
              CuddleCast is your premier cinematic streaming universe. Explore thousands of movies, TV series, trailers, and stream cozy originals together in pristine 4K Ultra HD.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-12 text-slate-400">
            <div className="flex flex-col gap-2.5">
              <span className="font-semibold text-slate-200">Navigation</span>
              <a href="#home" className="hover:text-sky-300 transition-colors">Home</a>
              <a href="#tv" className="hover:text-sky-300 transition-colors">TV Shows</a>
              <a href="#movies" className="hover:text-sky-300 transition-colors">Movies</a>
              <a href="#new" className="hover:text-sky-300 transition-colors">New & Popular</a>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="font-semibold text-slate-200">Features</span>
              <a href="#watch-party" className="hover:text-sky-300 transition-colors flex items-center gap-1.5">
                <span>Watch Party</span>
                <Sparkles className="h-3 w-3 text-sky-400" />
              </a>
              <a href="#my-list" className="hover:text-sky-300 transition-colors">My Watchlist</a>
              <a href="#continue" className="hover:text-sky-300 transition-colors">Continue Watching</a>
              <a href="#profiles" className="hover:text-sky-300 transition-colors">Multi-Profile Sync</a>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="font-semibold text-slate-200">Connect & Source</span>
              <a href="https://github.com/ManuthMethnidu/CuddleCast" target="_blank" rel="noopener noreferrer" className="hover:text-sky-300 transition-colors">GitHub Repository</a>
              <a href="https://discord.gg/VGQKGPM9Ej" target="_blank" rel="noopener noreferrer" className="hover:text-sky-300 transition-colors">Discord Community</a>
              <span className="text-slate-600">v2.0 Theme Blue Edition</span>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-900/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-600 text-xs">
          <p className="flex items-center gap-1.5">
            <span>© {new Date().getFullYear()} CuddleCast. Crafted with</span>
            <Heart className="h-3.5 w-3.5 fill-sky-400 text-sky-400" />
            <span>for cozy cinephiles everywhere.</span>
          </p>
          <p className="mt-2 sm:mt-0 text-slate-500">
            Powered by React 18, Vite, TypeScript, Tailwind CSS & Supabase.
          </p>
        </div>
      </div>
    </footer>
  );
};
