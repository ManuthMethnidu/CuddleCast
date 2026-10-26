import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Tv2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  Search,
  Star,
  Shuffle,
  Clock,
  Sparkles,
  Film,
  Radio,
  Flame,
  X,
} from 'lucide-react';
import Hls from 'hls.js';
import { useAccent } from '../context/AccentContext';

export interface TvChannel {
  id: string;
  name: string;
  category: 'News' | 'Sports' | 'Movies' | 'Anime' | 'Comedy' | 'Documentary' | 'Music';
  country: string;
  logo: string;
  callsign: string;
  brandColor: string;
  brandBg: string;
  streamUrl: string;
  currentProgram: string;
  description: string;
  nextProgram: string;
  resolution: string;
  channelNumber: number;
}

export const REAL_TV_CHANNELS: TvChannel[] = [
  {
    id: 'bloomberg',
    name: 'Bloomberg Television HD',
    category: 'News',
    country: 'US',
    callsign: 'BLOOMBERG',
    brandColor: '#F9A825',
    brandBg: '#0a0d12',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Bloomberg_Television_logo.svg/320px-Bloomberg_Television_logo.svg.png',
    streamUrl: 'https://liveprodusphoenixeast.global.ssl.fastly.net/USPhx-HD/Channel-TX-USPhx-AWS-virginia-1/Source-USPhx-16k-1-s6lk2-BP-07-02-81ykIWnsMsg_live.m3u8',
    currentProgram: 'Bloomberg Markets: The Close & Global Wall Street',
    description: 'Real-time financial markets analysis, live NYSE/Nasdaq trading bell, and macroeconomic insights.',
    nextProgram: 'Technology Radar: AI Innovation & Silicon Valley',
    resolution: '1080p 60fps',
    channelNumber: 1,
  },
  {
    id: 'dw-news',
    name: 'DW News English HD',
    category: 'News',
    country: 'DE',
    callsign: 'DW NEWS',
    brandColor: '#00A3FF',
    brandBg: '#031424',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Deutsche_Welle_Logo.svg/320px-Deutsche_Welle_Logo.svg.png',
    streamUrl: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8',
    currentProgram: 'DW News Live: European Affairs & Global Headlines',
    description: 'Independent in-depth reporting from Germany, Brussels, and across the European continent.',
    nextProgram: 'Business Africa: Economic Transformation',
    resolution: '1080p',
    channelNumber: 2,
  },
  {
    id: 'redbull',
    name: 'Red Bull TV Extreme',
    category: 'Sports',
    country: 'AT',
    callsign: 'RED BULL',
    brandColor: '#FF1E44',
    brandBg: '#0B192C',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Red_Bull_TV_logo.svg/320px-Red_Bull_TV_logo.svg.png',
    streamUrl: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
    currentProgram: 'UCI Mountain Bike World Cup: Downhill Finals',
    description: 'High-octane adrenaline sports, downhill mountain biking, cliff diving, and extreme motorsports.',
    nextProgram: 'Red Bull Hardline: Welsh Mountains Championship',
    resolution: '1080p 60fps',
    channelNumber: 3,
  },
  {
    id: 'espn8',
    name: 'ESPN8: The Ocho HD',
    category: 'Sports',
    country: 'US',
    callsign: 'ESPN 8',
    brandColor: '#EF4444',
    brandBg: '#1C0606',
    logo: 'https://images.fubo.tv/channel-config-ui/station-logos/on-dark/espn_8_the_ocho_bw.png',
    streamUrl: 'https://d3b6q2ou5kp8ke.cloudfront.net/ESPNTheOcho.m3u8',
    currentProgram: 'World Dodgeball Championships & Cornhole Invitational',
    description: 'Seldom-seen sports, extreme dodgeball, ultimate tag, and quirky athletic showdowns.',
    nextProgram: 'Slippery Stairs World Series Finals',
    resolution: '1080p',
    channelNumber: 4,
  },
  {
    id: 'naruto',
    name: 'Naruto 24/7 Anime HD',
    category: 'Anime',
    country: 'JP',
    callsign: 'NARUTO',
    brandColor: '#FF7A00',
    brandBg: '#210F02',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Naruto_logo.svg/320px-Naruto_logo.svg.png',
    streamUrl: 'https://d21vn5eki5qsdi.cloudfront.net/playlist.m3u8',
    currentProgram: 'Naruto Shippuden: Chunin Exam & Akatsuki Arc',
    description: 'Continuous 24/7 broadcast of Naruto and Naruto Shippuden uncut episodes in high definition.',
    nextProgram: 'Naruto Shippuden: Five Kage Summit Battle',
    resolution: '1080p',
    channelNumber: 5,
  },
  {
    id: 'snl-vault',
    name: 'Saturday Night Live Vault',
    category: 'Comedy',
    country: 'US',
    callsign: 'SNL VAULT',
    brandColor: '#FBBF24',
    brandBg: '#1C1502',
    logo: 'https://provider-static.plex.tv/epg/cms/production/712dae9e-9111-4bbc-8ea4-242e891ab5b3/snl-vault-fclogo-72-dpi-1500-x-1000-3-2-channel-logo-dark-plex-1.png',
    streamUrl: 'https://d4whmvwm0rdvi.cloudfront.net/10007/99993017/hls/master.m3u8?ads.xumo_channelId=99993017',
    currentProgram: 'SNL Golden Decades: Weekend Update & Sketches',
    description: 'Legendary comedy sketches, celebrity guest hosts, and musical performances from 5 decades.',
    nextProgram: 'Best of Will Ferrell & Tina Fey Special',
    resolution: '1080p',
    channelNumber: 6,
  },
  {
    id: 'nasa-tv',
    name: 'NASA TV Live ISS Views',
    category: 'Documentary',
    country: 'US',
    callsign: 'NASA TV',
    brandColor: '#60A5FA',
    brandBg: '#031124',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/320px-NASA_logo.svg.png',
    streamUrl: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8',
    currentProgram: 'International Space Station: Live Earth Orbit',
    description: 'Live uninterrupted views of planet Earth from the ISS, spacewalks, and mission operations.',
    nextProgram: 'Artemis Lunar Gateway Mission Briefing',
    resolution: '1080p',
    channelNumber: 7,
  },
  {
    id: 'movies-24h',
    name: '24 Hour Free Movies',
    category: 'Movies',
    country: 'US',
    callsign: '24H MOVIES',
    brandColor: '#F43F5E',
    brandBg: '#1C0308',
    logo: 'https://i.imgur.com/iSVnzR1.png',
    streamUrl: 'https://d1j2u714xk898n.cloudfront.net/scheduler/scheduleMaster/145.m3u8',
    currentProgram: 'Hollywood Feature Cinema Showcase',
    description: 'Uncut feature-length movies, sci-fi classics, action thrillers, and indie gems around the clock.',
    nextProgram: 'Midnight Sci-Fi Double Feature',
    resolution: '720p HD',
    channelNumber: 8,
  },
  {
    id: 'american-crime',
    name: 'American Crime Channel',
    category: 'Movies',
    country: 'US',
    callsign: 'CRIME TV',
    brandColor: '#C084FC',
    brandBg: '#180424',
    logo: 'https://provider-static.plex.tv/epg/cms/production/5d4ac35c-dd3f-4f56-a272-41ebfe3477a9/american_crime_channel_dark_logo_-_Kam_JeyRDXV2.png',
    streamUrl: 'https://d39g1vxj2ef6in.cloudfront.net/v1/master/3fec3e5cac39a52b2132f9c66c83dae043dc17d4/prod-rakuten-stitched/master.m3u8?ads.xumo_channelId=88883104',
    currentProgram: 'True Detective Casefiles: Murder Investigation',
    description: 'Gripping true-crime drama, forensic investigations, and unsolved cold case documentaries.',
    nextProgram: 'Cold Case Files: FBI Profilers Special',
    resolution: '1080p',
    channelNumber: 9,
  },
  {
    id: 'ninja-warrior',
    name: 'American Ninja Warrior Live',
    category: 'Sports',
    country: 'US',
    callsign: 'NINJA',
    brandColor: '#34D399',
    brandBg: '#021C11',
    logo: 'https://raw.githubusercontent.com/RoqueDJ/iptv-svg/main/1792421696158.png',
    streamUrl: 'https://d4whmvwm0rdvi.cloudfront.net/10007/99951318/hls/master.m3u8?ads.xumo_channelId=99951318',
    currentProgram: 'National Finals Stage 3: Midoriyama Gauntlet',
    description: 'Elite obstacle athletes tackling superhuman courses in high-stakes speed competition.',
    nextProgram: 'All-Star Skills Challenge & Warped Wall Shootout',
    resolution: '1080p 60fps',
    channelNumber: 10,
  },
  {
    id: 'trt-world',
    name: 'TRT World HD',
    category: 'News',
    country: 'TR',
    callsign: 'TRT WORLD',
    brandColor: '#2DD4BF',
    brandBg: '#021C18',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/TRT_World_logo.svg/320px-TRT_World_logo.svg.png',
    streamUrl: 'https://tv-trtworld.medya.trt.com.tr/master.m3u8',
    currentProgram: 'TRT World News Hour: Middle East & Asia Report',
    description: 'Global news network delivering frontline journalism from Istanbul, London, and Washington.',
    nextProgram: 'The Newsmakers: Diplomatic Roundtable',
    resolution: '1080p',
    channelNumber: 11,
  },
  {
    id: 'mst3k',
    name: 'Mystery Science Theater 3000',
    category: 'Comedy',
    country: 'US',
    callsign: 'MST3K',
    brandColor: '#38BDF8',
    brandBg: '#021B24',
    logo: 'https://i.imgur.com/8KWjY4o.png',
    streamUrl: 'https://d1c73nj8qxp55a.cloudfront.net/Mystery_Science_Theater_3000.m3u8',
    currentProgram: 'MST3K: Satellite of Love B-Movie Roast',
    description: 'Joel, Mike, and the Bots riff on the cheesiest sci-fi and monster movies ever created.',
    nextProgram: 'MST3K: Manos The Hands of Fate Riff',
    resolution: '1080p',
    channelNumber: 12,
  },
  {
    id: 'dd-sports',
    name: 'DD Sports HD',
    category: 'Sports',
    country: 'IN',
    callsign: 'DD SPORTS',
    brandColor: '#60A5FA',
    brandBg: '#051326',
    logo: 'https://dtil.tmsimg.com/assets/s158255_ld_h15_aa.png?lock=720x540',
    streamUrl: 'https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/b17adfe543354fdd8d189b110617cddd/index.m3u8',
    currentProgram: 'International Cricket Series & Track Athletics',
    description: 'Live cricket tournaments, badminton championships, and national sports festivals.',
    nextProgram: 'Asian Games Highlights & Kabaddi League',
    resolution: '1080p',
    channelNumber: 13,
  },
  {
    id: 'golf-kingdom',
    name: 'Golf Kingdom TV',
    category: 'Sports',
    country: 'US',
    callsign: 'GOLF',
    brandColor: '#10B981',
    brandBg: '#021C12',
    logo: 'https://i.imgur.com/Lv53nh4.png',
    streamUrl: 'https://30a-tv.com/feeds/vidaa/golf.m3u8',
    currentProgram: 'PGA Tour Course Breakdown & Pro Swing Clinic',
    description: 'Championship course walk-throughs, professional golf tips, equipment reviews, and highlights.',
    nextProgram: 'Greatest Masters Moments & Hole-in-One Highlights',
    resolution: '720p HD',
    channelNumber: 14,
  },
  {
    id: 'africa-24-sport',
    name: 'Africa 24 Sport HD',
    category: 'Sports',
    country: 'FR',
    callsign: 'AFRICA 24',
    brandColor: '#F59E0B',
    brandBg: '#1C1002',
    logo: 'https://i0.wp.com/africa24tv.com/wp-content/uploads/2023/12/LOGO-AFRICASPORT-4-HD-sans-fond.png?fit=512%2C107&ssl=1',
    streamUrl: 'https://africa24sport.vedge.infomaniak.com/livecast/africa24sport/manifest.m3u8',
    currentProgram: 'African Champions League: Matchday Live',
    description: 'Live football championships, athletics, basketball, and Pan-African sports news.',
    nextProgram: 'CAF Nations Cup Vault & Player Profiles',
    resolution: '1080p',
    channelNumber: 15,
  },
  {
    id: 'afrobeats',
    name: 'Afrobeat TV HD',
    category: 'Music',
    country: 'UK',
    callsign: 'AFROBEAT',
    brandColor: '#F472B6',
    brandBg: '#210415',
    logo: 'https://i.imgur.com/232ndRK.png',
    streamUrl: 'https://stream.ecable.tv/afrobeats/index.m3u8',
    currentProgram: 'Afrobeat Top 40: Burna Boy, Wizkid & Asake',
    description: 'The hottest Afrobeat, Amapiano, and dancehall music videos and live stadium sets.',
    nextProgram: 'Amapiano Groove Sessions Live from Lagos',
    resolution: '1080p',
    channelNumber: 16,
  },
  {
    id: 'cat-info',
    name: '3CatInfo HD News',
    category: 'News',
    country: 'ES',
    callsign: '3CAT INFO',
    brandColor: '#F87171',
    brandBg: '#1C0303',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/3CatInfo_logo.svg/320px-3CatInfo_logo.svg.png',
    streamUrl: 'https://directes-tv-int.3catdirectes.cat/live-origin/canal324-hls/master.m3u8',
    currentProgram: '3CatInfo 24h: Mediterranean & Global Bulletin',
    description: '24-hour non-stop breaking news, debates, weather radar, and international analysis.',
    nextProgram: 'Mundo 324: Geopolitics & Technology',
    resolution: '1080p',
    channelNumber: 17,
  },
  {
    id: 'kids-3abn',
    name: '3ABN Kids Animated',
    category: 'Anime',
    country: 'US',
    callsign: 'KIDS TV',
    brandColor: '#A78BFA',
    brandBg: '#120421',
    logo: 'https://i.imgur.com/z3npqO1.png',
    streamUrl: 'https://3abn.bozztv.com/3abn2/Kids_live/smil:Kids_live.smil/playlist.m3u8',
    currentProgram: 'Animated Clubhouse Adventures & Storytime',
    description: 'Fun, character-building cartoons and educational animated adventures for children.',
    nextProgram: 'Nature Safari & Animal Explorers',
    resolution: '720p HD',
    channelNumber: 18,
  },
  {
    id: '30a-music',
    name: '30A Music Channel Live',
    category: 'Music',
    country: 'US',
    callsign: '30A MUSIC',
    brandColor: '#22D3EE',
    brandBg: '#02171C',
    logo: 'https://i.imgur.com/gNWg9tl.png',
    streamUrl: 'https://30a-tv.com/music.m3u8',
    currentProgram: 'Songwriters Island: Coastal Acoustic Live',
    description: 'Live beachfront concerts, emerging acoustic singer-songwriters, and indie sets.',
    nextProgram: 'Gulf Coast Sunset Sessions',
    resolution: '720p HD',
    channelNumber: 19,
  },
  {
    id: 'darcizzle',
    name: 'Darcizzle Offshore Fishing',
    category: 'Sports',
    country: 'US',
    callsign: 'OFFSHORE',
    brandColor: '#38BDF8',
    brandBg: '#021621',
    logo: 'https://i.imgur.com/Q4l2uao.png',
    streamUrl: 'https://30a-tv.com/darcizzle.m3u8',
    currentProgram: 'Deep Sea Sailfish & Monster Shark Expeditions',
    description: 'Thrilling offshore fishing excursions in the Gulf Stream, tackle tips, and boat adventures.',
    nextProgram: 'Florida Keys Tarpon Tournament',
    resolution: '720p HD',
    channelNumber: 20,
  },
];

