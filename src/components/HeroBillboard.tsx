import React, { useState, useEffect, useRef } from 'react';
import { Play, Info, Volume2, VolumeX, RotateCcw, Star, Calendar, Sparkles } from 'lucide-react';
import Hls from 'hls.js';
import { BillboardData } from '../types/schema';

interface HeroBillboardProps {
  items: BillboardData[];
  onPlay: (item: BillboardData) => void;
  onMoreInfo: (item: BillboardData) => void;
}

export const HeroBillboard: React.FC<HeroBillboardProps> = ({
  items,
  onPlay,
  onMoreInfo,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoEnded, setVideoEnded] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const timerRef = useRef<number | null>(null);

  const currentItem = items[currentIndex] || items[0];

  // Auto-advance billboard slide if user hasn't started playing video
  useEffect(() => {
    if (isVideoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % items.length);
    }, 8500);
    return () => clearInterval(interval);
  }, [items.length, isVideoPlaying]);

  // Traced trailer autoplay preview delay (1200ms)
  useEffect(() => {
    setIsVideoPlaying(false);
    setVideoEnded(false);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = window.setTimeout(() => {
      const video = videoRef.current;
      const streamUrl = currentItem?.trailerUrl || currentItem?.streamUrl;

      if (!video || !streamUrl) return;

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      if (Hls.isSupported() && streamUrl.includes('.m3u8')) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          maxMaxBufferLength: 30,
        });
        hlsRef.current = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().then(() => setIsVideoPlaying(true)).catch(() => {});
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.play().then(() => setIsVideoPlaying(true)).catch(() => {});
      }
    }, 1200);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentIndex, currentItem]);

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
    <div className="relative h-[82vh] min-h-[580px] w-full overflow-hidden bg-[#070b14] lg:h-[90vh]">
      {/* Background Poster Image */}
      <img
        src={currentItem.backdrop_path || currentItem.poster_path}
        alt={currentItem.title || currentItem.name}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
          isVideoPlaying && !videoEnded ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ objectPosition: 'center 20%' }}
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

      {/* Multi-stop Midnight Cinema Protection Gradients */}
      <div className="absolute inset-0 billboard-vignette pointer-events-none" />
      <div className="absolute inset-0 billboard-left-protection pointer-events-none" />

      {/* Billboard Hero Content Placement */}
      <div className="absolute bottom-[16%] left-0 right-0 z-20 text-white sm:bottom-[18%] lg:bottom-[22%]">
        <div className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-8">
          {/* Logo or Stylized Typography Title */}
          <div className="mb-4 max-w-2xl">
            {currentItem.logo_path ? (
              <img
                src={currentItem.logo_path}
                alt={currentItem.title || currentItem.name}
                className="max-h-[100px] sm:max-h-[125px] w-auto object-contain drop-shadow-[0_4px_25px_rgba(0,0,0,0.9)]"
              />
            ) : (
              <h1 className="text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)] bg-gradient-to-r from-white via-slate-100 to-sky-200 bg-clip-text text-transparent">
                {currentItem.title || currentItem.name}
              </h1>
            )}
          </div>

          {/* Badges & Meta Info */}
          <div className="mb-3.5 flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-medium text-slate-300">
            {currentItem.rank && (
              <span className="flex items-center gap-1 rounded-md bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 px-2.5 py-0.5 text-xs font-black text-white uppercase tracking-wider shadow-[0_0_15px_rgba(37,99,235,0.6)]">
                <Sparkles className="h-3 w-3" /> TOP 10 TODAY
              </span>
            )}
            <span className="rounded-md border border-slate-700 bg-slate-900/60 px-2 py-0.5 text-xs uppercase text-slate-200">
              {currentItem.media_type}
            </span>
            <span className="flex items-center gap-1 text-amber-400 font-semibold bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-700">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{currentItem.vote_average.toFixed(1)}</span>
            </span>
            <span className="flex items-center gap-1 text-slate-300 bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-700">
              <Calendar className="h-3.5 w-3.5 text-sky-400" />
              <span>{currentItem.release_date.split('-')[0]}</span>
            </span>
            <span className="rounded-md border border-sky-500/40 bg-sky-950/40 px-2 py-0.5 text-[11px] font-bold text-sky-300">
              4K ULTRA HD
            </span>
          </div>

          {/* Synopsis */}
          <p className="line-clamp-3 max-w-xl text-sm text-slate-200 sm:text-base lg:text-lg leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            {currentItem.overview}
          </p>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={() => onPlay(currentItem)}
              className="flex items-center justify-center gap-2.5 rounded-xl bg-white px-8 py-3 text-base font-bold text-slate-950 shadow-[0_4px_25px_rgba(255,255,255,0.3)] transition-all hover:scale-105 hover:bg-sky-100 hover:shadow-[0_4px_30px_rgba(56,189,248,0.5)] active:scale-95"
            >
              <Play className="h-5 w-5 fill-slate-950" /> Play
            </button>

            <button
              onClick={() => onMoreInfo(currentItem)}
              className="flex items-center justify-center gap-2.5 rounded-xl border border-sky-400/30 bg-slate-900/70 px-7 py-3 text-base font-semibold text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-blue-900/40 hover:border-sky-400 active:scale-95 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
            >
              <Info className="h-5 w-5 text-sky-400" /> More Info
            </button>
          </div>
        </div>
      </div>

      {/* Right Edge Controls: Audio Toggle, Replay & Age Rating Badge */}
      <div className="absolute bottom-[20%] right-4 z-30 flex items-center gap-3 sm:right-8">
        {videoEnded ? (
          <button
            onClick={handleReplay}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-sky-400/40 bg-slate-900/70 text-white backdrop-blur-md transition-all hover:scale-110 hover:border-sky-400 hover:text-sky-300 shadow-lg"
            title="Replay Preview"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        ) : isVideoPlaying ? (
          <button
            onClick={toggleMute}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-sky-400/40 bg-slate-900/70 text-white backdrop-blur-md transition-all hover:scale-110 hover:border-sky-400 hover:text-sky-300 shadow-lg"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        ) : null}

        <div className="flex items-center border-l-2 border-sky-400 bg-slate-950/70 px-3.5 py-1 text-xs font-bold text-sky-200 backdrop-blur-md rounded-r-md">
          TV-MA
        </div>
      </div>

      {/* Carousel Dots Pagination Indicator */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? 'w-8 bg-gradient-to-r from-sky-400 to-blue-500 shadow-[0_0_12px_rgba(56,189,248,0.8)]'
                : 'w-2.5 bg-slate-600/60 hover:bg-slate-400'
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
