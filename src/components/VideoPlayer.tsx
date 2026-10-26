import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  ArrowLeft,
  FastForward,
  Sliders,
  Users,
} from 'lucide-react';
import Hls from 'hls.js';
import { Episode, MediaItem } from '../types/schema';
import { authStorage } from '../services/supabase';
import { DEFAULT_STREAM } from '../services/api';
import { useAccent } from '../context/AccentContext';
import { PictureSoundPanel } from './PictureSoundPanel';
import { WatchPartyModal } from './WatchPartyModal';

interface VideoPlayerProps {
  item: MediaItem;
  episode?: Episode;
  onClose: () => void;
  onNextEpisode?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  item,
  episode,
  onClose,
  onNextEpisode,
}) => {
  const { accentHex } = useAccent();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedTime, setBufferedTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [showParty, setShowParty] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);

  const inactivityTimerRef = useRef<number | null>(null);

  const streamUrl = episode?.streamUrl || item.streamUrl || DEFAULT_STREAM;

  // Initialize HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const saved = authStorage.getProgress(item.id);
    if (saved && saved.progress_seconds > 0) {
      video.currentTime = saved.progress_seconds;
    }

    if (Hls.isSupported() && streamUrl.includes('.m3u8')) {
      const hls = new Hls({
        enableWorker: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
      });
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
        setIsPlaying(true);
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.play().catch(() => {});
      setIsPlaying(true);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl, item.id]);

  // Periodic progress saving
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && isPlaying) {
        authStorage.saveProgress(
          item.id,
          videoRef.current.currentTime,
          videoRef.current.duration || 100
        );
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [item.id, isPlaying]);

  // Auto-hide controls
  const resetInactivityTimer = () => {
    setShowControls(true);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = window.setTimeout(() => {
      if (isPlaying && !showPanel && !showParty) {
        setShowControls(false);
        setShowSpeedMenu(false);
      }
    }, 3000);
  };

  const handleMouseMove = () => {
    resetInactivityTimer();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;

      switch (e.code) {
        case 'Space':
        case 'KeyK':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
        case 'KeyJ':
          e.preventDefault();
          seekBy(-10);
          break;
        case 'ArrowRight':
        case 'KeyL':
          e.preventDefault();
          seekBy(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.1));
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyD':
          e.preventDefault();
          setShowPanel(prev => !prev);
          break;
        case 'Escape':
          if (!document.fullscreenElement) {
            onClose();
          }
          break;
      }
      resetInactivityTimer();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, onClose, showPanel]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const seekBy = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    setDuration(video.duration || 0);

    if (video.buffered.length > 0) {
      setBufferedTime(video.buffered.end(video.buffered.length - 1));
    }
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    const targetTime = Number(e.target.value);
    if (!video) return;
    video.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const handleScrubberHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const time = pos * (duration || 0);
    setHoverPosition(pos * 100);
    setHoverTime(time);
  };

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      video.muted = false;
      setIsMuted(false);
      video.volume = volume || 0.5;
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const changeSpeed = (speed: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  };

  const remainingSeconds = duration - currentTime;
  const isNearEnd = duration > 60 && remainingSeconds > 0 && remainingSeconds <= 20;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 z-[1000] flex items-center justify-center bg-black ${
        showControls ? 'cursor-default' : 'cursor-none'
      }`}
    >
      <video
        ref={videoRef}
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay}
        className="h-full w-full object-contain"
        playsInline
      />

      {/* Top Header Bar */}
      <div
        className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          onClick={onClose}
          className="flex items-center gap-3.5 text-white transition-transform hover:scale-105"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 backdrop-blur-md border border-white/10 hover:bg-white/20">
            <ArrowLeft className="h-6 w-6" />
          </div>
          <div className="text-left">
            <h3 className="text-base sm:text-lg font-bold">{item.title || item.name}</h3>
            {episode && (
              <p className="text-xs text-zinc-400">
                S{episode.season_number}:E{episode.episode_number} - {episode.title}
              </p>
            )}
          </div>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowParty(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 border border-white/10 text-xs font-semibold text-white hover:bg-white/10 backdrop-blur-md"
          >
            <Users className="h-3.5 w-3.5" style={{ color: accentHex }} />
            <span>Party</span>
          </button>
        </div>
      </div>

      {/* Floating Next Episode Card */}
      {isNearEnd && onNextEpisode && (
        <div className="absolute bottom-28 right-8 z-30 flex items-center gap-4 rounded-xl bg-[#131317]/95 p-4 border border-white/15 shadow-2xl backdrop-blur-md animate-fadeIn">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: accentHex }}>
              Up Next
            </span>
            <p className="text-sm font-semibold text-white">Next episode begins in {Math.ceil(remainingSeconds)}s</p>
          </div>
          <button
            onClick={onNextEpisode}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-black hover:bg-zinc-200 transition-all active:scale-95 shadow"
          >
            <FastForward className="h-4 w-4 fill-black" />
            <span>Play Now</span>
          </button>
        </div>
      )}

      {/* Picture & Sound Panel */}
      <PictureSoundPanel
        isOpen={showPanel}
        onClose={() => setShowPanel(false)}
        currentTime={currentTime}
      />

      {/* Watch Party Modal */}
      <WatchPartyModal
        isOpen={showParty}
        onClose={() => setShowParty(false)}
      />

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 flex flex-col p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubber Timeline */}
        <div
          onMouseMove={handleScrubberHover}
          onMouseLeave={() => setHoverTime(null)}
          className="relative mb-3 flex items-center cursor-pointer group"
        >
          {/* Buffered Background Bar */}
          <div className="absolute h-1 w-full rounded-full bg-white/20 group-hover:h-2 transition-all">
            <div
              className="h-full rounded-full bg-white/40"
              style={{ width: `${(bufferedTime / (duration || 1)) * 100}%` }}
            />
          </div>

          {/* Played Bar */}
          <div
            className="absolute h-1 rounded-full group-hover:h-2 transition-all pointer-events-none shadow"
            style={{
              width: `${(currentTime / (duration || 1)) * 100}%`,
              background: accentHex,
            }}
          />

          {/* Scrubber Input */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleScrubberChange}
            className="relative z-10 h-2 w-full opacity-0 cursor-pointer"
          />

          {/* Hover Time Tooltip */}
          {hoverTime !== null && (
            <div
              style={{ left: `${hoverPosition}%` }}
              className="absolute -top-8 -translate-x-1/2 rounded bg-black/90 px-2 py-0.5 text-xs font-mono text-white shadow pointer-events-none border border-white/20"
            >
              {formatTime(hoverTime)}
            </div>
          )}
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="transition-transform hover:scale-110 active:scale-95"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-white" />}
            </button>

            <button
              onClick={() => seekBy(-10)}
              className="transition-transform hover:scale-110 active:scale-95 text-zinc-300 hover:text-white"
              title="Seek back 10s"
            >
              <RotateCcw className="h-5 w-5" />
            </button>

            <button
              onClick={() => seekBy(10)}
              className="transition-transform hover:scale-110 active:scale-95 text-zinc-300 hover:text-white"
              title="Seek forward 10s"
            >
              <RotateCw className="h-5 w-5" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2 group">
              <button onClick={toggleMute} className="transition-transform hover:scale-110 text-zinc-300 hover:text-white">
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : volume < 0.5 ? (
                  <Volume1 className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={e => handleVolumeChange(Number(e.target.value))}
                className="h-1 w-0 group-hover:w-20 transition-all duration-300 bg-white/30 rounded cursor-pointer"
                style={{ accentColor: accentHex }}
              />
            </div>

            <span className="text-xs text-zinc-300 font-mono ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Picture & Sound Panel Button */}
            <button
              onClick={() => setShowPanel(!showPanel)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
              title="Picture & Sound (Black bars, dialogue boost, subtitle sync) [D]"
              style={{ color: showPanel ? accentHex : undefined }}
            >
              <Sliders className="h-5 w-5" />
            </button>

            {/* Speed Selector */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded hover:bg-white/10 text-zinc-300 hover:text-white"
              >
                <span>{playbackSpeed}x</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-9 right-0 w-28 rounded-lg bg-[#18181d] border border-white/10 py-1 shadow-2xl">
                  {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(s => (
                    <button
                      key={s}
                      onClick={() => changeSpeed(s)}
                      className={`w-full px-3 py-1.5 text-left text-xs hover:bg-white/10 ${
                        playbackSpeed === s ? 'font-bold' : 'text-zinc-300'
                      }`}
                      style={{ color: playbackSpeed === s ? accentHex : undefined }}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="transition-transform hover:scale-110 active:scale-95 text-zinc-300 hover:text-white"
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
