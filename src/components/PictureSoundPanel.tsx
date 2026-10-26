import React, { useState } from 'react';
import { X, Sliders, Volume2, Eye, Subtitles, Activity } from 'lucide-react';
import { useAccent } from '../context/AccentContext';

interface PictureSoundPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentTime: number;
}

export const PictureSoundPanel: React.FC<PictureSoundPanelProps> = ({
  isOpen,
  onClose,
  currentTime,
}) => {
  const { accentHex } = useAccent();
  const [activeTab, setActiveTab] = useState<'picture' | 'sound' | 'subs' | 'stats'>('picture');
  const [zoomLevel, setZoomLevel] = useState('100%');
  const [removeBars, setRemoveBars] = useState(false);
  const [dialogueBoost, setDialogueBoost] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [subOffset, setSubOffset] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 sm:bottom-24 sm:right-6 sm:left-auto z-50 w-full sm:w-96 rounded-t-2xl sm:rounded-2xl max-h-[82vh] overflow-y-auto bg-[#131317]/95 border border-white/10 text-white shadow-2xl backdrop-blur-xl animate-fadeIn pb-[env(safe-area-inset-bottom,0px)] select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-[#0b0b0d]">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4" style={{ color: accentHex }} />
          <span className="font-bold text-sm">Picture & Sound</span>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 bg-[#18181d] px-2">
        <button
          onClick={() => setActiveTab('picture')}
          className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'picture' ? 'border-current text-white font-bold' : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
          style={{ borderColor: activeTab === 'picture' ? accentHex : 'transparent', color: activeTab === 'picture' ? accentHex : undefined }}
        >
          <Eye className="h-3.5 w-3.5" /> Picture
        </button>
        <button
          onClick={() => setActiveTab('sound')}
          className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'sound' ? 'border-current text-white font-bold' : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
          style={{ borderColor: activeTab === 'sound' ? accentHex : 'transparent', color: activeTab === 'sound' ? accentHex : undefined }}
        >
          <Volume2 className="h-3.5 w-3.5" /> Sound
        </button>
        <button
          onClick={() => setActiveTab('subs')}
          className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'subs' ? 'border-current text-white font-bold' : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
          style={{ borderColor: activeTab === 'subs' ? accentHex : 'transparent', color: activeTab === 'subs' ? accentHex : undefined }}
        >
          <Subtitles className="h-3.5 w-3.5" /> Subtitles
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'stats' ? 'border-current text-white font-bold' : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
          style={{ borderColor: activeTab === 'stats' ? accentHex : 'transparent', color: activeTab === 'stats' ? accentHex : undefined }}
        >
          <Activity className="h-3.5 w-3.5" /> Stats
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-5 text-xs space-y-4">
        {activeTab === 'picture' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Remove Black Bars</p>
                <p className="text-[11px] text-zinc-400">Crop embedded letterbox borders</p>
              </div>
              <input
                type="checkbox"
                checked={removeBars}
                onChange={e => setRemoveBars(e.target.checked)}
                className="h-4 w-4 rounded accent-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <p className="font-semibold text-white mb-2">Display Zoom</p>
              <div className="grid grid-cols-4 gap-2">
                {['100%', '110%', '125%', '133%'].map(z => (
                  <button
                    key={z}
                    onClick={() => setZoomLevel(z)}
                    className={`py-1.5 rounded-lg font-bold transition-colors ${
                      zoomLevel === z ? 'bg-white text-black' : 'bg-white/5 hover:bg-white/10 text-zinc-300'
                    }`}
                  >
                    {z}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-white/5 p-3 text-[11px] text-zinc-400">
              <span className="font-semibold text-zinc-200">Picture Enhancement: </span>
              AI hardware sharpening is active (DX.BI Ultra Pipeline).
            </div>
          </div>
        )}

        {activeTab === 'sound' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Dialogue Boost</p>
                <p className="text-[11px] text-zinc-400">Lifts speech and center channel clarity</p>
              </div>
              <input
                type="checkbox"
                checked={dialogueBoost}
                onChange={e => setDialogueBoost(e.target.checked)}
                className="h-4 w-4 rounded accent-blue-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Night Mode</p>
                <p className="text-[11px] text-zinc-400">Compresses dynamic range for quiet hours</p>
              </div>
              <input
                type="checkbox"
                checked={nightMode}
                onChange={e => setNightMode(e.target.checked)}
                className="h-4 w-4 rounded accent-blue-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {activeTab === 'subs' && (
          <div className="space-y-3">
            <p className="font-semibold text-white">Subtitle Offset Sync</p>
            <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
              <span className="text-zinc-300">Offset: {subOffset >= 0 ? `+${subOffset.toFixed(2)}` : subOffset.toFixed(2)}s</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setSubOffset(prev => prev - 0.25)}
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 font-bold"
                >
                  -0.25s
                </button>
                <button
                  onClick={() => setSubOffset(0)}
                  className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[10px]"
                >
                  Reset
                </button>
                <button
                  onClick={() => setSubOffset(prev => prev + 0.25)}
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 font-bold"
                >
                  +0.25s
                </button>
              </div>
            </div>

            <div className="space-y-1.5 mt-2">
              <span className="text-[11px] text-zinc-400">Click line heard to auto-align:</span>
              <div
                onClick={() => setSubOffset(0.5)}
                className="p-2 rounded bg-white/5 hover:bg-white/10 cursor-pointer text-zinc-300 truncate"
              >
                [00:{Math.max(10, Math.floor(currentTime)).toString().padStart(2, '0')}] "We need to get out of here now."
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-2 text-[11px] font-mono text-zinc-300">
            <div className="flex justify-between border-b border-white/5 py-1">
              <span className="text-zinc-500">Resolution</span>
              <span className="text-white font-bold">3840 × 2160 (4K UHD)</span>
            </div>
            <div className="flex justify-between border-b border-white/5 py-1">
              <span className="text-zinc-500">Video Codec</span>
              <span>HEVC / H.265 (Main 10)</span>
            </div>
            <div className="flex justify-between border-b border-white/5 py-1">
              <span className="text-zinc-500">Color Range</span>
              <span className="text-amber-400 font-bold">HDR10 / BT.2020</span>
            </div>
            <div className="flex justify-between border-b border-white/5 py-1">
              <span className="text-zinc-500">Bitrate</span>
              <span>24.8 Mbps</span>
            </div>
            <div className="flex justify-between border-b border-white/5 py-1">
              <span className="text-zinc-500">Audio Channels</span>
              <span>Dolby Atmos 5.1 (E-AC3)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">Buffer Health</span>
              <span className="text-emerald-400">32.4s (100%)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
