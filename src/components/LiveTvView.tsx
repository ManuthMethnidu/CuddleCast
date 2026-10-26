import React, { useState, useRef, useEffect } from 'react';
import { Tv2, Play } from 'lucide-react';
import Hls from 'hls.js';
import { useAccent } from '../context/AccentContext';

interface Channel {
  id: string;
  name: string;
  category: 'News' | 'Sports' | 'Entertainment' | 'Documentary';
  logo: string;
  streamUrl: string;
  currentProgram: string;
  nextProgram: string;
  resolution: string;
}

const CHANNELS: Channel[] = [
  {
    id: 'bbc-news',
    name: 'BBC News HD',
    category: 'News',
    logo: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=120&q=80',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    currentProgram: 'Global News Hour: Live Bulletins & Analysis',
    nextProgram: 'BBC HardTalk: World Leaders Interview',
    resolution: '1080p 60fps',
  },
  {
    id: 'bloomberg',
    name: 'Bloomberg Television',
    category: 'News',
    logo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=120&q=80',
    streamUrl: 'https://test-streams.mux.dev/pts_shift/master.m3u8',
    currentProgram: 'Bloomberg Markets: Wall Street Live Bell',
    nextProgram: 'Technology Radar: AI & Silicon Valley',
    resolution: '1080p',
  },
  {
    id: 'sky-news',
    name: 'Sky News UK',
    category: 'News',
    logo: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=120&q=80',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    currentProgram: 'Press Preview & Breaking Headlines',
    nextProgram: 'Sky World News Bulletin',
    resolution: '1080p',
  },
  {
    id: 'redbull',
    name: 'Red Bull TV Extreme',
    category: 'Sports',
    logo: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=120&q=80',
    streamUrl: 'https://test-streams.mux.dev/pts_shift/master.m3u8',
    currentProgram: 'Downhill Mountain Biking: World Cup Finals',
    nextProgram: 'Cliff Diving Series: Azores Islands',
    resolution: '1080p 60fps',
  },
  {
    id: 'nasa',
    name: 'NASA TV Live ISS',
    category: 'Documentary',
    logo: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=120&q=80',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    currentProgram: 'International Space Station: Live Earth Views',
    nextProgram: 'Artemis Moon Mission Science Briefing',
    resolution: '1080p',
  },
  {
    id: 'euronews',
    name: 'Euronews Global',
    category: 'News',
    logo: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=120&q=80',
    streamUrl: 'https://test-streams.mux.dev/pts_shift/master.m3u8',
    currentProgram: 'Europe Tonight: Culture, Politics & Economy',
    nextProgram: 'No Comment: Uncut Global Footage',
    resolution: '720p',
  },
];

export const LiveTvView: React.FC = () => {
  const { accentHex } = useAccent();
  const [selectedChannel, setSelectedChannel] = useState<Channel>(CHANNELS[0]);
  const [activeCategory, setActiveCategory] = useState<'All' | 'News' | 'Sports' | 'Documentary'>('All');
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(selectedChannel.streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = selectedChannel.streamUrl;
      video.play().catch(() => {});
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [selectedChannel]);

  const filteredChannels = activeCategory === 'All'
    ? CHANNELS
    : CHANNELS.filter(c => c.category === activeCategory);

  return (
    <div className="mx-auto max-w-[1560px] px-3.5 sm:px-12 pt-16 sm:pt-20 pb-20 select-none animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-500"
          >
            <Tv2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Live TV & IPTV</span>
              <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                Live 24/7
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live broadcast streams, breaking international news, and 24/7 extreme sports
            </p>
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 rounded-xl bg-[#18181d] border border-white/10 p-1">
          {(['All', 'News', 'Sports', 'Documentary'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-white/15 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: Video Player + Channel List */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live TV Video Player Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative aspect-video w-full rounded-2xl bg-black overflow-hidden border border-white/10 shadow-2xl">
            <video
              ref={videoRef}
              controls
              playsInline
              autoPlay
              muted
              className="h-full w-full object-contain"
            />
            {/* Live Indicator Overlay */}
            <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-600 font-black text-[10px] tracking-wider text-white shadow">
                <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                LIVE
              </span>
              <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur text-xs font-mono font-bold text-white border border-white/20">
                {selectedChannel.name}
              </span>
            </div>
          </div>

          {/* Current Program Info */}
          <div className="rounded-2xl bg-[#131317] border border-white/10 p-4 sm:p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono text-red-400 uppercase font-bold tracking-wider">
                  Now Broadcasting
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                  {selectedChannel.currentProgram}
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-1">
                  Up Next: {selectedChannel.nextProgram}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-white/10 font-mono text-xs text-zinc-300">
                {selectedChannel.resolution}
              </span>
            </div>
          </div>
        </div>

        {/* EPG Channel List Column (1 Col) */}
        <div className="rounded-2xl bg-[#131317] border border-white/10 p-4 flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-none">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Channel Guide ({filteredChannels.length})
            </span>
            <span className="text-[10px] font-mono text-zinc-400">Low Latency</span>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-2">
            {filteredChannels.map(ch => {
              const isSelected = selectedChannel.id === ch.id;
              return (
                <div
                  key={ch.id}
                  onClick={() => setSelectedChannel(ch)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-white/15 border-white/30 text-white shadow-lg'
                      : 'bg-[#18181d] border-white/5 hover:border-white/20 text-zinc-300'
                  }`}
                  style={{
                    borderLeft: isSelected ? `4px solid ${accentHex}` : undefined,
                  }}
                >
                  <img
                    src={ch.logo}
                    alt={ch.name}
                    className="h-10 w-10 rounded-lg object-cover flex-none border border-white/10"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{ch.name}</p>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">{ch.currentProgram}</p>
                  </div>
                  {isSelected && (
                    <Play className="h-3.5 w-3.5 fill-white text-white flex-none" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
