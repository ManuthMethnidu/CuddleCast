import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, X, Volume2, VolumeX, Music, Radio as RadioIcon } from 'lucide-react';
import { useAccent } from '../context/AccentContext';

export interface RadioStation {
  id: string;
  name: string;
  genre: string;
  bitrate: number;
  codec: string;
  url: string;
  cover: string;
}

const STATIONS: RadioStation[] = [
  {
    id: 'lofi',
    name: 'Lofi Girl - Chill Study Beats',
    genre: 'Lo-Fi / Chillhop',
    bitrate: 192,
    codec: 'MP3',
    url: 'https://play.streamafrica.net/lofiradio',
    cover: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 'synthwave',
    name: 'Nightride FM - Cyberpunk & Synth',
    genre: 'Synthwave / Retrowave',
    bitrate: 320,
    codec: 'AAC',
    url: 'https://stream.zeno.fm/0r0xa792kwzuv',
    cover: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 'chillhop',
    name: 'Chillhop Cafe & Coffee Beats',
    genre: 'Jazzy Hip-Hop',
    bitrate: 160,
    codec: 'MP3',
    url: 'https://streams.ilovemusic.de/iloveradio17.mp3',
    cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 'bbc',
    name: 'BBC World Service Live',
    genre: 'Global News & Talk',
    bitrate: 128,
    codec: 'AAC',
    url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service',
    cover: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=120&q=80',
  },
];

interface RadioPlayerProps {
  isVisible: boolean;
  onClose: () => void;
}

export const RadioPlayer: React.FC<RadioPlayerProps> = ({ isVisible, onClose }) => {
  const { accentHex } = useAccent();
  const [currentStation, setCurrentStation] = useState<RadioStation>(STATIONS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isStationMenuOpen, setIsStationMenuOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentStation]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSelectStation = (st: RadioStation) => {
    setCurrentStation(st);
    setIsStationMenuOpen(false);
    setIsPlaying(true);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[140] w-80 sm:w-96 rounded-2xl bg-[#131317]/95 border border-white/10 p-3.5 shadow-2xl backdrop-blur-xl text-white select-none animate-fadeIn">
      <audio ref={audioRef} src={currentStation.url} preload="none" />

      {/* Top Station Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <RadioIcon className="h-4 w-4 animate-pulse" style={{ color: accentHex }} />
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
            Live Stream Radio
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Hide Radio Player"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Main Track Info */}
      <div className="flex items-center gap-3">
        {/* Cover with animated wave */}
        <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-black/60 flex-none border border-white/10">
          <img
            src={currentStation.cover}
            alt={currentStation.name}
            className="h-full w-full object-cover"
          />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-0.5 p-1">
              <span className="w-1 bg-white rounded-full animate-bounce h-3" />
              <span className="w-1 bg-white rounded-full animate-bounce h-5 delay-100" />
              <span className="w-1 bg-white rounded-full animate-bounce h-2 delay-200" />
              <span className="w-1 bg-white rounded-full animate-bounce h-4 delay-300" />
            </div>
          )}
        </div>

        {/* Text Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white truncate">{currentStation.name}</p>
          <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono mt-0.5">
            <span>{currentStation.genre}</span>
            <span>•</span>
            <span>{currentStation.bitrate}kbps</span>
          </div>
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="flex h-9 w-9 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 active:scale-95 flex-none"
          style={{ background: accentHex }}
        >
          {isPlaying ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white ml-0.5" />}
        </button>
      </div>

      {/* Bottom Controls: Station Dropdown + Volume */}
      <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
        <button
          onClick={() => setIsStationMenuOpen(!isStationMenuOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors text-[11px] font-semibold"
        >
          <Music className="h-3 w-3" />
          <span>Switch Station</span>
        </button>

        {/* Volume */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-zinc-400 hover:text-white p-1"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-3.5 w-3.5" />
            ) : (
              <Volume2 className="h-3.5 w-3.5" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={e => {
              setVolume(Number(e.target.value));
              setIsMuted(false);
            }}
            className="h-1 w-14 rounded bg-white/20 cursor-pointer"
            style={{ accentColor: accentHex }}
          />
        </div>
      </div>

      {/* Station Dropdown List */}
      {isStationMenuOpen && (
        <div className="mt-2.5 rounded-xl bg-[#0b0b0d] border border-white/10 p-1.5 space-y-1 animate-fadeIn">
          {STATIONS.map(st => (
            <button
              key={st.id}
              onClick={() => handleSelectStation(st)}
              className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${
                currentStation.id === st.id
                  ? 'bg-white/15 text-white font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="truncate">{st.name}</span>
              <span className="text-[10px] font-mono text-zinc-500 ml-2">{st.codec}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
