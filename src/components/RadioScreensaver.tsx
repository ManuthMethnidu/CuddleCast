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
  BarChart3,
  CircleDot,
  Square,
} from 'lucide-react';
import { Visualizer, AudioAnalyzer } from 'waviz';
import { useRadioStore, getGlobalRadioAudio } from '../store/radioStore';
import { useAccent } from '../context/AccentContext';
import { authStorage } from '../services/storage';
import { radioRecorder, ActiveRecordingState } from '../services/radioRecorder';

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

// Resilient Audio Bridge implementing AudioAnalyzer from waviz
class ResilientAudioBridge extends AudioAnalyzer {
  private freqArray: Uint8Array = new Uint8Array(1024);
  private timeArray: Uint8Array = new Uint8Array(1024);

  override get freqData(): any {
    return this.getFrequencyData();
  }

  override get timeData(): any {
    return this.getTimeDomainData();
  }

  override getFrequencyData(): any {
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
        const subBass = i < 20 ? beatPulse * 220 : 0;
        const midHarmonic = Math.sin(t * 3.5 + i * 0.18) * 45 + 50;
        const shimmer = Math.cos(t * 7.2 + i * 0.45) * 30;
        const val = Math.min(255, Math.max(0, (subBass + (midHarmonic + shimmer) * decay) * vol));
        this.freqArray[i] = Math.round(val);
      }
    }
    return this.freqArray;
  }

  override getTimeDomainData(): any {
    const radio = useRadioStore.getState();
    const isPlaying =
      radio.isPlaying && !radio.isLoadingStream && !radio.isMuted && radio.volume > 0;
    const vol = isPlaying ? radio.volume : 0;

    let hasRealAudio = false;
    if (sharedAnalyser) {
      sharedAnalyser.getByteTimeDomainData(this.timeArray as any);
      let variance = 0;
      for (let i = 0; i < 40; i++) {
        variance += Math.abs(this.timeArray[i] - 128);
      }
      if (variance > 10) {
        hasRealAudio = true;
      }
    }

    if (!hasRealAudio) {
      const t = performance.now() * 0.005;
      for (let i = 0; i < 1024; i++) {
        if (!isPlaying) {
          this.timeArray[i] = 128;
          continue;
        }
        const wave =
          Math.sin(t * 4 + i * 0.08) * 0.6 +
          Math.sin(t * 8 + i * 0.15) * 0.3 +
          Math.cos(t * 12 + i * 0.25) * 0.1;
        const amp = wave * 64 * vol;
        this.timeArray[i] = Math.min(255, Math.max(0, Math.round(128 + amp)));
      }
    }
    return this.timeArray;
  }
}

