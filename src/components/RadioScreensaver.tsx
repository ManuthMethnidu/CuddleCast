import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Play,
  Pause,
  Compass,
  Volume2,
  VolumeX,
  Radio,
  Heart,
  CircleDot,
  Square,
  Sparkles,
  Waves,
  Layers,
} from 'lucide-react';
import { useRadioStore, getGlobalRadioAudio } from '../store/radioStore';
import { useAccent } from '../context/AccentContext';
import { authStorage } from '../services/storage';
import { radioRecorder, ActiveRecordingState } from '../services/radioRecorder';
import { MicroSlats, PresetKey as SlatsPreset } from './MicroSlats';
import { CrystalizedBall, BallPreset } from './CrystalizedBall';

// Global persistent Web Audio bridge for Radio stream analysis
let sharedAudioCtx: AudioContext | null = null;
let sharedAnalyser: AnalyserNode | null = null;
let sharedSourceNode: MediaElementAudioSourceNode | null = null;
let isAudioConnected = false;

function initSharedAudioBridge(audioEl: HTMLAudioElement) {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!sharedAudioCtx && AudioContextClass) {
      sharedAudioCtx = new AudioContextClass();
    }
    if (sharedAudioCtx && !sharedAnalyser) {
      sharedAnalyser = sharedAudioCtx.createAnalyser();
      sharedAnalyser.fftSize = 2048;
      sharedAnalyser.smoothingTimeConstant = 0.82;
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    if (sharedAudioCtx && sharedAnalyser && audioEl && !isAudioConnected) {
      try {
        sharedSourceNode = sharedAudioCtx.createMediaElementSource(audioEl);
        sharedSourceNode.connect(sharedAnalyser);
        sharedAnalyser.connect(sharedAudioCtx.destination);
        isAudioConnected = true;
      } catch {
        // Can throw if already connected or blocked by browser media security
      }
    }
  } catch {
    // Graceful fallback to procedural synthesis
  }
}

// Resilient Audio Bridge implementing getFrequencyData for visualizers
class ResilientAudioBridge {
  private freqArray: Uint8Array = new Uint8Array(1024);

  getFrequencyData(): Uint8Array {
    const radio = useRadioStore.getState();
    const isPlaying =
      radio.isPlaying && !radio.isLoadingStream && !radio.isMuted && radio.volume > 0;
    const vol = isPlaying ? radio.volume : 0;

    let hasRealAudio = false;
    if (sharedAnalyser) {
      sharedAnalyser.getByteFrequencyData(this.freqArray as any);
      let sum = 0;
      for (let i = 0; i < 40; i++) {
        sum += this.freqArray[i];
      }
      if (sum > 10) {
        hasRealAudio = true;
      }
    }

    if (!hasRealAudio) {
      // Synthesize rhythmic harmonic frequencies matching active stream volume
      const t = performance.now() * 0.003;
      const beatPulse = isPlaying ? Math.pow(Math.max(0, Math.sin(t * 2.8)), 3) : 0;

      for (let i = 0; i < 1024; i++) {
        if (!isPlaying) {
          this.freqArray[i] = 0;
          continue;
        }
        const freqRatio = i / 1024;
        const decay = Math.exp(-freqRatio * 6);
        const subBass = i < 20 ? beatPulse * 230 : 0;
        const midHarmonic = Math.sin(t * 3.5 + i * 0.18) * 50 + 55;
        const shimmer = Math.cos(t * 7.2 + i * 0.45) * 35;
        const val = Math.min(255, Math.max(0, (subBass + (midHarmonic + shimmer) * decay) * vol));
        this.freqArray[i] = Math.round(val);
      }
    }
    return this.freqArray;
  }
}

