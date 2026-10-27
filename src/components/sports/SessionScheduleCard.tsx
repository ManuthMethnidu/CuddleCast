import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  Bell,
  BellRing,
  Play,
  Radio,
  Timer,
} from 'lucide-react';
import { MotorsportSession, StreamChannel, SERIES_COLORS } from '../../types/sports';
import { timezoneCountdown, CountdownResult } from '../../services/timezoneCountdown';
import { sportsNotifications } from '../../services/notifications';

import '@material/web/button/filled-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/iconbutton/icon-button.js';

export interface SessionScheduleCardProps {
  session: MotorsportSession;
  onWatchStream?: (session: MotorsportSession, channel?: StreamChannel) => void;
  className?: string;
}

/**
 * SessionScheduleCard renders a weekend timetable card for motorsport sessions
 * (Formula 1, Formula 2, Formula 3, MotoGP).
 *
 * Implements:
 * - Official series color badges (#FF1801, #1C78FB, #102D5C, #EF0000)
 * - Auto-detected user local timezone & circuit track timezone dual readout
 * - Live ticking countdown timer (DDd HHh MMm or HH:MM:SS)
 * - Web notification alert toggle with permission management ("Enable Race Alerts")
 * - Direct primary CTA ("Watch Live Grand Prix" / "Watch Session Stream")
 */