// Reliable Broadcaster Logo Badge with Graceful Fallback
const ChannelLogo: React.FC<{
  channel: TvChannel;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ channel, size = 'md', className = '' }) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses =
    size === 'sm'
      ? 'h-9 w-9 text-[9px]'
      : size === 'lg'
      ? 'h-12 w-12 text-xs font-black'
      : 'h-11 w-11 text-[10px] font-bold';

  if (!channel.logo || hasError) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-white/10 select-none shadow-md ${sizeClasses} ${className}`}
        style={{
          background: channel.brandBg,
          color: channel.brandColor,
        }}
      >
        <span className="font-black tracking-tight text-center px-1 truncate leading-none uppercase font-mono">
          {channel.callsign}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-xl overflow-hidden border border-white/10 flex items-center justify-center p-1 select-none shadow-md ${sizeClasses} ${className}`}
      style={{
        background: channel.brandBg,
      }}
    >
      <img
        src={channel.logo}
        alt={channel.name}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={() => setHasError(true)}
        className="max-h-full max-w-full object-contain"
      />
    </div>
  );
};

type CategoryFilter = 'All' | 'Favorites' | 'News' | 'Sports' | 'Movies' | 'Anime' | 'Comedy' | 'Documentary' | 'Music';

export const LiveTvView: React.FC = () => {
  const { accentHex } = useAccent();
  const [channels] = useState<TvChannel[]>(REAL_TV_CHANNELS);
  const [selectedChannel, setSelectedChannel] = useState<TvChannel>(REAL_TV_CHANNELS[0]);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [streamError, setStreamError] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);

  // Favorites saved in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('cuddlecast_tv_favorites');
      return stored ? JSON.parse(stored) : ['bloomberg', 'redbull', 'naruto'];
    } catch {
      return ['bloomberg', 'redbull', 'naruto'];
    }
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Toggle favorite channel
  const toggleFavorite = (channelId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      const updated = prev.includes(channelId)
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId];
      localStorage.setItem('cuddlecast_tv_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  // Switch channel handler
  const switchChannel = useCallback((channel: TvChannel) => {
    setSelectedChannel(channel);
    setStreamError(false);
    setIsBuffering(true);
  }, []);

  // Previous & Next Channel Surfing
  const handleNextChannel = () => {
    const currentIndex = channels.findIndex(c => c.id === selectedChannel.id);
    const nextIndex = (currentIndex + 1) % channels.length;
    switchChannel(channels[nextIndex]);
  };

  const handlePrevChannel = () => {
    const currentIndex = channels.findIndex(c => c.id === selectedChannel.id);
    const prevIndex = (currentIndex - 1 + channels.length) % channels.length;
    switchChannel(channels[prevIndex]);
  };

  // Random Zap Channel
  const handleRandomZap = () => {
    const pool = channels.filter(c => c.id !== selectedChannel.id);
    if (pool.length === 0) return;
    const randomChannel = pool[Math.floor(Math.random() * pool.length)];
    switchChannel(randomChannel);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    const container = playerContainerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // HLS Stream Attachment Loop
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setStreamError(false);
    setIsBuffering(true);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
        maxBufferLength: 30,
        manifestLoadingTimeOut: 10000,
      });
      hlsRef.current = hls;

      hls.loadSource(selectedChannel.streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsBuffering(false);
        if (isPlaying) {
          video.play().catch(() => {
            // Autoplay with sound might need muted start
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => {});
          });
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setStreamError(true);
              setIsBuffering(false);
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = selectedChannel.streamUrl;
      video.play().catch(() => {});
      setIsBuffering(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [selectedChannel, isPlaying]);

  // Sync volume & mute with video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Filter channels based on tab & query
  const filteredChannels = useMemo(() => {
    let list = channels;

    if (activeCategory === 'Favorites') {
      list = list.filter(c => favorites.includes(c.id));
    } else if (activeCategory !== 'All') {
      list = list.filter(c => c.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.currentProgram.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [channels, activeCategory, favorites, searchQuery]);

  // Dynamic EPG times calculated relative to current hour
  const now = new Date();
  const currentMinutes = now.getMinutes();
  const elapsedPercent = Math.min(100, Math.max(10, Math.round((currentMinutes / 60) * 100)));
  const minutesRemaining = 60 - currentMinutes;

  return (
    <div className="mx-auto max-w-[1560px] px-3.5 sm:px-8 lg:px-12 pt-16 sm:pt-20 pb-20 select-none animate-fadeIn">
      {/* Top TV Bar with Live Signals & Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-600/20 text-red-500 border border-red-500/30 shadow-lg shadow-red-500/10"
          >
            <Tv2 className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2.5">
              <span>LIVE TV & IPTV</span>
              <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                Live Broadcast
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">
              Real 24/7 IPTV streams · News, extreme sports, anime, cinema & comedy
            </p>
          </div>
        </div>

        {/* Search, Random Zap & Category Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Channel Search Input */}
          <div className="relative flex-1 md:w-60">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search channel or show..."
              className="w-full rounded-xl bg-[#14161c] border border-white/10 pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Random Zap Channel Button */}
          <button
            onClick={handleRandomZap}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all active:scale-95 border border-white/10"
            title="Zap to a random live TV channel"
          >
            <Shuffle className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Zap Channel</span>
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-3.5 border-b border-white/5">
        {(
          [
            'All',
            'Favorites',
            'News',
            'Sports',
            'Anime',
            'Comedy',
            'Movies',
            'Documentary',
            'Music',
          ] as const
        ).map(cat => {
          const isSelected = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-white/20 text-white border-white/30 shadow-md'
                  : 'bg-[#12141a] text-zinc-400 border-white/5 hover:border-white/15 hover:text-zinc-200'
              }`}
              style={{
                borderColor: isSelected ? accentHex : undefined,
              }}
            >
              {cat === 'Favorites' && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
              {cat === 'News' && <Radio className="h-3.5 w-3.5 text-sky-400" />}
              {cat === 'Sports' && <Flame className="h-3.5 w-3.5 text-orange-400" />}
              {cat === 'Movies' && <Film className="h-3.5 w-3.5 text-rose-400" />}
              {cat === 'Anime' && <Sparkles className="h-3.5 w-3.5 text-pink-400" />}
              <span>{cat}</span>
              {cat === 'Favorites' && (
                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 font-mono">
                  {favorites.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Grid: TV Video Player & EPG (Left) + Channel Guide (Right) */}
      <div
        className={`mt-6 grid gap-6 ${
          isTheaterMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'
        }`}
      >
        {/* Left Column: Live TV Player Dock & EPG Schedule */}
        <div className={isTheaterMode ? 'col-span-1 space-y-4' : 'lg:col-span-8 space-y-4'}>
          {/* Main Video Monitor */}
          <div
            ref={playerContainerRef}
            className="group relative aspect-video w-full rounded-2xl bg-black overflow-hidden border border-white/10 shadow-2xl"
          >
            <video
              ref={videoRef}
              playsInline
              autoPlay
              className="h-full w-full object-contain"
            />

            {/* Buffering Spinner */}
            {isBuffering && !streamError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
                <div
                  className="h-10 w-10 border-2 rounded-full animate-spin mb-2"
                  style={{ borderColor: `${accentHex} transparent ${accentHex} transparent` }}
                />
                <span className="text-xs font-mono text-zinc-300 tracking-wider uppercase">
                  Tuning {selectedChannel.name}...
                </span>
              </div>
            )}

            {/* Stream Error Overlay with Re-tune button */}
            {streamError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 p-6 text-center">
                <Tv2 className="h-10 w-10 text-red-500 mb-2 animate-bounce" />
                <h3 className="text-base font-bold text-white">Stream Signal Interrupted</h3>
                <p className="text-xs text-zinc-400 max-w-sm mt-1 mb-4">
                  The live broadcast stream is currently reconnecting or experiencing network latency.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => switchChannel(selectedChannel)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-transform active:scale-95"
                    style={{ background: accentHex }}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Re-tune Channel</span>
                  </button>
                  <button
                    onClick={handleNextChannel}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/10"
                  >
                    <span>Next Channel</span>
                    <SkipForward className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Top Video Overlay: Live Badge + Channel Name + Country */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600/90 backdrop-blur font-black text-[10px] tracking-wider text-white shadow-lg">
                  <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                  LIVE
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur text-xs font-mono font-bold text-white border border-white/20 shadow">
                  CH {selectedChannel.channelNumber.toString().padStart(2, '0')} · {selectedChannel.name}
                </span>
                <span className="hidden sm:inline-block px-2 py-1 rounded-lg bg-white/10 backdrop-blur text-[10px] font-mono font-bold text-zinc-300 border border-white/10">
                  {selectedChannel.country}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-lg bg-emerald-500/20 backdrop-blur text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/30">
                  {selectedChannel.resolution}
                </span>
              </div>
            </div>

            {/* Bottom Floating Control Bar (Fade in on hover or pause) */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between z-10">
              {/* Play / Pause & Channel Steppers */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevChannel}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Previous Channel [Down]"
                >
                  <SkipBack className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-lg transition-transform active:scale-95"
                  style={{ background: accentHex }}
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 fill-white" />
                  ) : (
                    <Play className="h-4 w-4 fill-white ml-0.5" />
                  )}
                </button>

                <button
                  onClick={handleNextChannel}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Next Channel [Up]"
                >
                  <SkipForward className="h-4 w-4" />
                </button>

                {/* Volume Slider & Mute */}
                <div className="flex items-center gap-2 ml-2 bg-black/40 px-2.5 py-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-zinc-300 hover:text-white transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
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
                    className="w-16 h-1 rounded bg-white/20 cursor-pointer"
                    style={{ accentColor: accentHex }}
                  />
                </div>
              </div>

              {/* Right Controls: Favorite, Theater Mode & Fullscreen */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFavorite(selectedChannel.id)}
                  className={`p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors ${
                    favorites.includes(selectedChannel.id)
                      ? 'text-amber-400'
                      : 'text-zinc-300 hover:text-white'
                  }`}
                  title={favorites.includes(selectedChannel.id) ? 'Remove Favorite' : 'Add Favorite'}
                >
                  <Star
                    className={`h-4 w-4 ${
                      favorites.includes(selectedChannel.id) ? 'fill-amber-400' : ''
                    }`}
                  />
                </button>

                <button
                  onClick={() => setIsTheaterMode(!isTheaterMode)}
                  className="hidden md:flex p-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors"
                  title={isTheaterMode ? 'Exit Theater Mode' : 'Theater Mode'}
                >
                  <Film className="h-4 w-4" />
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors"
                  title="Fullscreen"
                >
                  <Maximize className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Electronic Program Guide (EPG): Currently Airing Details */}
          <div className="rounded-2xl bg-[#0f1116] border border-white/10 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ChannelLogo channel={selectedChannel} size="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-red-400 uppercase font-black tracking-wider flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                      Live Now On CH {selectedChannel.channelNumber.toString().padStart(2, '0')}
                    </span>
                    <span className="text-zinc-500">·</span>
                    <span className="text-[11px] font-mono text-zinc-400 font-bold">
                      {selectedChannel.category}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                    {selectedChannel.currentProgram}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFavorite(selectedChannel.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    favorites.includes(selectedChannel.id)
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                      : 'bg-white/5 text-zinc-300 border-white/10 hover:border-white/20'
                  }`}
                >
                  <Star
                    className={`h-3.5 w-3.5 ${
                      favorites.includes(selectedChannel.id) ? 'fill-amber-400' : ''
                    }`}
                  />
                  <span>
                    {favorites.includes(selectedChannel.id) ? 'Favorited' : 'Add Favorite'}
                  </span>
                </button>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              {selectedChannel.description}
            </p>

            {/* Live Broadcast Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-zinc-500" />
                  <span>Elapsed: {currentMinutes}m</span>
                </span>
                <span>{minutesRemaining}m remaining in this broadcast</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${elapsedPercent}%`,
                    background: accentHex,
                  }}
                />
              </div>
            </div>

            {/* Upcoming Timeline */}
            <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-zinc-400 gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-200 uppercase font-mono text-[10px] tracking-wider px-2 py-0.5 rounded bg-white/10">
                  Up Next
                </span>
                <span className="font-medium text-zinc-300">{selectedChannel.nextProgram}</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                Next hour · Auto-plays seamlessly
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Channel Guide List */}
        {!isTheaterMode && (
          <div className="lg:col-span-4 rounded-2xl bg-[#0f1116] border border-white/10 p-4 flex flex-col h-[650px] lg:h-[720px]">
            {/* Guide Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10 flex-none">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>Channel Guide</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                    {filteredChannels.length}
                  </span>
                </h3>
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                  Click any channel to tune in live
                </p>
              </div>

              <span className="text-[10px] font-mono px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Low Latency HLS
              </span>
            </div>

            {/* Scrollable Channel Items */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-2.5 space-y-2">
              {filteredChannels.length > 0 ? (
                filteredChannels.map(ch => {
                  const isSelected = selectedChannel.id === ch.id;
                  const isFav = favorites.includes(ch.id);

                  return (
                    <div
                      key={ch.id}
                      onClick={() => switchChannel(ch)}
                      className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-white/15 border-white/30 text-white shadow-lg'
                          : 'bg-[#14161c] border-white/5 hover:border-white/20 text-zinc-300'
                      }`}
                      style={{
                        borderLeft: isSelected ? `4px solid ${accentHex}` : undefined,
                      }}
                    >
                      {/* Channel Number & Logo */}
                      <div className="relative flex-none">
                        <ChannelLogo channel={ch} size="md" />
                        <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded bg-black/90 text-[9px] font-mono font-bold text-zinc-300 border border-white/10 z-10">
                          {ch.channelNumber.toString().padStart(2, '0')}
                        </span>
                      </div>

                      {/* Title & Airing Program */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-white truncate">{ch.name}</p>
                          <span className="text-[9px] font-mono uppercase px-1 rounded bg-white/10 text-zinc-400 flex-none">
                            {ch.country}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {ch.currentProgram}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono mt-0.5">
                          <span className="text-zinc-400">{ch.category}</span>
                          <span>•</span>
                          <span>{ch.resolution}</span>
                        </div>
                      </div>

                      {/* Right: Favorite star + Play Indicator */}
                      <div className="flex items-center gap-1.5 flex-none">
                        <button
                          onClick={e => toggleFavorite(ch.id, e)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isFav
                              ? 'text-amber-400'
                              : 'text-zinc-500 hover:text-white hover:bg-white/10'
                          }`}
                          title={isFav ? 'Remove Favorite' : 'Add Favorite'}
                        >
                          <Star className={`h-4 w-4 ${isFav ? 'fill-amber-400' : ''}`} />
                        </button>

                        {isSelected && (
                          <div className="flex items-end gap-0.5 h-3.5 px-1">
                            <span className="w-0.5 bg-red-500 animate-pulse h-3" />
                            <span className="w-0.5 bg-red-500 animate-bounce h-3.5" />
                            <span className="w-0.5 bg-red-500 animate-pulse h-2" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center text-xs text-zinc-500 font-mono">
                  <Tv2 className="h-8 w-8 mb-2 text-zinc-600" />
                  <p>No channels found matching "{searchQuery}"</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('All');
                    }}
                    className="mt-3 text-[11px] text-amber-400 underline"
                  >
                    Reset filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
