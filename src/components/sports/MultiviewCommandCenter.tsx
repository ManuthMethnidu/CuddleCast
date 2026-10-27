import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Radio,
  Zap,
  Activity,
  Video,
  Clock,
  MessageSquare,
  PanelRightClose,
  PanelRightOpen,
  ChevronDown,
  ChevronUp,
  Gauge,
  Flag,
} from 'lucide-react';
import {
  MotorsportSession,
  StreamChannel,
  DriverTiming,
  TelemetrySnapshot,
  TrackStatus,
  TRACK_STATUS_COLORS,
} from '../../types/sports';
import { circuitSimulator, SimulationSnapshot } from '../../services/circuitSimulator';
import { openF1Service } from '../../services/openf1';
import { TheaterStreamPlayer } from './TheaterStreamPlayer';
import { ChannelSelectorBar } from './ChannelSelectorBar';
import { TelemetryHud } from './TelemetryHud';
import { LiveTimingLeaderboard } from './LiveTimingLeaderboard';
import { CircuitVectorCard } from './CircuitVectorCard';

import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/filled-button.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/tabs/tabs.js';
import '@material/web/tabs/primary-tab.js';

export interface MultiviewCommandCenterProps {
  session: MotorsportSession;
  onClose?: () => void;
  className?: string;
}

export type DrawerTab = 'ONBOARD' | 'TIMING' | 'CHAT';

/**
 * MultiviewCommandCenter implements the premier motorsport command center layout (D-06, D-07).
 *
 * Core Features:
 * - 70/30 split desktop layout: 16:9 TheaterStreamPlayer + ChannelSelectorBar + Collapsible 3-Tab Drawer.
 * - Tab 1: Driver Onboard Cam + Telemetry HUD.
 * - Tab 2: 20-driver Live Timing Leaderboard with Pirelli tyre compounds and sector deltas.
 * - Tab 3: Sandboxed Twitch darkpopout chat iframe with strict parent security (T-03-01).
 * - Automatic switching and manual toggle between OpenF1 live session data and 24/7 Circuit Simulator.
 * - Mobile responsive drawer (< 1024px) rendered as expandable accordion below player.
 */
