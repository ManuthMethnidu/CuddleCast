import React from 'react';
import { X, Check, Sliders, Palette, Tv, Volume2 } from 'lucide-react';
import { useAccent, ACCENT_OPTIONS, AccentColor } from '../context/AccentContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { accent, setAccent, accentHex } = useAccent();
  const [billboard, setBillboard] = React.useState(true);
  const [previews, setPreviews] = React.useState(true);
  const [ratings, setRatings] = React.useState(true);
  const [wideContinue, setWideContinue] = React.useState(true);
  const [criticReviews, setCriticReviews] = React.useState(true);
  const [skipIntro, setSkipIntro] = React.useState(true);
  const [soundBoost, setSoundBoost] = React.useState(true);

  if (!isOpen) return null;

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
              <p className="text-xs text-zinc-300">Appearance, playback and streaming features</p>
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
        <div className="p-4 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Accent Color Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4" style={{ color: accentHex }} />
              <span className="font-bold text-sm">Accent Colour</span>
            </div>
            <p className="text-xs text-zinc-300">
              Colour used for the logo, progress bars, active tabs, and player highlights.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {ACCENT_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setAccent(opt.id as AccentColor)}
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
                  {accent === opt.id && <Check className="h-3 w-3 ml-auto flex-none" style={{ color: opt.hex }} />}
                </button>
              ))}
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
                  checked={billboard}
                  onChange={e => setBillboard(e.target.checked)}
                  className="h-4 w-4 rounded cursor-pointer"
                  style={{ accentColor: accentHex }}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#3A4750] border border-white/5">
                <div>
                  <p className="font-semibold text-xs text-white">Hover Preview Cards</p>
                  <p className="text-[11px] text-zinc-300">Unfold cards with artwork aura glow and auto-playing mini trailers</p>
                </div>
                <input
                  type="checkbox"
                  checked={previews}
                  onChange={e => setPreviews(e.target.checked)}
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
                  checked={ratings}
                  onChange={e => setRatings(e.target.checked)}
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
                  checked={wideContinue}
                  onChange={e => setWideContinue(e.target.checked)}
                  className="h-4 w-4 rounded cursor-pointer"
                  style={{ accentColor: accentHex }}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#3A4750] border border-white/5">
                <div>
                  <p className="font-semibold text-xs text-white">Critic Reviews (Rotten Tomatoes & Metacritic)</p>
                  <p className="text-[11px] text-zinc-300">Critic scores and review quotes on title detail pages</p>
                </div>
                <input
                  type="checkbox"
                  checked={criticReviews}
                  onChange={e => setCriticReviews(e.target.checked)}
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
              <span className="font-bold text-sm">Player & Video Processing</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#3A4750] border border-white/5">
                <div>
                  <p className="font-semibold text-xs text-white">Skip Intro & Up Next</p>
                  <p className="text-[11px] text-zinc-300">Auto-detect intro scenes and countdown to next episode</p>
                </div>
                <input
                  type="checkbox"
                  checked={skipIntro}
                  onChange={e => setSkipIntro(e.target.checked)}
                  className="h-4 w-4 rounded cursor-pointer"
                  style={{ accentColor: accentHex }}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#3A4750] border border-white/5">
                <div>
                  <p className="font-semibold text-xs text-white">Dialogue Boost & Night Mode</p>
                  <p className="text-[11px] text-zinc-300">Dynamic speech frequency lifting and dynamic range evening</p>
                </div>
                <input
                  type="checkbox"
                  checked={soundBoost}
                  onChange={e => setSoundBoost(e.target.checked)}
                  className="h-4 w-4 rounded cursor-pointer"
                  style={{ accentColor: accentHex }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 bg-[#3A4750]">
          <span className="text-xs text-zinc-300">Echora v2.15.9 · Next-Gen Cinema</span>
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
