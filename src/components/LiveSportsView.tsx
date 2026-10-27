import React, { useState, useEffect } from 'react';
import {
  Play,
  Flag,
  Zap,
  Gauge,
  Radio,
  Tv2,
  Search,
  Layers,
  Sparkles,
  RefreshCw,
  X,
} from 'lucide-react';
import { useAccent } from '../context/AccentContext';
import {
  MotorsportSession,
  SERIES_COLORS,
  JolpicaDriverStanding,
  JolpicaConstructorStanding,
} from '../types/sports';
import { jolpicaService } from '../services/jolpica';
import { circuitSimulator } from '../services/circuitSimulator';
import { MultiviewCommandCenter } from './sports/MultiviewCommandCenter';
import { SessionScheduleCard } from './sports/SessionScheduleCard';
import { GlobalSportsGrid } from './sports/GlobalSportsGrid';

import '@material/web/button/filled-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/progress/circular-progress.js';

export interface LiveSportsViewProps {
  onPlayStream: (url: string, title: string) => void;
}

// 24/7 Live Motorsport & Racing Channels (High Bitrate verified streams)
interface MotorsportChannel {
  id: string;
  name: string;
  callsign: string;
  category: string;
  brandColor: string;
  logo: string;
  streamUrl: string;
  currentProgram: string;
  description: string;
  resolution: string;
}

const MOTORSPORT_CHANNELS: MotorsportChannel[] = [
  {
    id: 'mavtv',
    name: 'MAVTV Motorsports Network',
    callsign: 'MAVTV PRO',
    category: 'Auto Racing & Supercross',
    brandColor: '#EF4444',
    logo: 'https://upload.wikimedia.org/wikipedia/en/7/74/Racer_Network.jpg',
    streamUrl:
      'https://amg00378-mavtv-amg00378c2-rakuten-us-1048.playouts.now.amagi.tv/playlist/amg00378-mavtvfast-motorsportsnetwork-rakutenus/playlist.m3u8',
    currentProgram: 'Lucas Oil Pro Late Model Championship: World Finals',
    description:
      'Premier 24/7 motorsport network covering sprint cars, Supercross, Formula Drift, drag racing, and endurance racing.',
    resolution: '1080p 60fps',
  },
  {
    id: 'redbull-sports',
    name: 'Red Bull TV Extreme Motorsports',
    callsign: 'RED BULL',
    category: 'Formula 1 & Rally',
    brandColor: '#FF1E44',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Red_Bull_TV_logo.svg/320px-Red_Bull_TV_logo.svg.png',
    streamUrl:
      'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
    currentProgram: 'Oracle Red Bull Racing: Formula 1 Masterclass & Telemetry',
    description:
      'Behind the scenes with Max Verstappen, F1 championship aerodynamics, WRC rally, and high-octane extreme sports.',
    resolution: '1080p 60fps',
  },
  {
    id: 'floracing',
    name: 'FloRacing Global Motorsports',
    callsign: 'FLORACING',
    category: 'Open Wheel & Dirt Track',
    brandColor: '#3B82F6',
    logo: 'https://images.fubo.tv/channel-config-ui/station-logos/on-dark/floracing-white.png',
    streamUrl:
      'https://amg02278-amg02278c1-flosports-worldwide-7592.playouts.now.amagi.tv/playlist.m3u8',
    currentProgram: 'USAC National Sprint Car Series: Eldora Speedway',
    description:
      'Live grassroots racing, open-wheel midgets, sprint cars, and national oval championships from across the globe.',
    resolution: '1080p HD',
  },
  {
    id: 'powernation',
    name: 'PowerNation Racing Network',
    callsign: 'POWERNATION',
    category: 'High Performance Dyno',
    brandColor: '#F59E0B',
    logo: 'https://i.imgur.com/jguTO8E.png',
    streamUrl:
      'https://amg01258-raycomsports-powernationau-samsungau-18bwc.amagi.tv/playlist.m3u8',
    currentProgram: 'Engine Power: 1,200 HP Twin-Turbo Track Build',
    description:
      'Race car fabrication, engine dynamometer diagnostics, chassis tuning, and high-performance track builds.',
    resolution: '1080p HD',
  },
  {
    id: 'topgear',
    name: 'Top Gear Live 24/7',
    callsign: 'TOP GEAR',
    category: 'Supercars & Lap Times',
    brandColor: '#10B981',
    logo: 'https://i.imgur.com/S6Su6QH.png',
    streamUrl: 'https://jmp2.uk/plu-636adc255bcf470007d6e0e2.m3u8',
    currentProgram: 'Power Laps & Supercar Showdowns at Dunsfold Aerodrome',
    description:
      '24/7 continuous challenges, The Stig power laps, and supercar velocity tests.',
    resolution: '720p HD',
  },
];