export const RadioScreensaver: React.FC = () => {
  const {
    currentStation,
    isPlaying,
    isScreensaverOpen,
    volume,
    isMuted,
    setScreensaverOpen,
    togglePlay,
    wander,
    setVolume,
    toggleMute,
  } = useRadioStore();

  const { accentHex } = useAccent();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isFavorited, setIsFavorited] = useState(false);
  const [clock, setClock] = useState('');
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

  // Live Clock
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setClock(
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check if current station is favorited
  useEffect(() => {
    if (!currentStation) {
      setIsFavorited(false);
      return;
    }
    const favs = authStorage.getRadioFavorites();
    setIsFavorited(favs.includes(currentStation.stationuuid));
  }, [currentStation]);

  // Keyboard navigation (Esc to exit screensaver)
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

  // Waviz Frequency Bars Visualizer Render Loop (Only bar visualizer)
  useEffect(() => {
    if (!isScreensaverOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const audioBridge = new ResilientAudioBridge();
    const visualizer = new Visualizer(canvas, audioBridge as any);

    const barWidth = Math.max(6, Math.floor(canvas.width / 54));
    const options = {
      domain: ['freq', 240, 128],
      coord: ['rect'],
      viz: ['bars', 54],
      color: ['linearGradient', accentHex, '#38bdf8', 'horizontal'],
      stroke: [barWidth],
    };

    visualizer.render(options as any);

    return () => {
      visualizer.stop();
      window.removeEventListener('resize', handleResize);
    };
  }, [isScreensaverOpen, accentHex]);

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

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setScreensaverOpen(false);
        }
      }}
      className="fixed inset-0 z-[1000] text-white select-none flex flex-col justify-between overflow-hidden animate-in fade-in duration-300"
      style={{ backgroundColor: '#030712' }}
    >
      {/* Audio Frequency Bars Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Top Bar: Visualizer Badge, Clock & Exit Controls */}
      <div className="relative z-10 flex flex-wrap items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/85 via-black/40 to-transparent gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-mono text-zinc-300">
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>WAVIZ AUDIO BARS</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-zinc-400 hidden sm:inline">{clock}</span>
          <button
            onClick={() => setScreensaverOpen(false)}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-200 hover:text-white backdrop-blur-md border border-white/10 transition-transform active:scale-95 shadow-xl"
            title="Exit Screensaver (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center: Live Station Card Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center p-4 max-w-xl mx-auto w-full pointer-events-auto">
        {currentStation ? (
          <div className="w-full p-5 sm:p-7 rounded-3xl bg-[#0a0f1d]/75 backdrop-blur-2xl border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.85)] text-center flex flex-col items-center gap-3.5">
            {/* Station Icon */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center shadow-lg">
              {currentStation.favicon ? (
                <img
                  src={currentStation.favicon}
                  alt={currentStation.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <Radio className="w-8 h-8 text-zinc-400" />
              )}
            </div>

            {/* Station Details */}
            <div className="flex flex-col items-center gap-1">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white max-w-md truncate">
                {currentStation.name}
              </h2>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400">
                <span>{currentStation.country}</span>
                {currentStation.state && <span>• {currentStation.state}</span>}
                {currentStation.codec && (
                  <span className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px] text-zinc-300">
                    {currentStation.codec}{' '}
                    {currentStation.bitrate > 0 ? `${currentStation.bitrate}k` : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Interactive Player Buttons */}
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={handleToggleFav}
                className={`p-3 rounded-full border transition-all ${
                  isFavorited
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                    : 'bg-white/10 border-white/10 text-zinc-300 hover:text-white hover:bg-white/20'
                }`}
                title={isFavorited ? 'Remove Favorite' : 'Save Favorite'}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-500' : ''}`} />
              </button>

              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-xl"
                style={{ backgroundColor: accentHex }}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white fill-white" />
                ) : (
                  <Play className="w-6 h-6 text-white fill-white ml-1" />
                )}
              </button>

              {/* Record Button in Screensaver */}
              {recordingState.isRecording ? (
                <button
                  onClick={() => radioRecorder.stop()}
                  className="px-4 py-3 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 hover:text-rose-200 text-xs font-semibold shadow-lg transition-all flex items-center gap-2 animate-pulse"
                  title="Stop recording and download MP3"
                >
                  <Square className="w-4 h-4 fill-rose-500 text-rose-500" />
                  <span className="font-mono">
                    REC {Math.floor(recordingState.durationSeconds / 60)}:
                    {(recordingState.durationSeconds % 60).toString().padStart(2, '0')}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => currentStation && radioRecorder.start(currentStation)}
                  className="p-3 rounded-full bg-white/10 border border-white/10 text-zinc-300 hover:text-rose-400 hover:bg-white/20 transition-all"
                  title="Record Station locally (Download MP3)"
                >
                  <CircleDot className="w-5 h-5 text-rose-400" />
                </button>
              )}

              <button
                onClick={wander}
                className="p-3 rounded-full bg-white/10 border border-white/10 text-zinc-300 hover:text-cyan-300 hover:bg-white/20 transition-all"
                title="Wander to Random Station"
              >
                <Compass className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-[#0a0f1d]/75 backdrop-blur-2xl border border-white/15 text-center flex flex-col items-center gap-3">
            <Radio className="w-12 h-12 text-zinc-400 animate-bounce" />
            <p className="text-zinc-300 text-sm">No radio station currently active.</p>
            <button
              onClick={wander}
              className="px-4 py-2 rounded-full font-medium text-sm text-white flex items-center gap-2"
              style={{ backgroundColor: accentHex }}
            >
              <Compass className="w-4 h-4" />
              <span>Wander Planet & Play</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Bar: Volume and Instructions */}
      <div className="relative z-10 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            className="p-2 rounded-full text-zinc-400 hover:text-white bg-white/10 hover:bg-white/20 transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-zinc-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-white" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 sm:w-32 h-1.5 accent-blue-500 cursor-pointer"
            style={{ accentColor: accentHex }}
          />
        </div>

        <div className="text-xs text-zinc-400 flex items-center gap-2">
          <span>Waviz Frequency Bars</span>
          <span className="hidden sm:inline text-zinc-500">
            • Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">Esc</kbd> to return
          </span>
        </div>
      </div>
    </div>
  );
};