export const MultiviewCommandCenter: React.FC<MultiviewCommandCenterProps> = ({
  session,
  onClose,
  className = '',
}) => {
  // 1. Channel state
  const defaultChannel: StreamChannel = session.channels?.[0] || {
    id: 'primary-stream',
    name: 'Sky Sports F1 [ENG]',
    available: true,
    player: 'https://live.watchitbetter.com/embed/watch/f1-sky-uk',
    type: 'hls',
    bitrate: '1080p 60fps',
  };
  const [activeChannel, setActiveChannel] = useState<StreamChannel>(defaultChannel);

  // 2. Drawer & Tab state
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('TIMING');
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [isMobileDrawerExpanded, setIsMobileDrawerExpanded] = useState(true);

  // 3. Telemetry & Timing State
  const [useSimulator, setUseSimulator] = useState(true);
  const [timingData, setTimingData] = useState<DriverTiming[]>([]);
  const [telemetrySnapshot, setTelemetrySnapshot] = useState<TelemetrySnapshot>({
    speed: 312,
    rpm: 11450,
    gear: 7,
    throttle: 98,
    brake: 0,
    drs: true,
    airTemp: 24.5,
    trackTemp: 38.0,
    weatherCondition: 'Dry / Clear',
    trackStatus: 'GREEN',
  });
  const [currentLap, setCurrentLap] = useState<number>(18);
  const [totalLaps, setTotalLaps] = useState<number>(
    session.circuitSpecs?.laps || 53
  );
  const [trackStatus, setTrackStatus] = useState<TrackStatus>('GREEN');
  const [selectedDriver, setSelectedDriver] = useState<DriverTiming | null>(null);

  // 4. Twitch hostname resolution
  const [hostname, setHostname] = useState('localhost');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHostname(window.location.hostname || 'localhost');
    }
  }, []);

  // 5. Match circuit simulator circuit to session circuit
  useEffect(() => {
    if (!session.circuit) return;
    const lower = session.circuit.toLowerCase();
    if (lower.includes('monaco')) circuitSimulator.setCircuit('monaco');
    else if (lower.includes('silverstone') || lower.includes('britain'))
      circuitSimulator.setCircuit('silverstone');
    else if (lower.includes('monza') || lower.includes('italy'))
      circuitSimulator.setCircuit('monza');
    else if (lower.includes('spa') || lower.includes('belgium'))
      circuitSimulator.setCircuit('spa');
    else if (lower.includes('cota') || lower.includes('americas'))
      circuitSimulator.setCircuit('cota');
  }, [session.circuit]);

  // 6. Simulator vs OpenF1 Real-time Sync Loop (T-03-02)
  const openF1PollTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // When using simulator: subscribe to high-fidelity ~1Hz ticks
    if (useSimulator) {
      const unsubscribe = circuitSimulator.subscribe((snapshot: SimulationSnapshot) => {
        setTimingData(snapshot.timing);
        setTelemetrySnapshot(snapshot.telemetry);
        setCurrentLap(snapshot.lap);
        setTotalLaps(snapshot.totalLaps);
        setTrackStatus(snapshot.trackStatus);

        // Keep selectedDriver reference in sync with latest timing row
        if (selectedDriver) {
          const updated = snapshot.timing.find(
            (d) => d.driverNumber === selectedDriver.driverNumber
          );
          if (updated) setSelectedDriver(updated);
        } else if (snapshot.timing.length > 0) {
          setSelectedDriver(snapshot.timing[0]);
        }
      });

      return () => {
        unsubscribe();
      };
    }

    // When useSimulator is false: Attempt to fetch real OpenF1 telemetry and intervals
    let isSubscribed = true;

    const pollOpenF1 = async () => {
      try {
        const intervals = await openF1Service.getIntervals('latest');
        const weather = await openF1Service.getWeather('latest');

        if (!isSubscribed) return;

        // If OpenF1 returns no intervals (session is off-track or quiet), auto fallback to simulator
        if (!intervals || intervals.length === 0) {
          console.info(
            '[MultiviewCommandCenter] OpenF1 session off-track or unavailable. Switching to Autonomous Circuit Simulator.'
          );
          setUseSimulator(true);
          return;
        }

        // Fetch lead car telemetry
        const carData = await openF1Service.getCarTelemetry('latest', 1);

        if (carData && Array.isArray(carData) && carData.length > 0 && isSubscribed) {
          const latestSample = carData[carData.length - 1];
          setTelemetrySnapshot({
            speed: latestSample.speed,
            rpm: latestSample.rpm,
            gear: latestSample.n_gear,
            throttle: latestSample.throttle,
            brake: latestSample.brake,
            drs: latestSample.drs > 8,
            airTemp: weather?.air_temperature || 24,
            trackTemp: weather?.track_temperature || 36,
            weatherCondition:
              (weather?.rainfall || 0) > 0 ? 'Wet / Rain' : 'Dry / Clear',
            trackStatus: 'GREEN',
          });
        }
      } catch (err) {
        console.warn(
          '[MultiviewCommandCenter] OpenF1 poll failed, falling back to simulator:',
          err
        );
        if (isSubscribed) {
          setUseSimulator(true);
        }
      }
    };

    pollOpenF1();
    openF1PollTimerRef.current = window.setInterval(pollOpenF1, 4000);

    return () => {
      isSubscribed = false;
      if (openF1PollTimerRef.current) {
        clearInterval(openF1PollTimerRef.current);
      }
    };
  }, [useSimulator, selectedDriver]);

  // Handle Driver Onboard Selection
  const handleSelectDriver = useCallback((driver: DriverTiming) => {
    setSelectedDriver(driver);
    setDrawerTab('ONBOARD');
  }, []);

  // Find onboard stream channel if present, otherwise use primary stream
  const onboardChannel =
    session.channels.find(
      (c) =>
        c.name.toLowerCase().includes('onboard') ||
        c.name.toLowerCase().includes('cockpit')
    ) || activeChannel;

  const trackColor = TRACK_STATUS_COLORS[trackStatus] || '#22C55E';

  return (
    <div
      role="main"
      aria-label={`Motorsport Command Center for ${session.event}`}
      className={`min-h-screen bg-[#303841] text-white p-3 sm:p-5 lg:p-6 select-none ${className}`}
    >
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* ==================================================================== */}
        {/* TOP COMMAND BAR: Session Meta, Live State, Controls & Simulator CTA   */}
        {/* ==================================================================== */}
        <header className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#353f49] rounded-2xl border border-white/10 shadow-lg">
          {/* Left: Series Tag, Event Title & Circuit Info */}
          <div className="flex items-center gap-3">
            <span
              className="px-2.5 py-1 rounded-md text-xs font-mono font-extrabold tracking-wider text-white shadow-xs"
              style={{ backgroundColor: session.series?.color || '#FF1801' }}
            >
              {session.series?.name || 'FORMULA 1'}
            </span>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                  {session.event}
                </h1>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                  {session.name}
                </span>
              </div>
              <div className="text-xs text-zinc-400 font-mono mt-0.5">
                {session.circuit} • {session.country}
              </div>
            </div>
          </div>

          {/* Right: Operational Controls */}
          <div className="flex items-center gap-2.5">
            {/* Track Status Badge */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs font-bold tracking-wider"
              style={{
                backgroundColor: `${trackColor}18`,
                color: trackColor,
                border: `1px solid ${trackColor}40`,
              }}
            >
              <Flag className="h-3.5 w-3.5" />
              <span>{trackStatus}</span>
            </div>

            {/* Simulator Toggle Button (M3 Filled Tonal Button) */}
            <md-filled-tonal-button
              onClick={() => setUseSimulator(!useSimulator)}
              aria-label="Toggle Track Simulator"
              title="Toggle between OpenF1 Live API and the Autonomous 24/7 Circuit Simulator"
              className="text-xs font-semibold"
              style={{
                '--md-filled-tonal-button-container-color': useSimulator
                  ? 'rgba(0, 112, 243, 0.2)'
                  : 'rgba(255, 255, 255, 0.08)',
                '--md-filled-tonal-button-label-text-color': useSimulator
                  ? '#0070F3'
                  : '#E4E4E7',
              }}
            >
              {useSimulator ? (
                <Zap className="h-3.5 w-3.5 mr-1 text-[#0070F3]" slot="icon" />
              ) : (
                <Radio className="h-3.5 w-3.5 mr-1 text-emerald-400" slot="icon" />
              )}
              {useSimulator ? 'SIMULATOR ACTIVE' : 'OPENF1 LIVE'}
            </md-filled-tonal-button>

            {/* Desktop Multiview Drawer Toggle */}
            <div className="hidden lg:block">
              <md-icon-button
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                aria-label="Collapse Multiview Panel"
                title={isDrawerOpen ? 'Collapse Multiview Panel' : 'Expand Multiview Panel'}
                className="text-zinc-300 hover:text-white transition-colors"
              >
                {isDrawerOpen ? (
                  <PanelRightClose className="h-5 w-5" />
                ) : (
                  <PanelRightOpen className="h-5 w-5" />
                )}
              </md-icon-button>
            </div>

            {/* Close Button if modal / page overlay */}
            {onClose && (
              <md-icon-button
                onClick={onClose}
                aria-label="Close Command Center"
                title="Close Command Center"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </md-icon-button>
            )}
          </div>
        </header>

        {/* ==================================================================== */}
        {/* 70/30 RESPONSIVE LAYOUT CONTAINER                                     */}
        {/* ==================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ------------------------------------------------------------------ */}
          {/* LEFT COLUMN (70%): Primary 16:9 Player + Channel Pills + Vectors   */}
          {/* ------------------------------------------------------------------ */}
          <div
            className={`space-y-4 transition-all duration-300 ${
              isDrawerOpen ? 'lg:col-span-8' : 'lg:col-span-12'
            }`}
          >
            {/* Primary 16:9 Theater Player */}
            <TheaterStreamPlayer
              channel={activeChannel}
              sessionTitle={`${session.event} • ${session.name}`}
              circuitName={session.circuit}
              isInterrupted={session.state === 'interrupted'}
              className="w-full"
            />

            {/* Channel Selector Pills Bar */}
            <ChannelSelectorBar
              channels={session.channels}
              activeChannelId={activeChannel.id}
              onSelectChannel={(ch) => setActiveChannel(ch)}
            />

            {/* Compact Telemetry & Circuit Summary Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#353f49] p-3 rounded-xl border border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-[#0070F3]" />
                <div>
                  <span className="text-[10px] text-zinc-400 font-mono block">SPEED</span>
                  <span className="font-mono font-bold text-sm text-white">
                    {Math.round(telemetrySnapshot.speed)} km/h
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                <div>
                  <span className="text-[10px] text-zinc-400 font-mono block">GEAR</span>
                  <span className="font-mono font-bold text-sm text-white">
                    {telemetrySnapshot.gear > 0
                      ? `GEAR ${telemetrySnapshot.gear}`
                      : 'NEUTRAL'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Zap
                  className={`h-4 w-4 ${
                    telemetrySnapshot.drs ? 'text-[#0070F3]' : 'text-zinc-500'
                  }`}
                />
                <div>
                  <span className="text-[10px] text-zinc-400 font-mono block">DRS</span>
                  <span
                    className={`font-mono font-bold text-xs ${
                      telemetrySnapshot.drs ? 'text-[#0070F3]' : 'text-zinc-400'
                    }`}
                  >
                    {telemetrySnapshot.drs ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-400" />
                <div>
                  <span className="text-[10px] text-zinc-400 font-mono block">LAP</span>
                  <span className="font-mono font-bold text-xs text-white">
                    {currentLap} / {totalLaps}
                  </span>
                </div>
              </div>
            </div>

            {/* Circuit Vector Card */}
            <CircuitVectorCard
              circuitName={session.circuit}
              country={session.country}
              lengthKm={session.circuitSpecs?.lengthKm || '4.304 km'}
              laps={totalLaps}
              lapRecord={session.circuitSpecs?.lapRecord || '1:17.774'}
              recordHolder={session.circuitSpecs?.recordHolder || 'Valtteri Bottas'}
              drsZones={session.circuitSpecs?.drsZones || 2}
            />
          </div>

          {/* ------------------------------------------------------------------ */}
          {/* RIGHT COLUMN (30%): Collapsible 3-Tab Multiview Drawer              */}
          {/* ------------------------------------------------------------------ */}
          {isDrawerOpen && (
            <div className="lg:col-span-4 w-full bg-[#353f49] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
              {/* Drawer Tab Navigation Header */}
              <div className="p-2 border-b border-white/10 bg-[#303841] flex items-center justify-between">
                {/* 3 Material 3 Primary Tabs */}
                <div className="grid grid-cols-3 gap-1 w-full" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={drawerTab === 'ONBOARD'}
                    aria-label="Onboard Cam & Telemetry"
                    onClick={() => setDrawerTab('ONBOARD')}
                    className={`
                      flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold
                      transition-all duration-200 select-none cursor-pointer border
                      ${
                        drawerTab === 'ONBOARD'
                          ? 'bg-[#0070F3] text-white border-[#0070F3] shadow-[0_0_12px_rgba(0,112,243,0.5)]'
                          : 'bg-transparent text-zinc-400 hover:text-white border-transparent hover:bg-white/5'
                      }
                    `}
                  >
                    <Video className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Onboard</span>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={drawerTab === 'TIMING'}
                    aria-label="Live Timing Leaderboard"
                    onClick={() => setDrawerTab('TIMING')}
                    className={`
                      flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold
                      transition-all duration-200 select-none cursor-pointer border
                      ${
                        drawerTab === 'TIMING'
                          ? 'bg-[#0070F3] text-white border-[#0070F3] shadow-[0_0_12px_rgba(0,112,243,0.5)]'
                          : 'bg-transparent text-zinc-400 hover:text-white border-transparent hover:bg-white/5'
                      }
                    `}
                  >
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Timing</span>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={drawerTab === 'CHAT'}
                    aria-label="Watch Party Chat"
                    onClick={() => setDrawerTab('CHAT')}
                    className={`
                      flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold
                      transition-all duration-200 select-none cursor-pointer border
                      ${
                        drawerTab === 'CHAT'
                          ? 'bg-[#0070F3] text-white border-[#0070F3] shadow-[0_0_12px_rgba(0,112,243,0.5)]'
                          : 'bg-transparent text-zinc-400 hover:text-white border-transparent hover:bg-white/5'
                      }
                    `}
                  >
                    <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Chat</span>
                  </button>
                </div>
              </div>

              {/* Mobile Collapsible Toggle Header (<1024px) */}
              <div className="lg:hidden p-2 bg-[#303841] border-b border-white/5 flex items-center justify-between text-xs text-zinc-400">
                <span>Multiview Panel Content</span>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerExpanded(!isMobileDrawerExpanded)}
                  className="flex items-center gap-1 text-zinc-300 font-medium"
                >
                  {isMobileDrawerExpanded ? (
                    <>
                      <span>Collapse</span>
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span>Expand</span>
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Drawer Content Body */}
              <div className={`p-3 space-y-3 ${!isMobileDrawerExpanded ? 'hidden lg:block' : ''}`}>
                {/* ------------------------------------------------------------ */}
                {/* TAB 1: Driver Onboard Cam + Telemetry HUD                   */}
                {/* ------------------------------------------------------------ */}
                {drawerTab === 'ONBOARD' && (
                  <div className="space-y-3 animate-fadeIn">
                    {/* Onboard Cockpit Video / Stream Container */}
                    <div className="relative aspect-video rounded-xl bg-black border border-white/10 overflow-hidden shadow-inner group">
                      {/* Driver Cockpit Header Overlay */}
                      <div className="absolute top-2 left-2 z-10 flex items-center gap-2 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-xs font-mono font-bold">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: selectedDriver?.teamColor || '#EF4444',
                          }}
                        />
                        <span className="text-white">
                          {selectedDriver?.code || 'VER'} #{selectedDriver?.driverNumber || 1}
                        </span>
                        <span className="text-zinc-400">• ONBOARD CAM</span>
                      </div>

                      {/* Onboard Video Feed */}
                      <iframe
                        src={onboardChannel.player}
                        title={`${selectedDriver?.fullName || 'Driver'} Cockpit Camera`}
                        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                        referrerPolicy="strict-origin-when-cross-origin"
                        className="w-full h-full border-0 pointer-events-auto"
                      />
                    </div>

                    {/* Quick Switch Driver Carousel */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                      {timingData.slice(0, 10).map((d) => (
                        <button
                          key={d.driverNumber}
                          type="button"
                          onClick={() => setSelectedDriver(d)}
                          className={`
                            px-2 py-1 rounded text-[11px] font-mono font-bold shrink-0 transition-colors
                            ${
                              selectedDriver?.driverNumber === d.driverNumber
                                ? 'bg-[#0070F3] text-white shadow-xs'
                                : 'bg-[#303841] text-zinc-300 hover:bg-white/10'
                            }
                          `}
                        >
                          {d.code} #{d.driverNumber}
                        </button>
                      ))}
                    </div>

                    {/* Real-time Telemetry Gauge HUD */}
                    <TelemetryHud
                      telemetry={telemetrySnapshot}
                      driverName={`${selectedDriver?.fullName || 'Max Verstappen'} (#${
                        selectedDriver?.driverNumber || 1
                      })`}
                      isSimulated={useSimulator}
                    />
                  </div>
                )}

                {/* ------------------------------------------------------------ */}
                {/* TAB 2: Live Timing Leaderboard                               */}
                {/* ------------------------------------------------------------ */}
                {drawerTab === 'TIMING' && (
                  <div className="animate-fadeIn">
                    <LiveTimingLeaderboard
                      drivers={timingData}
                      sessionName={session.name}
                      currentLap={currentLap}
                      totalLaps={totalLaps}
                      selectedDriverNumber={selectedDriver?.driverNumber}
                      onSelectDriver={handleSelectDriver}
                    />
                  </div>
                )}

                {/* ------------------------------------------------------------ */}
                {/* TAB 3: Sandboxed Twitch Darkpopout Chat (T-03-01)            */}
                {/* ------------------------------------------------------------ */}
                {drawerTab === 'CHAT' && (
                  <div className="space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5 text-[#0070F3]" />
                        <span className="font-semibold text-zinc-200">Watch Party Chat</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">#watchitbetter</span>
                    </div>

                    {/* Sandboxed Twitch Chat Embed */}
                    <div className="w-full h-[540px] rounded-xl overflow-hidden border border-white/10 bg-[#18181B] shadow-inner">
                      <iframe
                        src={`https://www.twitch.tv/embed/watchitbetter/chat?darkpopout=true&parent=${encodeURIComponent(
                          hostname
                        )}`}
                        title="Twitch Watch Party Chat"
                        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                        referrerPolicy="strict-origin-when-cross-origin"
                        className="w-full h-full border-0"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