// Curated Multi-Series Weekend Timetable (F1, F2, F3, MotoGP)
const MOTORSPORT_SESSIONS: MotorsportSession[] = [
  // 1. Monaco Grand Prix 2026 - Main Race (Live)
  {
    id: 'f1-2026-monaco-race',
    name: 'Main Grand Prix',
    category: 'race',
    event: 'Monaco Grand Prix 2026',
    circuit: 'Circuit de Monaco',
    country: 'Monte Carlo, Monaco',
    cover_image_url:
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1280&q=80',
    starts_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // currently in progress
    state: 'live',
    series: {
      id: 'f1',
      name: 'Formula 1',
      slug: 'f1',
      color: '#FF1801',
    },
    circuitSpecs: {
      lengthKm: '3.337 km',
      laps: 78,
      lapRecord: '1:12.909',
      recordHolder: 'L. Hamilton',
      drsZones: 1,
    },
    channels: [
      {
        id: 'sky-uk',
        name: 'Sky Sports F1 [ENG]',
        available: true,
        playlist:
          'https://amg00378-mavtv-amg00378c2-rakuten-us-1048.playouts.now.amagi.tv/playlist/amg00378-mavtvfast-motorsportsnetwork-rakutenus/playlist.m3u8',
        player: 'https://live.watchitbetter.com/embed/watch/f1-sky-uk',
        bitrate: '1080p 60fps',
        type: 'hls',
      },
      {
        id: 'sky-it',
        name: 'Sky Sports F1 [IT]',
        available: true,
        player: 'https://live.watchitbetter.com/embed/watch/f1-sky-it',
        bitrate: '1080p 60fps',
        type: 'embed',
      },
      {
        id: 'onboard-ver',
        name: 'Onboard Cam: Max Verstappen',
        available: true,
        playlist:
          'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
        player: 'https://live.watchitbetter.com/embed/watch/f1-onboard-ver',
        bitrate: '1080p 60fps',
        type: 'hls',
      },
    ],
  },

  // 2. Mexico Grand Prix - Qualifying (Upcoming)
  {
    id: 'f1-2026-mexico-quali',
    name: 'Qualifying',
    category: 'qualifying',
    event: 'Mexico Grand Prix',
    circuit: 'Autódromo Hermanos Rodríguez',
    country: 'Mexico City, Mexico',
    cover_image_url:
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1280&q=80',
    starts_at: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    state: 'upcoming',
    series: {
      id: 'f1',
      name: 'Formula 1',
      slug: 'f1',
      color: '#FF1801',
    },
    circuitSpecs: {
      lengthKm: '4.304 km',
      laps: 71,
      lapRecord: '1:17.774',
      recordHolder: 'V. Bottas',
      drsZones: 3,
    },
    channels: [
      {
        id: 'sky-uk',
        name: 'Sky Sports F1 [ENG]',
        available: true,
        playlist:
          'https://amg00378-mavtv-amg00378c2-rakuten-us-1048.playouts.now.amagi.tv/playlist/amg00378-mavtvfast-motorsportsnetwork-rakutenus/playlist.m3u8',
        player: 'https://live.watchitbetter.com/embed/watch/f1-sky-uk',
        bitrate: '1080p 60fps',
        type: 'hls',
      },
    ],
  },

  // 3. Silverstone British Grand Prix - Feature (Upcoming)
  {
    id: 'f1-2026-silverstone-race',
    name: 'Grand Prix Race',
    category: 'race',
    event: 'British Grand Prix',
    circuit: 'Silverstone Circuit',
    country: 'Silverstone, Great Britain',
    cover_image_url:
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1280&q=80',
    starts_at: new Date(Date.now() + 28 * 3600 * 1000).toISOString(),
    state: 'upcoming',
    series: {
      id: 'f1',
      name: 'Formula 1',
      slug: 'f1',
      color: '#FF1801',
    },
    circuitSpecs: {
      lengthKm: '5.891 km',
      laps: 52,
      lapRecord: '1:27.097',
      recordHolder: 'M. Verstappen',
      drsZones: 2,
    },
    channels: [
      {
        id: 'sky-uk',
        name: 'Sky Sports F1 [ENG]',
        available: true,
        playlist:
          'https://amg00378-mavtv-amg00378c2-rakuten-us-1048.playouts.now.amagi.tv/playlist/amg00378-mavtvfast-motorsportsnetwork-rakutenus/playlist.m3u8',
        player: 'https://live.watchitbetter.com/embed/watch/f1-sky-uk',
        bitrate: '1080p 60fps',
        type: 'hls',
      },
    ],
  },

  // 4. Formula 2 - Feature Race (Upcoming)
  {
    id: 'f2-2026-monaco-feature',
    name: 'Feature Race',
    category: 'race',
    event: 'FIA Formula 2 Monaco',
    circuit: 'Circuit de Monaco',
    country: 'Monte Carlo, Monaco',
    cover_image_url:
      'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=1280&q=80',
    starts_at: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
    state: 'upcoming',
    series: {
      id: 'f2',
      name: 'Formula 2',
      slug: 'f2',
      color: '#1C78FB',
    },
    channels: [
      {
        id: 'f2-feed',
        name: 'F2 International Feed',
        available: true,
        playlist:
          'https://amg02278-amg02278c1-flosports-worldwide-7592.playouts.now.amagi.tv/playlist.m3u8',
        player: 'https://live.watchitbetter.com/embed/watch/f2-monaco',
        bitrate: '1080p HD',
        type: 'hls',
      },
    ],
  },

  // 5. Formula 3 - Sprint Race (Upcoming)
  {
    id: 'f3-2026-silverstone-sprint',
    name: 'Sprint Race',
    category: 'sprint',
    event: 'FIA Formula 3 Silverstone',
    circuit: 'Silverstone Circuit',
    country: 'Silverstone, Great Britain',
    cover_image_url:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1280&q=80',
    starts_at: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
    state: 'upcoming',
    series: {
      id: 'f3',
      name: 'Formula 3',
      slug: 'f3',
      color: '#102D5C',
    },
    channels: [
      {
        id: 'f3-feed',
        name: 'F3 International Feed',
        available: true,
        playlist:
          'https://amg01258-raycomsports-powernationau-samsungau-18bwc.amagi.tv/playlist.m3u8',
        player: 'https://live.watchitbetter.com/embed/watch/f3-silverstone',
        bitrate: '1080p HD',
        type: 'hls',
      },
    ],
  },

  // 6. MotoGP Qatar Grand Prix - Main Race (Live)
  {
    id: 'motogp-2026-qatar-race',
    name: 'Grand Prix Race',
    category: 'race',
    event: 'MotoGP Grand Prix of Qatar',
    circuit: 'Lusail International Circuit',
    country: 'Doha, Qatar',
    cover_image_url:
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1280&q=80',
    starts_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    state: 'live',
    series: {
      id: 'motogp',
      name: 'MotoGP',
      slug: 'motogp',
      color: '#EF0000',
    },
    channels: [
      {
        id: 'motogp-feed',
        name: 'MotoGP Live World Feed',
        available: true,
        playlist:
          'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
        player: 'https://live.watchitbetter.com/embed/watch/motogp-qatar',
        bitrate: '1080p 60fps',
        type: 'hls',
      },
    ],
  },
];

