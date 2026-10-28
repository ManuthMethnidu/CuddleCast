import React from 'react';
import {
  X,
  Home,
  Trophy,
  BookOpen,
  Tv,
  Tv2,
  Radio,
  Compass,
  Film,
  Sparkles,
  Heart,
  Clock,
  Layers,
  Check,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { useSettingsStore, DEFAULT_NAV_ITEMS } from '../store/settingsStore';
import { useAccent } from '../context/AccentContext';

export interface NavbarItemDef {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description: string;
}

export const ALL_NAV_ITEMS: NavbarItemDef[] = [
  {
    id: 'all',
    label: 'Home',
    icon: Home,
    description: 'Hero billboard, curated carousels, and latest releases',
  },
  {
    id: 'sports',
    label: 'Sports',
    icon: Trophy,
    badge: 'LIVE',
    description: 'Live Formula 1, MotoGP, telemetry hud, and global sports feeds',
  },
  {
    id: 'manga',
    label: 'Manga',
    icon: BookOpen,
    badge: 'HOT',
    description: 'MangaDex chapter reader with high-speed caching',
  },
  {
    id: 'anime',
    label: 'Anime',
    icon: Tv,
    description: 'Simulcasts, seasonal anime, and trending series',
  },
  {
    id: 'live-tv',
    label: 'Live TV',
    icon: Tv2,
    description: 'Over 8,000 global IPTV broadcast streams',
  },
  {
    id: 'radio',
    label: 'Radio',
    icon: Radio,
    badge: '3D',
    description: 'Interactive 3D Earth globe with 35,000+ live stations',
  },
  {
    id: 'discover',
    label: 'Discover',
    icon: Compass,
    description: 'Browse by genres, ratings, countries, and networks',
  },
  {
    id: 'library',
    label: 'Library',
    icon: Film,
    description: 'Your watchlist, favorites, and continue watching queue',
  },
  {
    id: '4k',
    label: '4K Ultra HD',
    icon: Sparkles,
    badge: 'UHD',
    description: 'Curated 4K HDR and high-bitrate cinema collection',
  },
  {
    id: 'drama',
    label: 'Asian Drama',
    icon: Heart,
    description: 'K-Dramas, J-Dramas, and East Asian drama series',
  },
  {
    id: 'history',
    label: 'History',
    icon: Clock,
    description: 'Recently watched episodes and playback positions',
  },
  {
    id: 'addons',
    label: 'Addons',
    icon: Layers,
    description: 'Custom scraper sources, extensions, and plugins',
  },
];

interface NavbarCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NavbarCustomizerModal: React.FC<NavbarCustomizerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { accentHex } = useAccent();
  const {
    enabledNavItems = DEFAULT_NAV_ITEMS,
    toggleNavItem,
    setEnabledNavItems,
  } = useSettingsStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fadeIn select-none">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-[#303841] border border-white/15 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#353f49]/80">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-2xl shadow"
              style={{ backgroundColor: `${accentHex}25`, color: accentHex }}
            >
              <Sliders className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Navbar Settings & Customizer</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Choose which categories appear in your top navigation bar.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Permanent Anchors Notice */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-3.5 flex items-center justify-between gap-3 text-xs text-zinc-300">
            <div className="flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-emerald-400" />
              <span>
                <strong>Fixed Anchors:</strong> Menu drawer, Echora logo, Search bar, and Profile account menu remain permanently docked.
              </span>
            </div>
            <button
              onClick={() => setEnabledNavItems(DEFAULT_NAV_ITEMS)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-[11px] font-bold transition-all shrink-0"
              title="Reset to default 8 nav tabs"
            >
              <RotateCcw className="size-3" />
              Reset Defaults
            </button>
          </div>

          {/* Nav Items Checkbox Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Visible Top Bar Categories ({enabledNavItems.length} Selected)
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                Click category to show/hide in top bar
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ALL_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isChecked = enabledNavItems.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleNavItem(item.id)}
                    className={`flex items-start gap-3 p-3 rounded-2xl border text-left transition-all group ${
                      isChecked
                        ? 'bg-white/[0.08] border-white/20 shadow-sm'
                        : 'bg-black/20 border-white/5 opacity-60 hover:opacity-100 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div
                      className={`size-8 rounded-xl grid place-items-center shrink-0 transition-colors ${
                        isChecked
                          ? 'bg-white/15 text-white'
                          : 'bg-white/5 text-zinc-500 group-hover:text-zinc-300'
                      }`}
                      style={{
                        backgroundColor: isChecked ? `${accentHex}25` : undefined,
                        color: isChecked ? accentHex : undefined,
                      }}
                    >
                      <Icon className="size-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-white/10 text-zinc-300">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    </div>

                    <div
                      className={`size-5 rounded-lg border grid place-items-center transition-all shrink-0 mt-0.5 ${
                        isChecked
                          ? 'border-transparent text-white'
                          : 'border-white/20 bg-transparent'
                      }`}
                      style={{
                        backgroundColor: isChecked ? accentHex : undefined,
                      }}
                    >
                      {isChecked && <Check className="size-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Preview Bar */}
          <div className="rounded-2xl bg-black/40 border border-white/10 p-3.5 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
              Navbar Live Preview
            </span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {ALL_NAV_ITEMS.filter((item) => enabledNavItems.includes(item.id)).map(
                (item, idx) => {
                  const Icon = item.icon;
                  return (
                    <span
                      key={item.id}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                        idx === 0
                          ? 'bg-white/20 text-white shadow'
                          : 'bg-white/5 text-zinc-400'
                      }`}
                    >
                      <Icon className="size-3.5" />
                      <span>{item.label}</span>
                    </span>
                  );
                }
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#353f49]/80 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full font-bold text-xs text-white bg-white/10 hover:bg-white/20 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavbarCustomizerModal;
