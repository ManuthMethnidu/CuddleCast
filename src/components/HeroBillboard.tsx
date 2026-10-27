import React, { useState, useEffect, useRef, memo } from 'react';
import { Play, Info, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import Hls from 'hls.js';
import { BillboardData } from '../types/schema';
import { useAccent } from '../context/AccentContext';
import { useSettingsStore } from '../store/settingsStore';

interface HeroBillboardProps {
  items: BillboardData[];
  onPlay: (item: BillboardData) => void;
  onMoreInfo: (item: BillboardData) => void;
}

const HeroBillboardComponent: React.FC<HeroBillboardProps> = ({
  items,
  onPlay,
  onMoreInfo,
}) => {
  const { accentHex } = useAccent();
  const { performanceMode, billboard: isBillboardTrailerEnabled } = useSettingsStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoEnded, setVideoEnded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const timerRef = useRef<number | null>(null);

  const currentItem = items[currentIndex] || items[0];

  // Pause offscreen billboard to save GPU & CPU cycles
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (!entry.isIntersecting) {
          if (videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause();
          }
        } else if (videoRef.current && isVideoPlaying) {
          videoRef.current.play().catch(() => {});
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isVideoPlaying]);

  // Auto-advance billboard slide if video is not actively running and billboard is visible
  useEffect(() => {
    if (isVideoPlaying || !isVisible) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % items.length);
    }, 9000);
    return () => clearInterval(interval);
  }, [items.length, isVideoPlaying, isVisible]);

  // Trailer autoplay preview delay (1500ms) with visibility gating (Disabled in low performance mode)
  useEffect(() => {
    setIsVideoPlaying(false);
    setVideoEnded(false);

    if (timerRef.current) clearTimeout(timerRef.current);

    if (!isVisible || performanceMode === 'low' || !isBillboardTrailerEnabled) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      return;
    }

    timerRef.current = window.setTimeout(() => {
      const video = videoRef.current;
      const streamUrl = currentItem?.trailerUrl || currentItem?.streamUrl;

      if (!video || !streamUrl || !isVisible) return;

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      if (Hls.isSupported() && streamUrl.includes('.m3u8')) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          maxMaxBufferLength: 10,
        });
        hlsRef.current = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (isVisible) {
            video.play().then(() => setIsVideoPlaying(true)).catch(() => {});
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.play().then(() => setIsVideoPlaying(true)).catch(() => {});
      }
    }, 1500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentIndex, currentItem, isVisible]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setVideoEnded(false);
      setIsVideoPlaying(true);
    }
  };

  if (!currentItem) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[68vh] sm:h-[min(84vh,58vw)] min-h-[26rem] sm:min-h-[30rem] -mb-[4vw] overflow-hidden bg-[#303841] isolate select-none contain-paint"
    >
      {/* Background Poster Image with Ken Burns Zoom */}
      <div
        key={`backdrop-${currentIndex}`}
        className={`absolute inset-0 bg-cover bg-[center_20%] transition-opacity duration-1000 ${
          isVideoPlaying && !videoEnded ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          backgroundImage: `url(${currentItem.backdrop_path || currentItem.poster_path})`,
          animation: performanceMode === 'low' ? 'none' : 'dx-kenburns 16s linear both',
          animationPlayState: isVisible ? 'running' : 'paused',
        }}
      />

      {/* Video Trailer Preview Container */}
      <video
        ref={videoRef}
        muted={isMuted}
        playsInline
        onEnded={() => {
          setIsVideoPlaying(false);
          setVideoEnded(true);
        }}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
          isVideoPlaying && !videoEnded ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Multi-directional DXBI Cinema Shade Vignette */}
      <div className="absolute inset-0 dx-hero-shade pointer-events-none z-[1]" />

      {/* Billboard Hero Content Placement */}
      <div className="absolute z-[2] left-4 sm:left-[var(--dx-gutter,3rem)] right-4 sm:right-auto bottom-6 sm:bottom-[calc(4vw+2.5rem)] max-w-full sm:max-w-[min(38rem,45vw)] flex flex-col justify-end items-start gap-2 sm:gap-3">
        {/* Echora Kicker */}
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-black uppercase tracking-widest text-zinc-300 select-none">
          <b style={{ color: accentHex }}>ECHORA</b>
          <span className="text-zinc-400 font-semibold">{currentItem.media_type === 'tv' ? 'Series' : 'Film'}</span>
        </div>

        {/* Title Logo or Typography */}
        <div className="max-w-xl">
          {currentItem.logo_path ? (
            <img
              src={currentItem.logo_path}
              alt={currentItem.title || currentItem.name}
              decoding="async"
              className="max-h-14 sm:max-h-28 w-auto object-contain drop-shadow-[0_6px_24px_rgba(0,0,0,0.6)]"
            />
          ) : (
            <h1 className="text-2xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] leading-[1.05]">
              {currentItem.title || currentItem.name}
            </h1>
          )}
        </div>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium text-zinc-300">
          <span className="dx-match font-bold text-emerald-400">
            {Math.round(currentItem.vote_average * 10)}% Match
          </span>
          <span className="dx-imdb">
            <i>IMDb</i>
            <span>{currentItem.vote_average.toFixed(1)}</span>
          </span>
          <span>{currentItem.release_date?.split('-')[0] || '2024'}</span>
          <span className="dx-pill">4K UHD</span>
          <span className="dx-pill">HDR</span>
          <span className="dx-pill">5.1 AUDIO</span>
          <span className="dx-pill">TV-MA</span>
        </div>

        {/* Synopsis */}
        <p className="line-clamp-2 sm:line-clamp-3 text-xs sm:text-base text-zinc-200 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] max-w-lg">
          {currentItem.overview}
        </p>

        {/* M3 Action Buttons (m3.material.io/develop/web) */}
        <div className="flex items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2 w-full sm:w-auto">
          <button
            onClick={() => onPlay(currentItem)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2.5 h-11 sm:h-12 px-6 sm:px-8 rounded-full bg-white text-black font-semibold text-sm sm:text-base transition-all hover:bg-white/90 active:scale-95 shadow-[var(--md-sys-elevation-level2)]"
          >
            <Play className="h-4 sm:h-5 w-4 sm:w-5 fill-black" />
            <span>Play</span>
          </button>

          <button
            onClick={() => onMoreInfo(currentItem)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2.5 h-11 sm:h-12 px-5 sm:px-7 rounded-full bg-[#3A4750]/80 hover:bg-[#3A4750] text-[#F3F3F3] font-medium text-sm sm:text-base border border-white/10 backdrop-blur-md transition-all active:scale-95 shadow-[var(--md-sys-elevation-level1)]"
          >
            <Info className="h-4 sm:h-5 w-4 sm:w-5 stroke-white" />
            <span>More Info</span>
          </button>
        </div>
      </div>

      {/* Right Edge: Sound Toggle & Maturity Badge */}
      <div className="absolute z-[3] right-4 sm:right-[var(--dx-gutter,3rem)] top-16 sm:top-auto sm:bottom-[calc(5vw+3.5rem)] flex items-center gap-2 sm:gap-3">
        {videoEnded ? (
          <button
            onClick={handleReplay}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/50 text-white backdrop-blur-md transition-transform hover:scale-110"
            title="Replay"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        ) : isVideoPlaying ? (
          <button
            onClick={toggleMute}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/50 text-white backdrop-blur-md transition-transform hover:scale-110"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        ) : null}

        <div className="flex items-center border-l-2 border-white bg-black/40 px-3.5 py-1 text-xs font-bold text-zinc-200 backdrop-blur-md">
          TV-MA
        </div>
      </div>

      {/* Progress Dots Bar Indicator */}
      <div className="absolute z-[3] right-[var(--dx-gutter,3rem)] bottom-[calc(5vw+1.5rem)] flex items-center gap-1.5">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`relative h-[3px] rounded-full overflow-hidden transition-all duration-300 ${
              idx === currentIndex ? 'w-12 bg-white/30' : 'w-6 bg-white/20 hover:bg-white/40'
            }`}
          >
            {idx === currentIndex && !isVideoPlaying && isVisible && (
              <span
                className="absolute inset-0 bg-white"
                style={{
                  transformOrigin: 'left',
                  animation: 'dx-progress 9s linear both',
                }}
              />
            )}
            {idx === currentIndex && (isVideoPlaying || !isVisible) && (
              <span className="absolute inset-0 bg-white" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export const HeroBillboard = memo(HeroBillboardComponent);
