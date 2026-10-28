import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  AlertCircle,
} from 'lucide-react';
import { useAccent } from '../context/AccentContext';
import {
  MotorsportSession,
  SERIES_COLORS,
  JolpicaDriverStanding,
  JolpicaConstructorStanding,
  DriverTiming,
  StreamChannel,
} from '../types/sports';
import { jolpicaService } from '../services/jolpica';
import { circuitSimulator } from '../services/circuitSimulator';
import { raceTimetableService } from '../services/raceTimetable';
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

  // 2. Real Dynamic Session State (Sourced from racetimetable.com / watchitbetter.com)
  const [sessions, setSessions] = useState<MotorsportSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState<boolean>(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // 3. Series Filter State: All, F1, F2/F3, MotoGP, Global
  const [selectedSeries, setSelectedSeries] = useState<
    'ALL' | 'f1' | 'f2' | 'f3' | 'motogp' | 'global'
  >('ALL');

  // 4. Sub Tabs: SCHEDULE, STANDINGS, CHANNELS, GLOBAL
  const [hubTab, setHubTab] = useState<'SCHEDULE' | 'STANDINGS' | 'CHANNELS' | 'GLOBAL'>(
    'SCHEDULE'
  );

  // 5. Standings Sub-Tab (Drivers vs Constructors)
  const [standingsMode, setStandingsMode] = useState<'DRIVERS' | 'CONSTRUCTORS'>('DRIVERS');
  const [driverStandings, setDriverStandings] = useState<JolpicaDriverStanding[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<JolpicaConstructorStanding[]>([]);
  const [loadingStandings, setLoadingStandings] = useState(false);

  // 6. Simulator Toggle & Live Simulated Driver State
  const [simulatorActive, setSimulatorActive] = useState(true);
  const [simDrivers, setSimDrivers] = useState<DriverTiming[]>([]);

  // 7. Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real sessions from racetimetable.com service
  const fetchSessions = useCallback(async (force = false) => {
    setLoadingSessions(true);
    setSessionError(null);
    try {
      const realSessions = await raceTimetableService.getSessions(force);
      setSessions(realSessions);
    } catch (err: any) {
      console.error('Failed to load real sessions from racetimetable:', err);
      setSessionError(err?.message || 'Failed to load timetable');
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

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

  // Subscribe to circuit simulator for real-time leaderboard updates
  useEffect(() => {
    const unsub = circuitSimulator.subscribe((snap) => {
      setSimDrivers(snap.timing.slice(0, 5));
    });
    return unsub;
  }, []);

  // Filter motorsport sessions dynamically
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (selectedSeries !== 'ALL' && selectedSeries !== 'global') {
        if (selectedSeries === 'f2' || selectedSeries === 'f3') {
          if (s.series?.slug !== 'f2' && s.series?.slug !== 'f3') return false;
        } else if (s.series?.slug !== selectedSeries) {
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
          s.series?.name?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [sessions, selectedSeries, searchQuery]);

  // Featured Session: Dynamically pick live session, or next upcoming F1 session, or first session
  const featuredSession = useMemo<MotorsportSession | null>(() => {
    if (sessions.length === 0) return null;
    const live = sessions.find((s) => s.state === 'live');
    if (live) return live;
    const f1Upcoming = sessions.find(
      (s) => s.series?.slug === 'f1' && s.state === 'upcoming'
    );
    if (f1Upcoming) return f1Upcoming;
    const anyUpcoming = sessions.find((s) => s.state === 'upcoming');
    return anyUpcoming || sessions[0];
  }, [sessions]);

  // Sync simulator circuit with current featured session
  useEffect(() => {
    if (!featuredSession?.circuit) return;
    const lower = `${featuredSession.circuit} ${featuredSession.event}`.toLowerCase();
    if (lower.includes('mexico') || lower.includes('hermanos') || lower.includes('rodriguez')) {
      circuitSimulator.setCircuit('mexico');
    } else if (lower.includes('sepang') || lower.includes('malaysia')) {
      circuitSimulator.setCircuit('sepang');
    } else if (lower.includes('monaco')) {
      circuitSimulator.setCircuit('monaco');
    } else if (lower.includes('silverstone')) {
      circuitSimulator.setCircuit('silverstone');
    } else if (lower.includes('monza')) {
      circuitSimulator.setCircuit('monza');
    } else if (lower.includes('spa')) {
      circuitSimulator.setCircuit('spa');
    }
  }, [featuredSession]);

  const handleWatchSession = async (
    session: MotorsportSession,
    channel?: StreamChannel
  ) => {
    setActiveTheaterSession(session);
    if (channel?.playlist) {
      onPlayStream(
        channel.playlist,
        `${session.series?.name || 'Motorsport'}: ${session.name} - ${session.event}`
      );
    }
    // Asynchronously enrich with live stream channels from racetimetable / watchitbetter
    try {
      const dynamicChannels = await raceTimetableService.getSessionChannels(session.id);
      if (dynamicChannels.length > 0) {
        setActiveTheaterSession((prev) =>
          prev && prev.id === session.id
            ? { ...prev, channels: dynamicChannels }
            : prev
        );
      }
    } catch (e) {
      console.warn('Failed to fetch session channels:', e);
    }
  };

  const getTeamColor = (teamName: string = ''): string => {
    const clean = teamName.toLowerCase();
    for (const [key, color] of Object.entries(TEAM_COLORS)) {
      if (clean.includes(key)) return color;
    }
    return '#A1A1AA';
  };

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

            {/* Live Data Badge */}
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Live Timetable: racetimetable.com
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
        featuredSession && (
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e242a] via-[#242b32] to-[#171b1f] border border-white/15 p-6 sm:p-8 shadow-2xl group">
            {/* Ambient racing glow */}
            <div
              className="absolute -right-20 -top-20 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{
                background:
                  SERIES_COLORS[featuredSession.series?.slug || 'f1'] || '#FF1801',
              }}
            />
            <div
              className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
              style={{ background: accentHex }}
            />

            <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8">
              {/* Left: Featured Session Meta & Telemetry */}
              <div className="space-y-4 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-[11px] font-black uppercase tracking-wider shadow"
                    style={{
                      backgroundColor:
                        SERIES_COLORS[featuredSession.series?.slug || 'f1'] ||
                        featuredSession.series?.color ||
                        '#FF1801',
                    }}
                  >
                    <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                    {featuredSession.series?.name || 'Motorsport'} Grand Prix
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-300 text-xs font-mono">
                    {featuredSession.circuit} • {featuredSession.country}
                  </span>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                      featuredSession.state === 'live'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {featuredSession.state === 'live' ? 'LIVE ON TRACK' : 'UPCOMING SESSION'}
                  </span>
                </div>

                <div>
                  <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase font-display">
                    {featuredSession.event}
                  </h2>
                  <p className="text-sm sm:text-base text-zinc-300 mt-1 font-medium leading-relaxed">
                    {featuredSession.name} • Scheduled for{' '}
                    {new Date(featuredSession.starts_at).toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    local time. Full telemetry, onboard camera, and timing active.
                  </p>
                </div>

                {/* Race Telemetry Specs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <Gauge className="h-3.5 w-3.5 text-red-400" />
                      <span>Lap Record</span>
                    </div>
                    <p className="text-base font-bold text-white font-mono mt-0.5">
                      {featuredSession.circuitSpecs?.lapRecord || '1:17.774'}
                    </p>
                    <span className="text-[10px] text-zinc-400 truncate block">
                      {featuredSession.circuitSpecs?.recordHolder || 'Official Record'}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <Flag className="h-3.5 w-3.5 text-amber-400" />
                      <span>Distance</span>
                    </div>
                    <p className="text-base font-bold text-white font-mono mt-0.5">
                      {featuredSession.circuitSpecs?.lengthKm || '4.304 km'}
                    </p>
                    <span className="text-[10px] text-zinc-400">
                      {featuredSession.circuitSpecs?.laps || 71} Laps
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <Zap className="h-3.5 w-3.5 text-emerald-400" />
                      <span>DRS Zones</span>
                    </div>
                    <p className="text-base font-bold text-white font-mono mt-0.5">
                      {featuredSession.circuitSpecs?.drsZones || 2} Detection
                    </p>
                    <span className="text-[10px] text-zinc-400">Straight Zones</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <Radio className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Status</span>
                    </div>
                    <p className="text-base font-bold text-white font-mono mt-0.5">
                      {featuredSession.state === 'live' ? 'Green Flag' : 'Scheduled'}
                    </p>
                    <span className="text-[10px] text-zinc-400">
                      {featuredSession.state === 'live' ? 'Broadcast Active' : 'Countdown Active'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons using Material 3 Expressive */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <md-filled-button
                    onClick={() => handleWatchSession(featuredSession)}
                    className="h-12 px-6 text-sm font-bold shadow-lg"
                    style={{
                      '--md-filled-button-container-color':
                        SERIES_COLORS[featuredSession.series?.slug || 'f1'] || '#FF1801',
                      '--md-filled-button-label-text-color': '#FFFFFF',
                      '--md-filled-button-icon-color': '#FFFFFF',
                    }}
                  >
                    <Play className="h-4 w-4 fill-current" slot="icon" />
                    {featuredSession.state === 'live' ? 'Watch Live Stream' : 'Open Command Center'}
                  </md-filled-button>

                  <md-filled-tonal-button
                    onClick={() => handleWatchSession(featuredSession)}
                    className="h-12 px-5 text-sm font-semibold"
                    style={{
                      '--md-filled-tonal-button-container-color': 'rgba(255, 255, 255, 0.1)',
                      '--md-filled-tonal-button-label-text-color': '#FFFFFF',
                      '--md-filled-tonal-button-icon-color': '#FFFFFF',
                    }}
                  >
                    <Radio className="h-4 w-4" slot="icon" />
                    Pit Wall & Telemetry
                  </md-filled-tonal-button>
                </div>
              </div>

              {/* Right: Live Top 5 Track Leaderboard Snapshot */}
              <div className="w-full xl:w-96 rounded-2xl bg-black/40 border border-white/10 p-5 backdrop-blur-md space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <Flag className="h-3.5 w-3.5 text-red-500" />
                    Track Leaderboard (Top 5)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                    Live Interval
                  </span>
                </div>

                <div className="space-y-2">
                  {(simDrivers.length > 0 ? simDrivers : [
                    { position: 1, fullName: 'Max Verstappen', team: 'Red Bull Racing', gapToLeader: 'LEADER', teamColor: '#3671C6', tyreCompound: 'HARD' as const },
                    { position: 2, fullName: 'Lando Norris', team: 'McLaren', gapToLeader: '+1.418', teamColor: '#FF8000', tyreCompound: 'MEDIUM' as const },
                    { position: 3, fullName: 'Charles Leclerc', team: 'Ferrari', gapToLeader: '+3.102', teamColor: '#E8002D', tyreCompound: 'MEDIUM' as const },
                    { position: 4, fullName: 'Oscar Piastri', team: 'McLaren', gapToLeader: '+5.390', teamColor: '#FF8000', tyreCompound: 'HARD' as const },
                    { position: 5, fullName: 'George Russell', team: 'Mercedes', gapToLeader: '+8.441', teamColor: '#27F4D2', tyreCompound: 'SOFT' as const },
                  ]).map((driver, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors font-mono text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-black text-white w-5">P{driver.position}</span>
                        <span className="w-1 h-3.5 rounded-full" style={{ background: driver.teamColor || '#A1A1AA' }} />
                        <span className="font-semibold text-zinc-200 truncate max-w-[140px]">{driver.fullName}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/10 text-amber-300">
                          {driver.tyreCompound?.[0] || 'M'}
                        </span>
                        <span className="text-zinc-400 font-bold">{driver.gapToLeader}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-mono text-zinc-300">
                Showing {filteredSessions.length} weekend sessions with automatic timezone conversion
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live: racetimetable.com
              </span>
            </div>

            <md-filled-tonal-button
              onClick={() => fetchSessions(true)}
              disabled={loadingSessions}
              className="text-xs font-semibold"
              style={{
                '--md-filled-tonal-button-container-color': 'rgba(255, 255, 255, 0.08)',
                '--md-filled-tonal-button-label-text-color': '#FFFFFF',
              }}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loadingSessions ? 'animate-spin' : ''}`}
                slot="icon"
              />
              {loadingSessions ? 'Syncing...' : 'Refresh Timetable'}
            </md-filled-tonal-button>
          </div>

          {loadingSessions && sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 space-y-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <md-circular-progress indeterminate />
              <p className="text-sm text-zinc-300 font-mono">
                Syncing live session schedules from racetimetable.com...
              </p>
            </div>
          ) : sessionError && sessions.length === 0 ? (
            <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/30 text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="font-bold text-sm">Failed to Load Timetable</span>
              </div>
              <p className="text-xs text-red-300 font-mono">{sessionError}</p>
              <md-filled-button onClick={() => fetchSessions(true)}>
                Retry Timetable Sync
              </md-filled-button>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="p-12 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-3">
              <p className="text-sm text-zinc-400">No sessions found matching your filter or search query.</p>
              <md-outlined-button
                onClick={() => {
                  setSelectedSeries('ALL');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </md-outlined-button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSessions.map((session) => (
                <SessionScheduleCard
                  key={session.id}
                  session={session}
                  onWatchStream={(s, ch) => handleWatchSession(s, ch)}
                />
              ))}
            </div>
          )}
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