export const RadioScreensaver: React.FC = () => {
  const {
    currentStation,
    isPlaying,
    isScreensaverOpen,
    screensaverTheme,
    volume,
    isMuted,
    setScreensaverOpen,
    setScreensaverTheme,
    togglePlay,
    wander,
    setVolume,
    toggleMute,
  } = useRadioStore();

  const { accentHex } = useAccent();
  const audioBridgeRef = useRef<ResilientAudioBridge | null>(null);
  if (!audioBridgeRef.current) {
    audioBridgeRef.current = new ResilientAudioBridge();
  }

  const [isFavorited, setIsFavorited] = useState(false);
  const [activeBallPreset, setActiveBallPreset] = useState<BallPreset>('plasma');
  const [activeSlatsPreset, setActiveSlatsPreset] = useState<SlatsPreset>('storm');
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [recordingState, setRecordingState] = useState<ActiveRecordingState>(
    radioRecorder.getState()
  );

  useEffect(() => {
    const unsub = radioRecorder.subscribe(setRecordingState);
    return () => unsub();
  }, []);

  // Initialize Audio Bridge
  useEffect(() => {
    if (!isScreensaverOpen) return;
    const audio = getGlobalRadioAudio();
    if (audio) {
      initSharedAudioBridge(audio);
    }
  }, [isScreensaverOpen]);

  // Idle timer to auto-minimize/hide UI during screensaver
  const resetIdleTimer = () => {
    setIsIdle(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, 2600);
  };

  useEffect(() => {
    if (!isScreensaverOpen) {
      setIsIdle(false);
      return;
    }
    setIsIdle(false);
    resetIdleTimer();

    const handleActivity = () => resetIdleTimer();

    window.addEventListener('mousemove', handleActivity, { passive: true });
    window.addEventListener('pointermove', handleActivity, { passive: true });
    window.addEventListener('mousedown', handleActivity, { passive: true });
    window.addEventListener('pointerdown', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('pointermove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('pointerdown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [isScreensaverOpen]);

  // Check if current station is favorited
  useEffect(() => {
    if (!currentStation) {
      setIsFavorited(false);
      return;
    }
    const favs = authStorage.getRadioFavorites();
    setIsFavorited(favs.includes(currentStation.stationuuid));
  }, [currentStation]);

  // Keyboard shortcuts (Esc to exit screensaver, Space to play/pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setScreensaverOpen(false);
      } else if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
    };
    if (isScreensaverOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isScreensaverOpen, setScreensaverOpen, togglePlay]);

  if (!isScreensaverOpen) return null;

  const handleToggleFav = () => {
    if (!currentStation) return;
    const favs = authStorage.getRadioFavorites();
    const isFav = favs.includes(currentStation.stationuuid);
    const updated = isFav
      ? favs.filter((id) => id !== currentStation.stationuuid)
      : [...favs, currentStation.stationuuid];
    authStorage.saveRadioFavorites(updated);
    setIsFavorited(!isFav);
  };

  const isBallMode = screensaverTheme !== 'microslats';

  const toggleVisualizerMode = () => {
    const nextTheme = isBallMode ? 'microslats' : 'crystalized-ball';
    setScreensaverTheme(nextTheme);
  };

  const cyclePreset = () => {
    if (isBallMode) {
      const presets: BallPreset[] = [
        'plasma',
        'aurora',
        'nebula',
        'ember',
        'frost',
        'solar',
        'abyss',
        'eclipse',
      ];
      const nextIdx = (presets.indexOf(activeBallPreset) + 1) % presets.length;
      setActiveBallPreset(presets[nextIdx]);
    } else {
      const presets: SlatsPreset[] = ['storm', 'swell', 'tide', 'signal'];
      const nextIdx = (presets.indexOf(activeSlatsPreset) + 1) % presets.length;
      setActiveSlatsPreset(presets[nextIdx]);
    }
  };

  const isAudioActive = isPlaying && !isMuted && volume > 0;
  const currentPresetName = isBallMode ? activeBallPreset : activeSlatsPreset;

  return (
    <div
      onClick={(e) => {
        // Clicking directly on background closes screensaver
        if (e.target === e.currentTarget) {
          setScreensaverOpen(false);
        }
      }}
      className="fixed inset-0 z-[1000] text-white select-none overflow-hidden bg-[#030712] animate-in fade-in duration-300"
    >
      {/* Sound-Reactive 3D Visualizer Canvas */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-auto">
        {isBallMode ? (
          <CrystalizedBall
            preset={activeBallPreset}
            color={accentHex}
            theme="dark"
            size={0.76}
            speed={1.05}
            interactive={true}
            hoverStrength={0.85}
            audioProvider={audioBridgeRef.current}
            isAudioPlaying={isAudioActive}
            intro={false}
          />
        ) : (
          <MicroSlats
            preset={activeSlatsPreset}
            color={accentHex}
            glintColor="#ffffff"
            backgroundColor="#030712"
            audioProvider={audioBridgeRef.current}
            isAudioPlaying={isAudioActive}
            interactive={true}
            cursorStrength={1.4}
            cursorSize={52}
            swirl={1.2}
            trail={1.8}
            lean={0.4}
            intro={false}
          />
        )}
      </div>

      {/* Top subtle controls: Visualizer Badge & Exit button (Auto-hides on idle) */}
      <div
        className={`absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none transition-all duration-500 ease-out ${
          isIdle ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={cyclePreset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-white/10 backdrop-blur-xl border border-white/10 text-xs font-mono text-zinc-300 shadow-lg transition-colors cursor-pointer"
            title="Click to cycle color preset"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" style={{ color: accentHex }} />
            <span className="font-semibold tracking-wider uppercase">
              {isBallMode ? 'Crystalized Ball' : 'Sound MicroSlats'}
            </span>
            <span className="text-[10px] text-zinc-400">• {currentPresetName}</span>
          </button>
        </div>

        <button
          onClick={() => setScreensaverOpen(false)}
          className="pointer-events-auto p-2 rounded-full bg-black/60 hover:bg-white/20 text-zinc-300 hover:text-white backdrop-blur-xl border border-white/10 transition-all active:scale-95 shadow-xl"
          title="Exit Screensaver (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Minimized Floating Bottom Player Dock (Auto-hides on idle) */}
      <div
        onMouseEnter={() => {
          if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
          setIsIdle(false);
        }}
        onMouseLeave={resetIdleTimer}
        className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 max-w-[94vw] transition-all duration-500 ease-out ${
          isIdle
            ? 'opacity-0 translate-y-4 pointer-events-none'
            : 'opacity-100 translate-y-0 pointer-events-auto'
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3 px-3.5 sm:px-4 py-2 rounded-2xl bg-[#090d16]/80 backdrop-blur-2xl border border-white/15 shadow-[0_16px_50px_rgba(0,0,0,0.85)] max-w-full">
          {/* Station Avatar & Info */}
          <div className="flex items-center gap-2.5 min-w-0 pr-1">
            {currentStation?.favicon ? (
              <img
                src={currentStation.favicon}
                alt={currentStation.name}
                className="w-8 h-8 rounded-lg object-cover bg-black/50 shrink-0 border border-white/10"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                <Radio className="w-4 h-4 text-zinc-300" />
              </div>
            )}
            <div className="flex flex-col min-w-0 max-w-[110px] xs:max-w-[140px] sm:max-w-[180px]">
              <span className="text-xs sm:text-sm font-semibold text-white truncate leading-tight">
                {currentStation ? currentStation.name : 'No Station'}
              </span>
              <span className="text-[11px] text-zinc-400 truncate leading-tight">
                {currentStation?.country || 'Wander to play'}
              </span>
            </div>
          </div>

          <div className="h-5 w-[1px] bg-white/10 hidden xs:block" />

          {/* Interactive Player Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Favorite Button */}
            <button
              onClick={handleToggleFav}
              className={`p-2 rounded-xl transition-all ${
                isFavorited
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
              title={isFavorited ? 'Remove Favorite' : 'Save Favorite'}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: accentHex }}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white fill-white" />
              ) : (
                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
              )}
            </button>

            {/* Local Recording Button */}
            {recordingState.isRecording ? (
              <button
                onClick={() => radioRecorder.stop()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/60 text-rose-300 hover:text-rose-100 text-xs font-mono shadow-md transition-all animate-pulse"
                title="Stop recording and download MP3"
              >
                <Square className="w-3 h-3 fill-rose-500 text-rose-500" />
                <span>
                  {Math.floor(recordingState.durationSeconds / 60)}:
                  {(recordingState.durationSeconds % 60).toString().padStart(2, '0')}
                </span>
              </button>
            ) : (
              <button
                onClick={() => currentStation && radioRecorder.start(currentStation)}
                className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-white/10 transition-all"
                title="Record Station locally (Download MP3)"
              >
                <CircleDot className="w-4 h-4" />
              </button>
            )}

            {/* Random Station Wander */}
            <button
              onClick={wander}
              className="p-2 rounded-xl text-zinc-400 hover:text-cyan-300 hover:bg-white/10 transition-all"
              title="Wander (Random Station)"
            >
              <Compass className="w-4 h-4" />
            </button>

            {/* Switch Visualizer Mode: Crystalized Ball <-> MicroSlats */}
            <button
              onClick={toggleVisualizerMode}
              className="p-2 rounded-xl text-zinc-400 hover:text-purple-300 hover:bg-white/10 transition-all flex items-center gap-1"
              title={`Switch Visualizer Mode (Active: ${
                isBallMode ? 'Crystalized Ball' : 'MicroSlats'
              })`}
            >
              <Layers className="w-4 h-4 text-purple-400" />
            </button>

            {/* Color Preset Switcher */}
            <button
              onClick={cyclePreset}
              className="p-2 rounded-xl text-zinc-400 hover:text-amber-300 hover:bg-white/10 transition-all"
              title={`Switch color preset (Current: ${currentPresetName})`}
            >
              <Waves className="w-4 h-4" />
            </button>

            {/* Volume Slider (Medium+ screens) */}
            <div className="hidden md:flex items-center gap-1.5 pl-1">
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-zinc-500" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 h-1 accent-white cursor-pointer"
                style={{ accentColor: accentHex }}
              />
            </div>

            <div className="h-5 w-[1px] bg-white/10" />

            {/* Close / Exit Button */}
            <button
              onClick={() => setScreensaverOpen(false)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Exit Screensaver (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Subtle idle helper hint */}
        <span className="text-[11px] font-mono text-zinc-500 drop-shadow select-none">
          Click background or press Esc to exit • Drag surface to interact
        </span>
      </div>
    </div>
  );
};
