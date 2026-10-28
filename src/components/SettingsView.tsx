import React, { useState } from 'react';
import {
  ArrowLeft,
  Gauge,
  Zap,
  Check,
  Tv,
  Film,
  Volume2,
  ShieldCheck,
  Trash2,
  LogOut,
  LogIn,
  RotateCcw,
  Sparkles,
  ArrowLeftRight,
  UserCog,
  Sliders,
} from 'lucide-react';
import { useAccent } from '../context/AccentContext';
import { useSettingsStore, PerformanceMode, DEFAULT_NAV_ITEMS } from '../store/settingsStore';
import { ALL_NAV_ITEMS } from './NavbarCustomizerModal';
import { STREAM_PROVIDERS } from '../services/providers';
import { authStorage } from '../services/storage';
import { useUser, useClerk, useSessionList } from '@clerk/react';

interface SettingsViewProps {
  onBack?: () => void;
  onNavigateLogin?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onBack,
  onNavigateLogin,
}) => {
  const { accentHex } = useAccent();
  const settings = useSettingsStore();
  const { isSignedIn, user } = useUser();
  const { signOut, openUserProfile, openSignIn, setActive } = useClerk();
  const { sessions } = useSessionList();

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    window.setTimeout(() => setNotification(null), 3000);
  };

  const handleClearHistory = () => {
    authStorage.clearProgress();
    showNotification('Watch history cleared successfully');
  };

  const handleClearWatchlist = () => {
    authStorage.clearWatchlist();
    showNotification('Watchlist cleared successfully');
  };

  const handleResetSettings = () => {
    settings.resetToDefaults();
    showNotification('All settings restored to factory defaults');
  };

  const performanceModes: {
    id: PerformanceMode;
    title: string;
    badge: string;
    tagline: string;
    description: string;
    optimizations: string[];
  }[] = [
    {
      id: 'low',
      title: 'Low (Max Performance / Potato Mode)',
      badge: 'Zero Lag · Potato Mode',
      tagline: 'Strips down site for absolute raw FPS and 0ms latency',
      description:
        'Strips down GPU blurs, animations, CSS transitions, hover scale recalculations, and background trailer decoding. Delivers maximum 120 FPS on potato devices, older laptops, battery-saving mode, or slow connections.',
      optimizations: [
        'Disabled all backdrop blurs & glassmorphism filters',
        'Disabled all CSS animations and layout transitions',
        'Disabled hover transforms & expensive rasterization shadows',
        'Disabled billboard background video trailer decoding',
        'Direct static fast rendering on all cards & pages',
      ],
    },
    {
      id: 'medium',
      title: 'Medium (Balanced)',
      badge: 'Smooth · Battery Saver',
      tagline: 'Balanced 60 FPS performance with lightweight blurs',
      description:
        'Balanced performance for smooth everyday streaming. Uses lightweight 8px blurs and short 150ms transitions while keeping CPU & battery consumption low.',
      optimizations: [
        'Lightweight 8px backdrop blurs',
        'Fast 150ms transition timings',
        'Optimized background trailer buffer limit',
        'Subtle elevation shadows',
      ],
    },
    {
      id: 'high',
      title: 'High (Cinematic Quality)',
      badge: 'Ultra · Cinematic Fidelity',
      tagline: 'Full visual richness with real-time blur and glow',
      description:
        'The complete premium Echora cinematic visual experience with multi-layer 24px+ backdrop blurs, animated scaling, ambient lighting, smooth Ken Burns zoom, and trailer previews.',
      optimizations: [
        'Full multi-layered 24px+ backdrop blurs & glassmorphism',
        'Rich ambient lighting & glowing color highlights',
        'Interactive card hover zoom & lift effects',
        'Cinematic Ken Burns billboard zoom & video trailer preview',
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-[1300px] px-4 sm:px-8 lg:px-12 pt-16 sm:pt-20 pb-28 select-none animate-fadeIn">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-20 right-4 sm:right-12 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/90 text-white text-xs font-bold shadow-2xl backdrop-blur-md animate-fadeIn">
          <Check className="h-4 w-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header Row with Back Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-all active:scale-95"
              title="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Settings & Preferences
              </h1>
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-widest text-black"
                style={{ background: accentHex }}
              >
                v2.15
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Configure system performance, cloud streaming providers, playback engine, and account
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <ShieldCheck className="h-4 w-4" />
          <span>Settings Saved Automatically</span>
        </div>
      </div>

      <div className="space-y-10 pt-8">
        {/* ========================================================
            1. SYSTEM PERFORMANCE SETTING (Low / Medium / High)
           ======================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 border border-white/10"
                style={{ color: accentHex }}
              >
                <Gauge className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  System Performance Mode
                </h2>
                <p className="text-xs text-zinc-400">
                  Select your desired balance between visual fidelity and raw FPS rendering performance
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-zinc-400 hidden sm:inline">
              Active: <b style={{ color: accentHex }}>{settings.performanceMode.toUpperCase()}</b>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {performanceModes.map((mode) => {
              const isSelected = settings.performanceMode === mode.id;
              return (
                <div
                  key={mode.id}
                  onClick={() => {
                    settings.setPerformanceMode(mode.id);
                    showNotification(`Switched to ${mode.title.split(' ')[0]} performance mode`);
                  }}
                  className={`group relative flex flex-col justify-between p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white/15 border-white/40 ring-2 shadow-xl'
                      : 'bg-[#18181d] border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                  style={{
                    borderColor: isSelected ? accentHex : undefined,
                  }}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                          {mode.id === 'low' ? (
                            <Zap className="h-4 w-4 text-amber-400" />
                          ) : mode.id === 'medium' ? (
                            <Gauge className="h-4 w-4 text-blue-400" />
                          ) : (
                            <Sparkles className="h-4 w-4 text-purple-400" />
                          )}
                          {mode.id.toUpperCase()}
                        </span>
                        <span className="text-[11px] font-semibold text-zinc-400 mt-0.5">
                          {mode.tagline}
                        </span>
                      </div>

                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all ${
                          isSelected
                            ? 'bg-white text-black border-white shadow-md'
                            : 'border-white/20 bg-white/5 text-transparent'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    </div>

                    <span
                      className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: isSelected ? `${accentHex}30` : 'rgba(255,255,255,0.06)',
                        color: isSelected ? accentHex : '#94a3b8',
                      }}
                    >
                      {mode.badge}
                    </span>

                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {mode.description}
                    </p>

                    <div className="pt-2 border-t border-white/10 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1.5">
                        Optimizations Applied:
                      </span>
                      {mode.optimizations.map((opt, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-400">
                          <span className="text-emerald-400 text-xs leading-none">✓</span>
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-mono text-[11px]">
                      {mode.id === 'low' ? '120 FPS / Low-End' : mode.id === 'medium' ? '60 FPS / Balanced' : 'Full HD / Cinematic'}
                    </span>
                    <button
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-white text-black shadow-md'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {isSelected ? 'Active' : 'Select'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================
            2. CLOUD STREAMING ENGINE & SERVERS
           ======================================================== */}
        <section className="space-y-4 border-t border-white/10 pt-8">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 border border-white/10"
              style={{ color: accentHex }}
            >
              <Film className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Streaming Engine & Cloud Providers
              </h2>
              <p className="text-xs text-zinc-400">
                Configure primary scraper networks, target video resolution, and audio preferences
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#18181d] border border-white/10 space-y-2">
              <label className="text-xs font-bold text-white block uppercase tracking-wider">
                Default Primary Provider
              </label>
              <select
                value={settings.defaultProvider}
                onChange={(e) => {
                  settings.setDefaultProvider(e.target.value);
                  showNotification('Default streaming provider updated');
                }}
                className="w-full bg-[#242c33] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-white transition-colors"
              >
                {STREAM_PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#18181d]">
                    {p.name} {p.badge ? `(${p.badge})` : ''}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-zinc-400">
                Primary embed scraper automatically loaded when you click "Play Now" on any title.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#18181d] border border-white/10 space-y-2">
              <label className="text-xs font-bold text-white block uppercase tracking-wider">
                Target Playback Resolution
              </label>
              <select
                value={settings.defaultQuality}
                onChange={(e) => {
                  settings.setDefaultQuality(e.target.value as any);
                  showNotification('Playback resolution preference updated');
                }}
                className="w-full bg-[#242c33] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-white transition-colors"
              >
                <option value="auto" className="bg-[#18181d]">Auto (Adaptive Bitrate - Recommended)</option>
                <option value="4k" className="bg-[#18181d]">4K UHD (2160p Master Stream)</option>
                <option value="1080p" className="bg-[#18181d]">1080p Full HD</option>
                <option value="720p" className="bg-[#18181d]">720p HD</option>
              </select>
              <p className="text-[11px] text-zinc-400">
                Instructs cloud providers to prioritize your requested resolution when available.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================
            3. BROWSING & INTERFACE EXPERIENCE
           ======================================================== */}
        <section className="space-y-4 border-t border-white/10 pt-8">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 border border-white/10"
              style={{ color: accentHex }}
            >
              <Tv className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Browsing & Interface Features
              </h2>
              <p className="text-xs text-zinc-400">
                Toggle home catalog features, metadata displays, and rating pills
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#18181d] border border-white/10">
              <div className="pr-4">
                <p className="font-bold text-xs text-white">Billboard Trailer Autoplay</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Play silent trailer preview in the hero banner after 1.5s idle
                </p>
              </div>
              <md-switch
                selected={settings.billboard}
                onClick={() => {
                  settings.setBillboard(!settings.billboard);
                  showNotification('Billboard trailer preference updated');
                }}
              ></md-switch>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[#18181d] border border-white/10">
              <div className="pr-4">
                <p className="font-bold text-xs text-white">IMDb Rating Badges</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Show IMDb rating pills pinned on the top corner of movie posters
                </p>
              </div>
              <md-switch
                selected={settings.ratings}
                onClick={() => {
                  settings.setRatings(!settings.ratings);
                  showNotification('Rating badge preference updated');
                }}
              ></md-switch>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[#18181d] border border-white/10">
              <div className="pr-4">
                <p className="font-bold text-xs text-white">Wide Continue Watching Cards</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Display 16:9 landscape cards with live progress bars on the home row
                </p>
              </div>
              <md-switch
                selected={settings.wideContinue}
                onClick={() => {
                  settings.setWideContinue(!settings.wideContinue);
                  showNotification('Continue watching preference updated');
                }}
              ></md-switch>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[#18181d] border border-white/10">
              <div className="pr-4">
                <p className="font-bold text-xs text-white">Critic Reviews & Acclaim</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Show Rotten Tomatoes, Metacritic, and critic pull-quotes on title pages
                </p>
              </div>
              <md-switch
                selected={settings.criticReviews}
                onClick={() => {
                  settings.setCriticReviews(!settings.criticReviews);
                  showNotification('Critic reviews preference updated');
                }}
              ></md-switch>
            </div>
          </div>
        </section>

        {/* ========================================================
            TOP NAVIGATION BAR & SWIPE TABS CUSTOMIZATION
           ======================================================== */}
        <section className="space-y-4 border-t border-white/10 pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 border border-white/10"
                style={{ color: accentHex }}
              >
                <Sliders className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Top Navigation Bar & Categories
                </h2>
                <p className="text-xs text-zinc-400">
                  Select which categories appear on your top navigation bar. Menu, Logo, Search, and Profile remain permanently docked.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                settings.setEnabledNavItems(DEFAULT_NAV_ITEMS);
                showNotification('Top navbar categories reset to defaults');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all self-start sm:self-auto"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>

          {/* Swipe gesture physics note based on performanceMode */}
          <div className="rounded-2xl bg-[#18181d] border border-white/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-1.5 rounded-lg ${
                  settings.performanceMode === 'high'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-white/10 text-zinc-400'
                }`}
              >
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-white">
                  Swipe Navigation Physics:{' '}
                  <span
                    className={
                      settings.performanceMode === 'high'
                        ? 'text-emerald-400 font-extrabold'
                        : 'text-zinc-400 font-normal'
                    }
                  >
                    {settings.performanceMode === 'high'
                      ? 'Active (Spring & Rubber-Band Flick)'
                      : 'Standard (Instant Switch)'}
                  </span>
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {settings.performanceMode === 'high'
                    ? 'Physics-based touch & pointer swipe gestures enabled across top bar categories.'
                    : 'Set Performance Mode above to "High" to enable continuous spring swipe gestures.'}
                </p>
              </div>
            </div>

            <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300">
              {settings.enabledNavItems.length} of {ALL_NAV_ITEMS.length} Tabs Visible
            </span>
          </div>

          {/* Categories 12-Item Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
            {ALL_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isEnabled = settings.enabledNavItems.includes(item.id);
              const isHome = item.id === 'all';
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (isHome) return;
                    settings.toggleNavItem(item.id);
                    showNotification(
                      `${isEnabled ? 'Removed' : 'Added'} ${item.label} ${
                        isEnabled ? 'from' : 'to'
                      } navbar`
                    );
                  }}
                  className={`
                    flex items-center justify-between p-3.5 rounded-2xl border transition-all select-none
                    ${
                      isHome
                        ? 'bg-white/10 border-white/20 opacity-90 cursor-default'
                        : isEnabled
                        ? 'bg-white/10 border-white/30 hover:border-white/40 cursor-pointer shadow-md'
                        : 'bg-[#18181d] border-white/5 hover:border-white/15 opacity-60 hover:opacity-100 cursor-pointer'
                    }
                  `}
                  style={{
                    borderColor: isEnabled ? `${accentHex}60` : undefined,
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className="p-2 rounded-xl shrink-0"
                      style={{
                        backgroundColor: isEnabled
                          ? `${accentHex}25`
                          : 'rgba(255,255,255,0.06)',
                        color: isEnabled ? accentHex : '#94a3b8',
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-white/10 text-zinc-300">
                            {item.badge}
                          </span>
                        )}
                        {isHome && (
                          <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-wider">
                            (Required)
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                      isEnabled
                        ? 'bg-white text-black border-white shadow'
                        : 'border-white/20 bg-white/5 text-transparent'
                    }`}
                  >
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================
            4. PLAYBACK ENGINE PREFERENCES
           ======================================================== */}
        <section className="space-y-4 border-t border-white/10 pt-8">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 border border-white/10"
              style={{ color: accentHex }}
            >
              <Volume2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Player Preferences
              </h2>
              <p className="text-xs text-zinc-400">
                Automated episode sequencing and skip controls
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#18181d] border border-white/10">
              <div className="pr-4">
                <p className="font-bold text-xs text-white">Autoplay Next Episode</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Automatically start the next episode when current episode finishes
                </p>
              </div>
              <md-switch
                selected={settings.autoplayNext}
                onClick={() => {
                  settings.setAutoplayNext(!settings.autoplayNext);
                  showNotification('Autoplay next episode updated');
                }}
              ></md-switch>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[#18181d] border border-white/10">
              <div className="pr-4">
                <p className="font-bold text-xs text-white">Skip Intro & Credits</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Display floating skip button during introductory theme songs
                </p>
              </div>
              <md-switch
                selected={settings.skipIntro}
                onClick={() => {
                  settings.setSkipIntro(!settings.skipIntro);
                  showNotification('Skip intro preference updated');
                }}
              ></md-switch>
            </div>
          </div>
        </section>

        {/* ========================================================
            5. ACCOUNT & CLERK AUTHENTICATION (SWITCH ACCOUNT)
           ======================================================== */}
        <section className="space-y-4 border-t border-white/10 pt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 border border-white/10"
                style={{ color: accentHex }}
              >
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Account & Authentication
                </h2>
                <p className="text-xs text-zinc-400">
                  Manage your Clerk identity, linked devices, and switch accounts
                </p>
              </div>
            </div>

            {isSignedIn && (
              <button
                onClick={() => {
                  if (openSignIn) openSignIn();
                  else if (onNavigateLogin) onNavigateLogin();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-all border border-white/10"
              >
                <ArrowLeftRight className="h-3.5 w-3.5 text-[#2185D5]" />
                <span>Switch / Add Account</span>
              </button>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-[#18181d] border border-white/10 space-y-4">
            {isSignedIn && user ? (
              <>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={user.imageUrl}
                      alt={user.fullName || 'User'}
                      className="h-12 w-12 rounded-full object-cover border-2 border-white/20 shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">
                          {user.fullName || user.username || 'Clerk User'}
                        </h3>
                        <span className="h-2 w-2 rounded-full bg-emerald-400" title="Active" />
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">
                          ACTIVE SESSION
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {user.primaryEmailAddress?.emailAddress || 'Signed In'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-auto">
                    <button
                      onClick={() => {
                        if (openSignIn) openSignIn();
                        else if (onNavigateLogin) onNavigateLogin();
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/15 transition-all border border-white/10"
                    >
                      <ArrowLeftRight className="h-3.5 w-3.5 text-[#2185D5]" />
                      <span>Switch Account</span>
                    </button>

                    <button
                      onClick={() => {
                        if (openUserProfile) openUserProfile();
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/15 transition-all border border-white/10"
                    >
                      <UserCog className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Manage Account</span>
                    </button>

                    <button
                      onClick={() => {
                        signOut();
                        showNotification('Signed out successfully');
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>

                {/* Multi-Account Sessions (if multiple accounts are active) */}
                {sessions && sessions.length > 1 && (
                  <div className="pt-3 border-t border-white/10 space-y-2">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Other Signed-in Accounts
                    </p>
                    <div className="space-y-1.5">
                      {sessions.map((s) => {
                        const isCurrent = s.id === user.id || s.user?.id === user.id;
                        if (isCurrent) return null;
                        const sessionUser = s.user;
                        return (
                          <div
                            key={s.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={sessionUser?.imageUrl || user.imageUrl}
                                alt="User"
                                className="h-8 w-8 rounded-full object-cover border border-white/20"
                              />
                              <div>
                                <p className="text-xs font-bold text-white">
                                  {sessionUser?.fullName || sessionUser?.primaryEmailAddress?.emailAddress || 'Account'}
                                </p>
                                <p className="text-[10px] text-zinc-400">
                                  {sessionUser?.primaryEmailAddress?.emailAddress}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setActive({ session: s.id });
                                showNotification('Switched active Clerk account');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
                            >
                              Switch to this Account
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    You are currently browsing as a Guest
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Sign in to synchronize your watchlist, playback preferences, and history across devices.
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (onNavigateLogin) onNavigateLogin();
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-white hover:bg-white/90 active:scale-95 transition-all shadow-lg"
                >
                  <LogIn className="h-4 w-4 fill-black" />
                  <span>Sign In / Create Account</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================
            6. DATA MANAGEMENT & FACTORY RESET
           ======================================================== */}
        <section className="space-y-4 border-t border-white/10 pt-8">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 border border-white/10"
              style={{ color: accentHex }}
            >
              <Trash2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Storage & Data Management
              </h2>
              <p className="text-xs text-zinc-400">
                Clear cached progress, reset your watchlist, or revert all settings to factory state
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-[#18181d] border border-white/10 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="text-xs font-bold text-white">Watch History</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Clear playback timestamp resumes and continue watching entries
                </p>
              </div>
              <md-outlined-button
                onClick={handleClearHistory}
                className="w-full text-xs font-semibold"
                style={{
                  '--md-outlined-button-outline-color': 'rgba(243, 243, 243, 0.35)',
                  '--md-outlined-button-label-text-color': '#F3F3F3',
                  '--md-outlined-button-icon-color': '#F3F3F3',
                }}
              >
                <Trash2 className="h-3.5 w-3.5" slot="icon" />
                Clear Watch History
              </md-outlined-button>
            </div>

            <div className="p-4 rounded-xl bg-[#18181d] border border-white/10 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="text-xs font-bold text-white">Saved Watchlist</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Remove all bookmarked titles from your personal library
                </p>
              </div>
              <md-outlined-button
                onClick={handleClearWatchlist}
                className="w-full text-xs font-semibold"
                style={{
                  '--md-outlined-button-outline-color': 'rgba(243, 243, 243, 0.35)',
                  '--md-outlined-button-label-text-color': '#F3F3F3',
                  '--md-outlined-button-icon-color': '#F3F3F3',
                }}
              >
                <Trash2 className="h-3.5 w-3.5" slot="icon" />
                Clear Watchlist
              </md-outlined-button>
            </div>

            <div className="p-4 rounded-xl bg-[#18181d] border border-white/10 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="text-xs font-bold text-white">Factory Reset</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Revert all performance, provider, and player settings to defaults
                </p>
              </div>
              <md-filled-button
                onClick={handleResetSettings}
                className="w-full text-xs font-semibold"
                style={{
                  '--md-filled-button-container-color': '#e50914',
                  '--md-filled-button-label-text-color': '#FFFFFF',
                  '--md-filled-button-icon-color': '#FFFFFF',
                }}
              >
                <RotateCcw className="h-3.5 w-3.5" slot="icon" />
                Reset All Defaults
              </md-filled-button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
