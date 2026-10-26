import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-zinc-900 bg-black py-16 text-xs text-zinc-500">
      <div className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <img src="/logo.png" alt="Vidbox" className="h-7 w-auto object-contain mb-4 opacity-80" />
            <p className="leading-relaxed">
              Vidbox is your ultimate streaming guide and cinema discovery hub. Explore thousands of movies, TV series, trailers, and stream in ultra HD.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-12 text-zinc-400">
            <div className="flex flex-col gap-2.5">
              <span className="font-semibold text-zinc-200">Navigation</span>
              <a href="#home" className="hover:text-white transition-colors">Home</a>
              <a href="#tv" className="hover:text-white transition-colors">TV Shows</a>
              <a href="#movies" className="hover:text-white transition-colors">Movies</a>
              <a href="#new" className="hover:text-white transition-colors">New & Popular</a>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="font-semibold text-zinc-200">Legal & Support</span>
              <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#faqs" className="hover:text-white transition-colors">FAQs</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="font-semibold text-zinc-200">Connect</span>
              <a href="https://discord.gg/VGQKGPM9Ej" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Discord Community</a>
              <a href="https://twitter.com/vidbox" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter / X</a>
              <span className="text-zinc-600">v1.0 Clean-Room Clone</span>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-zinc-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-zinc-600">
          <p>© {new Date().getFullYear()} Vidbox Clean-Room Reconstruction. Built with React 18, Vite, TypeScript & Tailwind CSS.</p>
          <p className="mt-2 sm:mt-0">Evidence verified via REA MCP Workflow.</p>
        </div>
      </div>
    </footer>
  );
};
