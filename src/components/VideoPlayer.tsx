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
  Settings,
  FastForward,
} from 'lucide-react';
import Hls from 'hls.js';
import { Episode, MediaItem } from '../types/schema';
import { authStorage } from '../services/supabase';
import { DEFAULT_STREAM } from '../services/api';

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
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);

  const inactivityTimerRef = useRef<number | null>(null);

  const streamUrl = episode?.streamUrl || item.streamUrl || DEFAULT_STREAM;

  // Initialize HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Check saved progress
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

  // Periodic progress saving (every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && isPlaying) {
        authStorage.saveProgress(
          item.id,
          videoRef.current.currentTime,
          videoRef.current.duration || 3600
        );
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [item.id, isPlaying]);

  // Mouse inactivity auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = window.setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  // Keyboard shortcut controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;

      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowLeft' || e.key === 'j') {
        e.preventDefault();
        seekBy(-10);
      } else if (e.key === 'ArrowRight' || e.key === 'l') {
        e.preventDefault();
        seekBy(10);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleVolumeChange(Math.min(1, volume + 0.1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleVolumeChange(Math.max(0, volume - 0.1));
      } else if (e.key === 'm') {
        toggleMute();
      } else if (e.key === 'f') {
        toggleFullscreen();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [volume, isPlaying]);

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
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds)
      );
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      setIsMuted(newVol === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);

      if (videoRef.current.buffered.length > 0) {
        setBufferedTime(videoRef.current.buffered.end(videoRef.current.buffered.length - 1));
      }
    }
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleScrubberHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    setHoverPosition(pos * 100);
    setHoverTime(pos * duration);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
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
        className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6 bg-gradient-to-b from-black/90 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          onClick={onClose}
          className="flex items-center gap-3 text-white transition-transform hover:scale-110"
        >
          <ArrowLeft className="h-7 w-7" />
          <div className="text-left">
            <h3 className="text-lg font-bold">{item.title || item.name}</h3>
            {episode && (
              <p className="text-xs text-gray-400">
                S{episode.season_number}:E{episode.episode_number} - {episode.title}
              </p>
            )}
          </div>
        </button>
      </div>

      {/* Next Episode Floating Popup Card (Final 20s) */}
      {isNearEnd && onNextEpisode && (
        <div className="absolute bottom-28 right-8 z-30 flex items-center gap-4 rounded-lg bg-zinc-900/95 p-4 border border-zinc-700 shadow-2xl backdrop-blur-md animate-fadeIn">
          <div>
            <span className="text-xs font-bold text-red-500 uppercase">Up Next</span>
            <p className="text-sm font-semibold text-white">Next Episode starting soon</p>
          </div>
          <button
            onClick={onNextEpisode}
            className="flex items-center gap-2 rounded bg-white px-4 py-2 text-sm font-bold text-black hover:bg-gray-200"
          >
            <FastForward className="h-4 w-4" /> Play Now
          </button>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 flex flex-col p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubber Timeline */}
        <div
          onMouseMove={handleScrubberHover}
          onMouseLeave={() => setHoverTime(null)}
          className="relative mb-4 flex items-center cursor-pointer group"
        >
          {/* Buffered Background Bar */}
          <div className="absolute h-1 w-full rounded bg-zinc-700/60 group-hover:h-2 transition-all">
            <div
              className="h-full rounded bg-zinc-500"
              style={{ width: `${(bufferedTime / (duration || 1)) * 100}%` }}
            />
          </div>

          {/* Played Progress Bar */}
          <div
            className="absolute h-1 rounded bg-red-600 group-hover:h-2 transition-all pointer-events-none"
            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
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

          {/* Hover Timecode Tooltip */}
          {hoverTime !== null && (
            <div
              style={{ left: `${hoverPosition}%` }}
              className="absolute -top-8 -translate-x-1/2 rounded bg-black/90 px-2 py-0.5 text-xs text-white shadow pointer-events-none border border-zinc-700"
            >
              {formatTime(hoverTime)}
            </div>
          )}
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="transition-transform hover:scale-110 active:scale-95"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 fill-white" />}
            </button>

            <button
              onClick={() => seekBy(-10)}
              className="transition-transform hover:scale-110 active:scale-95"
              title="Seek back 10s"
            >
              <RotateCcw className="h-6 w-6" />
            </button>

            <button
              onClick={() => seekBy(10)}
              className="transition-transform hover:scale-110 active:scale-95"
              title="Seek forward 10s"
            >
              <RotateCw className="h-6 w-6" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2 group">
              <button onClick={toggleMute} className="transition-transform hover:scale-110">
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-6 w-6" />
                ) : volume < 0.5 ? (
                  <Volume1 className="h-6 w-6" />
                ) : (
                  <Volume2 className="h-6 w-6" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={e => handleVolumeChange(Number(e.target.value))}
                className="h-1 w-0 group-hover:w-20 transition-all duration-300 accent-red-600 bg-zinc-700 rounded cursor-pointer"
              />
            </div>

            <span className="text-xs text-gray-300 font-mono ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-5">
            {/* Speed Selector */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="flex items-center gap-1 text-sm font-semibold hover:text-red-400"
              >
                <Settings className="h-5 w-5" />
                <span>{playbackSpeed}x</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-9 right-0 w-28 rounded-md bg-zinc-900 border border-zinc-700 py-1 shadow-xl">
                  {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(s => (
                    <button
                      key={s}
                      onClick={() => changeSpeed(s)}
                      className={`w-full px-3 py-1.5 text-left text-xs hover:bg-zinc-800 ${
                        playbackSpeed === s ? 'text-red-500 font-bold' : 'text-gray-300'
                      }`}
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
              className="transition-transform hover:scale-110 active:scale-95"
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
