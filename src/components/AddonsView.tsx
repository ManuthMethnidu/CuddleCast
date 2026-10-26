import React, { useState } from 'react';
import { Blocks, Check, ExternalLink, Settings as SettingsIcon, ShieldCheck } from 'lucide-react';
import { useAccent } from '../context/AccentContext';

interface Addon {
  id: string;
  name: string;
  version: string;
  category: 'Official' | 'Streams' | 'Subtitles' | 'Catalogs' | 'Anime';
  description: string;
  installed: boolean;
  author: string;
}

const DEFAULT_ADDONS: Addon[] = [
  {
    id: 'cinemeta',
    name: 'Cinemeta (Official)',
    version: 'v3.0.12',
    category: 'Official',
    description: 'Official metadata provider for movies, series, cast, ratings, and artwork.',
    installed: true,
    author: 'Stremio Official',
  },
  {
    id: 'torrentio',
    name: 'Torrentio [Real-Debrid]',
    version: 'v1.0.8',
    category: 'Streams',
    description: 'Scrapes multiple torrent providers with cached Real-Debrid instant streaming and 4K HDR sources.',
    installed: true,
    author: 'TheBeast',
  },
  {
    id: 'cyberflix',
    name: 'CyberFlix Catalog',
    version: 'v1.4.2',
    category: 'Catalogs',
    description: 'Curated catalogs from Netflix, Disney+, Apple TV+, HBO Max, and Amazon Prime.',
    installed: true,
    author: 'CyberFlix Community',
  },
  {
    id: 'opensubtitles',
    name: 'OpenSubtitles v3',
    version: 'v3.1.0',
    category: 'Subtitles',
    description: 'Official multi-language subtitle provider with automatic hash synchronization.',
    installed: true,
    author: 'OpenSubtitles.org',
  },
  {
    id: 'kitsu',
    name: 'Anime Kitsu',
    version: 'v2.2.1',
    category: 'Anime',
    description: 'Anime metadata and episode listings integrated with Kitsu and AniList community ratings.',
    installed: true,
    author: 'Anime Community',
  },
];

export const AddonsView: React.FC = () => {
  const { accentHex } = useAccent();
  const [addons, setAddons] = useState<Addon[]>(DEFAULT_ADDONS);

  const toggleInstall = (id: string) => {
    setAddons(prev =>
      prev.map(a => (a.id === id ? { ...a, installed: !a.installed } : a))
    );
  };

  return (
    <div className="mx-auto max-w-[1560px] px-3.5 sm:px-12 pt-16 sm:pt-20 pb-20 select-none animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Blocks className="h-6 w-6" style={{ color: accentHex }} />
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Installed Addons
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Manage your Stremio catalogs, stream scrapers, and subtitle providers
            </p>
          </div>
        </div>

        <a
          href="https://stremio-addons.netlify.app"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all border border-white/15 self-start sm:self-auto"
        >
          <span>Community Directory</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
        {addons.map(addon => (
          <div
            key={addon.id}
            className="flex flex-col justify-between p-5 rounded-2xl border border-white/10 bg-[#18181d] space-y-4 hover:border-white/20 transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {addon.name}
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-mono text-zinc-300">
                  {addon.version}
                </span>
              </div>

              <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/5 text-zinc-400">
                {addon.category} · by {addon.author}
              </span>

              <p className="text-xs text-zinc-300 leading-relaxed mt-2.5">
                {addon.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <button
                onClick={() => alert(`Settings configured for ${addon.name}`)}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <SettingsIcon className="h-3.5 w-3.5" />
                <span>Configure</span>
              </button>

              <button
                onClick={() => toggleInstall(addon.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  addon.installed
                    ? 'bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-zinc-200'
                    : 'bg-white text-black hover:bg-white/80'
                }`}
              >
                {addon.installed ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Installed</span>
                  </>
                ) : (
                  <span>Install Addon</span>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