export const SessionScheduleCard: React.FC<SessionScheduleCardProps> = ({
  session,
  onWatchStream,
  className = '',
}) => {
  // 1. Live Countdown State
  const [countdown, setCountdown] = useState<CountdownResult>(() =>
    timezoneCountdown.calculateCountdown(session.starts_at)
  );

  // 2. Notification Alert State
  const [hasAlert, setHasAlert] = useState<boolean>(() =>
    sportsNotifications.isAlertEnabled(session.id)
  );
  const [alertFeedback, setAlertFeedback] = useState<string | null>(null);

  // 3. Dual Timezone Data
  const dualTime = timezoneCountdown.getDualTime(
    session.starts_at,
    session.circuit || session.country
  );

  // 4. Update countdown timer every second
  useEffect(() => {
    const tick = () => {
      const res = timezoneCountdown.calculateCountdown(session.starts_at);
      setCountdown(res);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [session.starts_at]);

  // Series branding
  const seriesSlug = session.series?.slug || 'f1';
  const seriesBadgeColor =
    SERIES_COLORS[seriesSlug] || session.series?.color || '#FF1801';
  const isLive = session.state === 'live' || countdown.isPast;

  // Handle notification toggle
  const handleAlertToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newState = await sportsNotifications.toggleSessionAlert(session);
      setHasAlert(newState);
      setAlertFeedback(newState ? 'Alert set for T-15m & Lights Out' : 'Alert cancelled');
      setTimeout(() => setAlertFeedback(null), 3000);
    } catch (err) {
      console.warn('Failed to toggle race alerts:', err);
    }
  };

  const handleWatch = () => {
    if (onWatchStream) {
      const primaryChannel = session.channels?.[0];
      onWatchStream(session, primaryChannel);
    }
  };

  return (
    <div
      className={`group relative rounded-2xl bg-[#353f49] border border-white/10 hover:border-white/20 transition-all duration-300 shadow-xl overflow-hidden flex flex-col justify-between ${className}`}
    >
      {/* Top Banner / Hero Media */}
      <div className="relative h-40 w-full overflow-hidden bg-[#242b31]">
        {session.cover_image_url ? (
          <img
            src={session.cover_image_url}
            alt={session.event}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-80"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1e242a] to-[#303841]">
            <Radio className="w-12 h-12 text-white/20" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#353f49] via-[#353f49]/60 to-transparent" />

        {/* Top Badges Bar */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
          {/* Series Badge */}
          <div
            className="px-2.5 py-1 rounded-md text-[11px] font-black tracking-wider uppercase text-white shadow-lg flex items-center gap-1.5"
            style={{ backgroundColor: seriesBadgeColor }}
          >
            <span>{session.series?.name || 'FORMULA 1'}</span>
          </div>

          {/* Session State Badge */}
          {isLive ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-600/90 text-white text-[11px] font-black tracking-wide shadow animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>LIVE NOW</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-white/90 text-[11px] font-semibold">
              <Timer className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-mono">{countdown.formattedString}</span>
            </div>
          )}
        </div>

        {/* Session & Event Titles over Banner */}
        <div className="absolute bottom-2 inset-x-3 z-10">
          <div className="text-[12px] font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>{session.name}</span>
            <span>•</span>
            <span className="text-white font-bold">{session.event}</span>
          </div>
          <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5 truncate">
            <MapPin className="w-3 h-3 flex-shrink-0 text-zinc-400" />
            <span className="truncate">{session.circuit} ({session.country})</span>
          </div>
        </div>
      </div>

      {/* Card Body: Timezone & Countdown Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        {/* Dual Timezone Grid */}
        <div className="grid grid-cols-2 gap-2 bg-[#2a323a] p-2.5 rounded-xl border border-white/5">
          {/* Local User Time */}
          <div className="space-y-0.5">
            <div className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#0070F3]" />
              <span>Your Time ({dualTime.localTz})</span>
            </div>
            <div className="text-[13px] font-mono font-bold text-white">
              {dualTime.localTime}
            </div>
            <div className="text-[10px] text-zinc-400 truncate">
              {dualTime.localFormatted.split('•')[0] || 'Race Day'}
            </div>
          </div>

          {/* Track Host Circuit Time */}
          <div className="space-y-0.5 border-l border-white/10 pl-2.5">
            <div className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>Track Time ({dualTime.trackTz})</span>
            </div>
            <div className="text-[13px] font-mono font-bold text-zinc-200">
              {dualTime.trackTime}
            </div>
            <div className="text-[10px] text-zinc-400 truncate">
              {session.country}
            </div>
          </div>
        </div>

        {/* Live / Countdown Countdown Banner */}
        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-zinc-400 font-medium">Session Status</span>
          {isLive ? (
            <span className="text-red-400 font-bold font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              Track Green / Live
            </span>
          ) : (
            <span className="text-zinc-300 font-mono font-semibold">
              Starts in {countdown.formattedString}
            </span>
          )}
        </div>

        {/* Alert Feedback Toast */}
        {alertFeedback && (
          <div className="py-1 px-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-[11px] text-emerald-300 font-medium text-center">
            {alertFeedback}
          </div>
        )}

        {/* Action Row */}
        <div className="pt-2 flex items-center gap-2 border-t border-white/5">
          {/* Primary Watch Button */}
          <md-filled-button
            onClick={handleWatch}
            className="flex-1 text-xs font-semibold shadow-md"
            style={{
              '--md-filled-button-container-color': isLive ? '#FF1801' : '#0070F3',
              '--md-filled-button-label-text-color': '#FFFFFF',
              '--md-filled-button-icon-color': '#FFFFFF',
            }}
          >
            <Play className="w-3.5 h-3.5 fill-current" slot="icon" />
            {isLive ? 'Watch Live Grand Prix' : 'Watch Session Stream'}
          </md-filled-button>

          {/* Race Alert Notification Toggle Button */}
          <md-filled-tonal-button
            onClick={handleAlertToggle}
            aria-label="Enable Race Alerts"
            title="Enable Race Alerts (T-15m and Lights Out)"
            className="text-xs font-semibold"
            style={{
              '--md-filled-tonal-button-container-color': hasAlert
                ? 'rgba(0, 112, 243, 0.25)'
                : 'rgba(255, 255, 255, 0.08)',
              '--md-filled-tonal-button-label-text-color': hasAlert ? '#60A5FA' : '#E4E4E7',
              '--md-filled-tonal-button-icon-color': hasAlert ? '#60A5FA' : '#A1A1AA',
            }}
          >
            {hasAlert ? (
              <BellRing className="w-3.5 h-3.5" slot="icon" />
            ) : (
              <Bell className="w-3.5 h-3.5" slot="icon" />
            )}
            <span className="hidden sm:inline">
              {hasAlert ? 'Alerts On' : 'Enable Race Alerts'}
            </span>
          </md-filled-tonal-button>
        </div>
      </div>
    </div>
  );
};