const TEAM_COLORS: Record<string, string> = {
  'red bull': '#3671C6',
  'mclaren': '#FF8000',
  'ferrari': '#E8002D',
  'mercedes': '#27F4D2',
  'aston martin': '#229971',
  'alpine': '#0093CC',
  'haas': '#B6BABD',
  'rb': '#6692FF',
  'racing bulls': '#6692FF',
  'williams': '#64C4FF',
  'sauber': '#52E252',
  'audi': '#E10600',
};

export const LiveSportsView: React.FC<LiveSportsViewProps> = ({ onPlayStream }) => {
  const { accentHex } = useAccent();

  // 1. Theater Mode State: active motorsport session displayed in Multiview Command Center
  const [activeTheaterSession, setActiveTheaterSession] = useState<MotorsportSession | null>(
    null
  );

  // 2. Series Filter State: All, F1, F2/F3, MotoGP, Global
  const [selectedSeries, setSelectedSeries] = useState<
    'ALL' | 'f1' | 'f2' | 'f3' | 'motogp' | 'global'
  >('ALL');

  // 3. Sub Tabs: SCHEDULE, STANDINGS, CHANNELS, GLOBAL
  const [hubTab, setHubTab] = useState<'SCHEDULE' | 'STANDINGS' | 'CHANNELS' | 'GLOBAL'>(
    'SCHEDULE'
  );

  // 4. Standings Sub-Tab (Drivers vs Constructors)
  const [standingsMode, setStandingsMode] = useState<'DRIVERS' | 'CONSTRUCTORS'>('DRIVERS');
  const [driverStandings, setDriverStandings] = useState<JolpicaDriverStanding[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<JolpicaConstructorStanding[]>([]);
  const [loadingStandings, setLoadingStandings] = useState(false);

  // 5. Simulator Toggle
  const [simulatorActive, setSimulatorActive] = useState(true);

  // 6. Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Load real Jolpica 2026 Standings on mount
  useEffect(() => {
    let mounted = true;
    const fetchStandings = async () => {
      setLoadingStandings(true);
      try {
        const [drivers, constructors] = await Promise.all([
          jolpicaService.getDriverStandings(2026),
          jolpicaService.getConstructorStandings(2026),
        ]);
        if (mounted) {
          setDriverStandings(drivers);
          setConstructorStandings(constructors);
        }
      } catch (e) {
        console.warn('Failed to load Jolpica standings, using built-in cache:', e);
      } finally {
        if (mounted) setLoadingStandings(false);
      }
    };

    fetchStandings();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter motorsport sessions
  const filteredSessions = MOTORSPORT_SESSIONS.filter((s) => {
    if (selectedSeries !== 'ALL' && selectedSeries !== 'global') {
      if (selectedSeries === 'f2' || selectedSeries === 'f3') {
        if (s.series.slug !== 'f2' && s.series.slug !== 'f3') return false;
      } else if (s.series.slug !== selectedSeries) {
        return false;
      }
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.event.toLowerCase().includes(q) ||
        s.circuit.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.series.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getTeamColor = (teamName: string = ''): string => {
    const clean = teamName.toLowerCase();
    for (const [key, color] of Object.entries(TEAM_COLORS)) {
      if (clean.includes(key)) return color;
    }
    return '#A1A1AA';
  };

  const featuredSession = MOTORSPORT_SESSIONS[0]; // Monaco Grand Prix 2026 Live

  return (
    <div className="mx-auto max-w-[1560px] px-3.5 sm:px-12 pt-16 sm:pt-20 pb-24 select-none animate-fadeIn space-y-8 bg-[#303841] text-zinc-100 min-h-screen">
      {/* 1. Header Banner & Simulator Status Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow"
              style={{
                backgroundColor: `${accentHex}24`,
                color: accentHex,
                border: `1px solid ${accentHex}50`,
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full animate-ping" style={{ background: accentHex }} />
              CuddleCast Sports Center
            </span>

            {/* 24/7 Simulator Status Badge */}
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              24/7 Autonomous Track Simulator Ready
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3 font-display">
            <span>Live Sports & Motorsport Center</span>
          </h1>
          <p className="text-sm text-zinc-300 mt-1 max-w-2xl">
            Stream live Formula 1, F2, F3, and MotoGP with interactive multiview telemetry, live session countdowns, and global football, NBA, and combat sports feeds.
          </p>
        </div>

        {/* Controls: Search & Simulator Toggle */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Simulator Toggle Button (M3 Filled Tonal) */}
          <md-filled-tonal-button
            onClick={() => {
              const next = !simulatorActive;
              setSimulatorActive(next);
              if (next) {
                circuitSimulator.start();
              } else {
                circuitSimulator.stop();
              }
            }}
            className="text-xs font-semibold"
            style={{
              '--md-filled-tonal-button-container-color': simulatorActive
                ? 'rgba(34, 197, 94, 0.15)'
                : 'rgba(255, 255, 255, 0.08)',
              '--md-filled-tonal-button-label-text-color': simulatorActive
                ? '#4ADE80'
                : '#A1A1AA',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" slot="icon" />
            Toggle Track Simulator
          </md-filled-tonal-button>

          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search F1, MotoGP, team..."
              className="w-full h-10 pl-10 pr-4 rounded-full bg-[#353f49] border border-white/10 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-white/30 transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* 2. THEATER MODE: MULTIVIEW COMMAND CENTER (When Active) */}
      {activeTheaterSession ? (
        <section className="relative rounded-3xl bg-[#353f49] border border-white/15 p-4 sm:p-6 shadow-2xl animate-fadeIn">
          {/* Close / Return Bar */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider text-white"
                style={{
                  backgroundColor:
                    SERIES_COLORS[activeTheaterSession.series?.slug || 'f1'] ||
                    '#FF1801',
                }}
              >
                {activeTheaterSession.series?.name || 'FORMULA 1'}
              </span>
              <span className="text-sm font-bold text-white">
                {activeTheaterSession.event} • {activeTheaterSession.name}
              </span>
            </div>

            <md-icon-button
              onClick={() => setActiveTheaterSession(null)}
              aria-label="Collapse Multiview Panel"
              title="Close Theater Mode"
            >
              <X className="w-5 h-5 text-zinc-300 hover:text-white" />
            </md-icon-button>
          </div>

          {/* Mount Full Multiview Command Center */}
          <MultiviewCommandCenter
            session={activeTheaterSession}
            onClose={() => setActiveTheaterSession(null)}
          />
        </section>
      ) : (
        /* 3. HERO GRAND PRIX WEEKEND BILLBOARD (When Theater Mode is Closed) */
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e242a] via-[#242b32] to-[#171b1f] border border-white/15 p-6 sm:p-8 shadow-2xl group">
          {/* Ambient racing glow */}
          <div
            className="absolute -right-20 -top-20 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ background: '#FF1801' }}
          />
          <div
            className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
            style={{ background: accentHex }}
          />

          <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8">
            {/* Left: Featured Session Meta & Telemetry */}
            <div className="space-y-4 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF1801] text-white text-[11px] font-black uppercase tracking-wider shadow">
                  <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                  Formula 1 Grand Prix
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-300 text-xs font-mono">
                  Round 8 • Monte Carlo 🇲🇨
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30">
                  Track Status: GREEN
                </span>
              </div>

              <div>
                <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase font-display">
                  Monaco Grand Prix 2026
                </h2>
                <p className="text-sm sm:text-base text-zinc-300 mt-1 font-medium leading-relaxed">
                  Circuit de Monaco • Lap 52 of 78. Battle for P1: Max Verstappen leading Lando Norris with pit stops underway.
                </p>
              </div>

              {/* Race Telemetry Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Gauge className="h-3.5 w-3.5 text-red-400" />
                    <span>Lap Record</span>
                  </div>
                  <p className="text-base font-bold text-white font-mono mt-0.5">1:12.909</p>
                  <span className="text-[10px] text-zinc-400">L. Hamilton</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Flag className="h-3.5 w-3.5 text-amber-400" />
                    <span>Distance</span>
                  </div>
                  <p className="text-base font-bold text-white font-mono mt-0.5">260.28 km</p>
                  <span className="text-[10px] text-zinc-400">78 Laps</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Zap className="h-3.5 w-3.5 text-emerald-400" />
                    <span>DRS Zones</span>
                  </div>
                  <p className="text-base font-bold text-white font-mono mt-0.5">1 Detection</p>
                  <span className="text-[10px] text-zinc-400">Pit Straight</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Radio className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Air / Track</span>
                  </div>
                  <p className="text-base font-bold text-white font-mono mt-0.5">24°C / 38°C</p>
                  <span className="text-[10px] text-zinc-400">Dry / Clear</span>
                </div>
              </div>

              {/* Action Buttons using Material 3 Expressive */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <md-filled-button
                  onClick={() => setActiveTheaterSession(featuredSession)}
                  className="h-12 px-6 text-sm font-bold shadow-lg"
                  style={{
                    '--md-filled-button-container-color': '#FF1801',
                    '--md-filled-button-label-text-color': '#FFFFFF',
                    '--md-filled-button-icon-color': '#FFFFFF',
                  }}
                >
                  <Play className="h-4 w-4 fill-current" slot="icon" />
                  Watch Live Grand Prix
                </md-filled-button>

                <md-filled-tonal-button
                  onClick={() => {
                    setActiveTheaterSession(featuredSession);
                  }}
                  className="h-12 px-5 text-sm font-semibold"
                  style={{
                    '--md-filled-tonal-button-container-color': 'rgba(255, 255, 255, 0.1)',
                    '--md-filled-tonal-button-label-text-color': '#FFFFFF',
                    '--md-filled-tonal-button-icon-color': '#FFFFFF',
                  }}
                >
                  <Radio className="h-4 w-4" slot="icon" />
                  Pit Wall & Onboard Feed
                </md-filled-tonal-button>
              </div>
            </div>

            {/* Right: Live Top 5 Leaderboard Snapshot */}
            <div className="w-full xl:w-96 rounded-2xl bg-black/40 border border-white/10 p-5 backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Flag className="h-3.5 w-3.5 text-red-500" />
                  Race Leaderboard (Top 5)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                  Live Interval
                </span>
              </div>

              <div className="space-y-2">
                {[
                  { pos: 'P1', name: 'M. Verstappen', team: 'Red Bull', gap: 'LEADER', color: '#3671C6', tires: 'H' },
                  { pos: 'P2', name: 'L. Norris', team: 'McLaren', gap: '+2.418s', color: '#FF8000', tires: 'H' },
                  { pos: 'P3', name: 'C. Leclerc', team: 'Ferrari', gap: '+5.102s', color: '#E8002D', tires: 'M' },
                  { pos: 'P4', name: 'O. Piastri', team: 'McLaren', gap: '+8.390s', color: '#FF8000', tires: 'H' },
                  { pos: 'P5', name: 'C. Sainz', team: 'Ferrari', gap: '+12.441s', color: '#E8002D', tires: 'M' },
                ].map((driver) => (
                  <div
                    key={driver.pos}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors font-mono text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-black text-white w-5">{driver.pos}</span>
                      <span className="w-1 h-3.5 rounded-full" style={{ background: driver.color }} />
                      <span className="font-semibold text-zinc-200">{driver.name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/10 text-amber-300">
                        {driver.tires}
                      </span>
                      <span className="text-zinc-400 font-bold">{driver.gap}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. MULTI-SERIES FILTER STRIP & NAVIGATION TABS */}
      <div className="space-y-4">
        {/* Series Filter Strip */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'ALL' as const, label: 'All Series', color: '#0070F3' },
            { id: 'f1' as const, label: 'Formula 1', color: '#FF1801' },
            { id: 'f2' as const, label: 'F2 & F3 Junior Series', color: '#1C78FB' },
            { id: 'motogp' as const, label: 'MotoGP Premier Class', color: '#EF0000' },
            { id: 'global' as const, label: 'Global Sports (UCL / NBA / UFC)', color: '#001D4A' },
          ].map((seriesTab) => {
            const isSelected = selectedSeries === seriesTab.id;
            return (
              <button
                key={seriesTab.id}
                onClick={() => {
                  setSelectedSeries(seriesTab.id);
                  if (seriesTab.id === 'global') setHubTab('GLOBAL');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                  isSelected
                    ? 'border-transparent text-white shadow-md'
                    : 'bg-[#353f49] border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
                style={{
                  backgroundColor: isSelected ? seriesTab.color : undefined,
                }}
              >
                <span>{seriesTab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Hub Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-extrabold text-white uppercase tracking-wider">
              {selectedSeries === 'global' ? 'Global Sports Hub' : 'Motorsport Timetables & Feeds'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl bg-[#242b32] border border-white/10 p-1">
            <button
              onClick={() => setHubTab('SCHEDULE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                hubTab === 'SCHEDULE'
                  ? 'bg-white/15 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🏁 Weekend Timetable
            </button>
            <button
              onClick={() => setHubTab('STANDINGS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                hubTab === 'STANDINGS'
                  ? 'bg-white/15 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🏆 2026 Standings
            </button>
            <button
              onClick={() => setHubTab('CHANNELS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                hubTab === 'CHANNELS'
                  ? 'bg-white/15 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              📺 24/7 Channels
            </button>
            <button
              onClick={() => setHubTab('GLOBAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                hubTab === 'GLOBAL'
                  ? 'bg-white/15 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              ⚽ Global Matches
            </button>
          </div>
        </div>
      </div>

      {/* 5. TAB VIEW 1: WEEKEND TIMETABLE (SessionScheduleCard Grid) */}
      {hubTab === 'SCHEDULE' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400">
              Showing {filteredSessions.length} weekend sessions with automatic timezone conversion
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSessions.map((session) => (
              <SessionScheduleCard
                key={session.id}
                session={session}
                onWatchStream={(s, ch) => {
                  setActiveTheaterSession(s);
                  if (ch?.playlist) {
                    onPlayStream(ch.playlist, `${s.series.name}: ${s.name} - ${s.event}`);
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* 6. TAB VIEW 2: 2026 STANDINGS (Jolpica Ergast Real Feeds) */}
      {hubTab === 'STANDINGS' && (
        <div className="rounded-2xl bg-[#353f49] border border-white/10 p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <span>FIA Formula 1 World Championship 2026</span>
                {loadingStandings && (
                  <RefreshCw className="w-3.5 h-3.5 text-zinc-400 animate-spin" />
                )}
              </h3>
              <p className="text-xs text-zinc-400">
                Real-time official standings from Jolpica / Ergast F1 API
              </p>
            </div>

            <div className="flex items-center rounded-lg bg-black/40 border border-white/10 p-1">
              <button
                onClick={() => setStandingsMode('DRIVERS')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  standingsMode === 'DRIVERS' ? 'bg-white/20 text-white' : 'text-zinc-400'
                }`}
              >
                Drivers
              </button>
              <button
                onClick={() => setStandingsMode('CONSTRUCTORS')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  standingsMode === 'CONSTRUCTORS' ? 'bg-white/20 text-white' : 'text-zinc-400'
                }`}
              >
                Constructors
              </button>
            </div>
          </div>

          {standingsMode === 'DRIVERS' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="text-zinc-400 border-b border-white/10 pb-2">
                    <th className="py-2.5 px-3">POS</th>
                    <th className="py-2.5 px-3">DRIVER</th>
                    <th className="py-2.5 px-3">TEAM</th>
                    <th className="py-2.5 px-3 text-center">WINS</th>
                    <th className="py-2.5 px-3 text-right">POINTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {driverStandings.map((ds) => {
                    const teamName = ds.Constructors?.[0]?.name || 'Unknown Team';
                    const teamColor = getTeamColor(teamName);
                    return (
                      <tr key={ds.Driver.driverId} className="hover:bg-white/[0.04] transition-colors">
                        <td className="py-3 px-3 font-bold text-white">
                          {ds.position === '1'
                            ? '🥇 P1'
                            : ds.position === '2'
                            ? '🥈 P2'
                            : ds.position === '3'
                            ? '🥉 P3'
                            : `P${ds.position}`}
                        </td>
                        <td className="py-3 px-3 font-semibold text-zinc-100 flex items-center gap-2">
                          <span className="w-6 text-zinc-400 font-mono">
                            #{ds.Driver.permanentNumber || '0'}
                          </span>
                          <span>
                            {ds.Driver.givenName} {ds.Driver.familyName}
                          </span>
                          <span className="text-[10px] text-zinc-400 uppercase">
                            ({ds.Driver.code})
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ background: teamColor }}
                            />
                            <span className="text-zinc-300">{teamName}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center text-zinc-400">{ds.wins}</td>
                        <td className="py-3 px-3 text-right font-black text-white text-sm">
                          {ds.points} PTS
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="text-zinc-400 border-b border-white/10 pb-2">
                    <th className="py-2.5 px-3">POS</th>
                    <th className="py-2.5 px-3">TEAM / CONSTRUCTOR</th>
                    <th className="py-2.5 px-3">NATIONALITY</th>
                    <th className="py-2.5 px-3 text-center">WINS</th>
                    <th className="py-2.5 px-3 text-right">TOTAL POINTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {constructorStandings.map((cs) => {
                    const teamColor = getTeamColor(cs.Constructor.name);
                    return (
                      <tr key={cs.Constructor.constructorId} className="hover:bg-white/[0.04] transition-colors">
                        <td className="py-3 px-3 font-bold text-white">P{cs.position}</td>
                        <td className="py-3 px-3 font-semibold text-zinc-100 flex items-center gap-2.5">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ background: teamColor }}
                          />
                          <span>{cs.Constructor.name}</span>
                        </td>
                        <td className="py-3 px-3 text-zinc-400">
                          {cs.Constructor.nationality || 'International'}
                        </td>
                        <td className="py-3 px-3 text-center text-zinc-400">{cs.wins}</td>
                        <td className="py-3 px-3 text-right font-black text-white text-sm">
                          {cs.points} PTS
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 7. TAB VIEW 3: 24/7 MOTORSPORT TV (MAVTV, Red Bull, FloRacing, etc.) */}
      {hubTab === 'CHANNELS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MOTORSPORT_CHANNELS.map((ch) => (
            <div
              key={ch.id}
              className="rounded-2xl bg-[#353f49] border border-white/10 p-5 flex flex-col justify-between hover:border-white/25 transition-all shadow-xl group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Tv2 className="h-4 w-4" style={{ color: ch.brandColor }} />
                    <span className="text-xs font-bold font-mono uppercase text-white">
                      {ch.callsign}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {ch.resolution}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-white text-base group-hover:text-amber-400 transition-colors">
                    {ch.name}
                  </h4>
                  <p className="text-xs text-zinc-300 mt-1 line-clamp-2">
                    {ch.description}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs">
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">
                    Now Airing
                  </span>
                  <p className="font-semibold text-zinc-200 mt-0.5 line-clamp-1">
                    {ch.currentProgram}
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <md-filled-button
                  onClick={() => onPlayStream(ch.streamUrl, `${ch.name} (Live Motorsport TV)`)}
                  className="w-full text-xs font-bold shadow"
                  style={{
                    '--md-filled-button-container-color': ch.brandColor,
                    '--md-filled-button-label-text-color': '#FFFFFF',
                    '--md-filled-button-icon-color': '#FFFFFF',
                  }}
                >
                  <Play className="h-3.5 w-3.5 fill-current" slot="icon" />
                  Watch 24/7 Stream
                </md-filled-button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 8. TAB VIEW 4: GLOBAL SPORTS GRID (UCL, EPL, NBA, UFC) */}
      {hubTab === 'GLOBAL' && (
        <div className="space-y-4">
          <GlobalSportsGrid onPlayStream={onPlayStream} />
        </div>
      )}
    </div>
  );
};
