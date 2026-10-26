import React, { useState, useEffect, useRef } from 'react';
import { Play, Info, Volume2, VolumeX, RotateCcw, Star, Calendar } from 'lucide-react';
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
    }, 8000);
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
    <div className="relative h-[80vh] min-h-[550px] w-full overflow-hidden bg-black lg:h-screen">
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

      {/* Multi-stop Vignette Protection Gradients */}
      <div className="absolute inset-0 billboard-vignette pointer-events-none" />
      <div className="absolute inset-0 billboard-left-protection pointer-events-none" />

      {/* Billboard Hero Content Placement */}
      <div className="absolute bottom-[16%] left-0 right-0 z-20 text-white sm:bottom-[18%] lg:bottom-[20%]">
        <div className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-8">
          {/* Logo or Stylized Typography Title */}
          <div className="mb-4 max-w-xl">
            {currentItem.logo_path ? (
              <img
                src={currentItem.logo_path}
                alt={currentItem.title || currentItem.name}
                className="max-h-[90px] sm:max-h-[110px] w-auto object-contain drop-shadow-2xl"
              />
            ) : (
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl drop-shadow-lg">
                {currentItem.title || currentItem.name}
              </h1>
            )}
          </div>

          {/* Badges & Meta Info */}
          <div className="mb-3 flex items-center gap-3 text-sm font-medium text-gray-300">
            {currentItem.rank && (
              <span className="flex items-center rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white uppercase tracking-wider">
                TOP 10 TODAY
              </span>
            )}
            <span className="rounded border border-gray-600 px-1.5 py-0.2 text-xs uppercase text-gray-200">
              {currentItem.media_type}
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-white font-semibold">{currentItem.vote_average.toFixed(1)}</span>
            </span>
            <span className="flex items-center gap-1 text-gray-300">
              <Calendar className="h-4 w-4" />
              <span>{currentItem.release_date.split('-')[0]}</span>
            </span>
            <span className="rounded border border-gray-500/80 px-1.5 py-0.2 text-[11px] font-bold text-gray-300">
              HD
            </span>
          </div>

          {/* Synopsis */}
          <p className="line-clamp-3 max-w-xl text-sm text-gray-200 sm:text-base lg:text-lg drop-shadow-md">
            {currentItem.overview}
          </p>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={() => onPlay(currentItem)}
              className="flex items-center justify-center gap-2 rounded-md bg-white px-7 py-2.5 text-base font-bold text-black shadow-lg transition-transform hover:scale-105 hover:bg-gray-200 active:scale-95"
            >
              <Play className="h-5 w-5 fill-black" /> Play
            </button>

            <button
              onClick={() => onMoreInfo(currentItem)}
              className="flex items-center justify-center gap-2 rounded-md border border-white/60 bg-zinc-900/60 px-6 py-2.5 text-base font-semibold text-white backdrop-blur-sm transition-transform hover:scale-105 hover:bg-zinc-800/80 active:scale-95"
            >
              <Info className="h-5 w-5" /> More Info
            </button>
          </div>
        </div>
      </div>

      {/* Right Edge Controls: Audio Toggle, Replay & Age Rating Badge */}
      <div className="absolute bottom-[20%] right-4 z-30 flex items-center gap-3 sm:right-8">
        {videoEnded ? (
          <button
            onClick={handleReplay}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/50 text-white backdrop-blur-sm transition-transform hover:scale-110 hover:border-white"
            title="Replay Preview"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        ) : isVideoPlaying ? (
          <button
            onClick={toggleMute}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/50 text-white backdrop-blur-sm transition-transform hover:scale-110 hover:border-white"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        ) : null}

        <div className="flex items-center border-l-2 border-white bg-black/40 px-3 py-1 text-xs font-semibold text-gray-200 backdrop-blur-sm">
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
              idx === currentIndex ? 'w-6 bg-red-600' : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
