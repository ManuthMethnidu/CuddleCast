import React from 'react';
import { X, Check, Sliders, Palette, Tv, Volume2, ShieldCheck, Film } from 'lucide-react';
import { useAccent, ACCENT_OPTIONS, AccentColor } from '../context/AccentContext';
import { useSettingsStore } from '../store/settingsStore';
import { STREAM_PROVIDERS } from '../services/providers';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { accent, setAccent, accentHex } = useAccent();
  const settings = useSettingsStore();

  if (!isOpen) return null;

  const handleSelectAccent = (color: AccentColor) => {
    setAccent(color);
    settings.setAccent(color);
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-xl rounded-[28px] bg-[#303841] border border-white/10 text-white shadow-[var(--md-sys-elevation-level3)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-[#3A4750]">
          <div className="flex items-center gap-2.5">
            <Sliders className="h-5 w-5" style={{ color: accentHex }} />
            <div>
              <h3 className="font-bold text-base">Echora Settings</h3>
              <p className="text-xs text-zinc-300">Appearance, persistent preferences and streaming</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto scrollbar">
          {/* Accent Color Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4" style={{ color: accentHex }} />
              <span className="font-bold text-sm">Accent Colour</span>
            </div>
            <p className="text-xs text-zinc-300">
              Colour used for branding, active indicators, and playback highlights.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {ACCENT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectAccent(opt.id as AccentColor)}
                  className="flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition-all hover:scale-105"
                  style={{
                    backgroundColor: accent === opt.id ? `${opt.hex}25` : '#3A4750',
                    borderColor: accent === opt.id ? opt.hex : 'rgba(255,255,255,0.08)',
                    color: accent === opt.id ? '#fff' : 'var(--dx-text-2)',
                  }}
                >
                  <span
                    className="h-4 w-4 rounded-full flex-none shadow"
                    style={{ backgroundColor: opt.hex }}
                  />
                  <span className="truncate">{opt.label.split(' ')[0]}</span>
                  {accent === opt.id && (
                    <Check className="h-3 w-3 ml-auto flex-none" style={{ color: opt.hex }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Streaming & Providers Preference */}
          <div className="space-y-4 border-t border-white/5 pt-5">
            <div className="flex items-center gap-2">
              <Film className="h-4 w-4" style={{ color: accentHex }} />
              <span className="font-bold text-sm">Default Streaming Engine</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#3A4750] border border-white/5 space-y-1.5">
                <label className="text-xs font-semibold text-white block">Default Provider</label>
                <select
                  value={settings.defaultProvider}
                  onChange={(e) => settings.setDefaultProvider(e.target.value)}
                  className="w-full bg-[#303841] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  style={{ accentColor: accentHex }}
                >
                  {STREAM_PROVIDERS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.badge ? `(${p.badge})` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-zinc-400">Primary cloud scraper for movies & TV series</p>
              </div>

              <div className="p-3 rounded-xl bg-[#3A4750] border border-white/5 space-y-1.5">
                <label className="text-xs font-semibold text-white block">Preferred Quality</label>
                <select
                  value={settings.defaultQuality}
                  onChange={(e) => settings.setDefaultQuality(e.target.value as any)}
                  className="w-full bg-[#303841] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="auto">Auto (Adaptive)</option>
                  <option value="1080p">1080p Full HD</option>
                  <option value="720p">720p HD</option>
                  <option value="4k">4K UHD</option>
                </select>
                <p className="text-[10px] text-zinc-400">Target playback resolution when supported</p>
              </div>
            </div>
          </div>

          {/* Interface Toggles */}
          <div className="space-y-4 border-t border-white/5 pt-5">
            <div className="flex items-center gap-2">
              <Tv className="h-4 w-4" style={{ color: accentHex }} />
              <span className="font-bold text-sm">Browsing & Interface</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#3A4750] border border-white/5">
                <div>
                  <p className="font-semibold text-xs text-white">Rotating Billboard</p>
                  <p className="text-[11px] text-zinc-300">Cinematic top banner with Ken Burns zoom & trailer preview</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.billboard}
                  onChange={(e) => settings.setBillboard(e.target.checked)}
                  className="h-4 w-4 rounded cursor-pointer"
                  style={{ accentColor: accentHex }}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#3A4750] border border-white/5">
                <div>
                  <p className="font-semibold text-xs text-white">Ratings on Posters (IMDb)</p>
                  <p className="text-[11px] text-zinc-300">Show IMDb rating badges pinned on poster corners</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.ratings}
                  onChange={(e) => settings.setRatings(e.target.checked)}
                  className="h-4 w-4 rounded cursor-pointer"
                  style={{ accentColor: accentHex }}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#3A4750] border border-white/5">
                <div>
                  <p className="font-semibold text-xs text-white">Wide Continue Watching</p>
                  <p className="text-[11px] text-zinc-300">Landscape cards with title art and live watch progress bar</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.wideContinue}
                  onChange={(e) => settings.setWideContinue(e.target.checked)}
                  className="h-4 w-4 rounded cursor-pointer"
                  style={{ accentColor: accentHex }}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#3A4750] border border-white/5">
                <div>
                  <p className="font-semibold text-xs text-white">Critic Reviews</p>
                  <p className="text-[11px] text-zinc-300">Critic scores and review quotes on title detail pages</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.criticReviews}
                  onChange={(e) => settings.setCriticReviews(e.target.checked)}
                  className="h-4 w-4 rounded cursor-pointer"
                  style={{ accentColor: accentHex }}
                />
              </div>
            </div>
          </div>

          {/* Player Enhancements */}
          <div className="space-y-4 border-t border-white/5 pt-5">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" style={{ color: accentHex }} />
              <span className="font-bold text-sm">Player Preferences</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#3A4750] border border-white/5">
                <div>
                  <p className="font-semibold text-xs text-white">Autoplay Next Episode</p>
                  <p className="text-[11px] text-zinc-300">Seamlessly start subsequent episode when current stream finishes</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoplayNext}
                  onChange={(e) => settings.setAutoplayNext(e.target.checked)}
                  className="h-4 w-4 rounded cursor-pointer"
                  style={{ accentColor: accentHex }}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#3A4750] border border-white/5">
                <div>
                  <p className="font-semibold text-xs text-white">Skip Intro & Up Next</p>
                  <p className="text-[11px] text-zinc-300">Display quick skip button and countdown</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.skipIntro}
                  onChange={(e) => settings.setSkipIntro(e.target.checked)}
                  className="h-4 w-4 rounded cursor-pointer"
                  style={{ accentColor: accentHex }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 bg-[#3A4750]">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Settings saved automatically</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full text-xs font-semibold text-white transition-all shadow-[var(--md-sys-elevation-level1)] hover:shadow-[var(--md-sys-elevation-level2)] active:scale-95"
            style={{ background: accentHex }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
