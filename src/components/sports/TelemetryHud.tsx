import React from 'react';
import {
  Gauge,
  Zap,
  Activity,
  Thermometer,
  CloudSun,
  Flag,
  Radio,
} from 'lucide-react';
import { TelemetrySnapshot, TRACK_STATUS_COLORS } from '../../types/sports';

export interface TelemetryHudProps {
  telemetry: TelemetrySnapshot;
  driverName?: string;
  isSimulated?: boolean;
  className?: string;
}

/**
 * TelemetryHud displays a real-time Formula 1 / Motorsport telemetry dashboard.
 *
 * Requirements:
 * - Big monospace speed readout (km/h) and gear indicator.
 * - Dynamic RPM tachometer bar with redline warning (> 11,500 RPM).
 * - Dual pedal gauges: Throttle (emerald #22C55E) and Brake (red #EF4444).
 * - DRS activation badge: Accent glowing badge (#0070F3) when active, muted when off.
 * - Weather & track status badge (GREEN, YELLOW, RED, SC, VSC).
 * - Tabular monospace numbers conforming to 01-UI-SPEC.md typography discipline.
 */
export const TelemetryHud: React.FC<TelemetryHudProps> = ({
  telemetry,
  driverName = 'CAR 1 • LEADER',
  isSimulated = false,
  className = '',
}) => {
  const {
    speed = 0,
    rpm = 0,
    gear = 0,
    throttle = 0,
    brake = 0,
    drs = false,
    airTemp = 24.0,
    trackTemp = 36.5,
    weatherCondition = 'Dry / Clear',
    trackStatus = 'GREEN',
  } = telemetry || {};

  const MAX_RPM = 13500;
  const REDLINE_RPM = 11500;
  const rpmPercent = Math.min(100, Math.max(0, (rpm / MAX_RPM) * 100));
  const isRedline = rpm >= REDLINE_RPM;

  const trackStatusColor = TRACK_STATUS_COLORS[trackStatus] || '#22C55E';

  return (
    <div
      role="region"
      aria-label="Real-time Car Telemetry HUD"
      className={`bg-[#353f49] text-white rounded-xl border border-white/10 p-4 shadow-xl select-none ${className}`}
    >
      {/* Top Header: Driver Name & Simulator/Live Tag */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#0070F3]" />
          <span className="font-bold tracking-wider uppercase text-zinc-200">
            {driverName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isSimulated ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
              <Radio className="h-2.5 w-2.5 animate-pulse" />
              SIMULATED TELEMETRY
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              OPENF1 LIVE
            </span>
          )}
        </div>
      </div>

      {/* Main Gauges: Speed & Gear Display */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Speed Readout */}
        <div className="bg-[#303841] rounded-lg p-3 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-[11px] font-semibold tracking-wider">
            <span className="flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5 text-zinc-400" />
              SPEED
            </span>
            <span className="font-mono text-[10px]">KM/H</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums tracking-tight text-white">
              {Math.round(speed)}
            </span>
            <span className="text-xs font-mono text-zinc-400 font-semibold">km/h</span>
          </div>
        </div>

        {/* Gear & DRS Status */}
        <div className="bg-[#303841] rounded-lg p-3 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-[11px] font-semibold tracking-wider">
            <span>GEAR</span>
            {/* DRS Pill Indicator */}
            <div
              className={`
                px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider transition-all duration-200
                ${
                  drs
                    ? 'bg-[#0070F3] text-white shadow-[0_0_15px_rgba(0,112,243,0.7)] animate-pulse'
                    : 'bg-zinc-800 text-zinc-500 border border-white/5'
                }
              `}
            >
              {drs ? 'DRS ACTIVE' : 'DRS OFF'}
            </div>
          </div>

          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums tracking-tight text-[#0070F3]">
              {gear === 0 ? 'N' : gear}
            </span>
            <span className="text-[11px] font-mono text-zinc-400 font-medium">
              {gear > 0 ? `GEAR ${gear}` : 'NEUTRAL'}
            </span>
          </div>
        </div>
      </div>

      {/* RPM Tachometer Bar */}
      <div className="bg-[#303841] rounded-lg p-3 border border-white/5 mb-3">
        <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 mb-1.5">
          <span className="flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            ENGINE RPM
          </span>
          <span
            className={`font-mono text-xs font-bold tabular-nums ${
              isRedline ? 'text-rose-400 animate-pulse' : 'text-zinc-200'
            }`}
          >
            {rpm.toLocaleString()} / {MAX_RPM.toLocaleString()}
          </span>
        </div>

        {/* Dynamic Tachometer Bar */}
        <div className="relative h-3 w-full bg-black/40 rounded-full overflow-hidden border border-white/10">
          <div
            className={`h-full transition-all duration-100 ease-out rounded-full ${
              isRedline
                ? 'bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]'
                : 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400'
            }`}
            style={{ width: `${rpmPercent}%` }}
          />
          {/* Redline threshold tick at 85% (~11,500 RPM) */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10"
            style={{ left: `${(REDLINE_RPM / MAX_RPM) * 100}%` }}
            title="Redline (11,500 RPM)"
          />
        </div>
      </div>

      {/* Dual Pedals: Throttle & Brake Bars */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Throttle */}
        <div className="bg-[#303841] rounded-lg p-2.5 border border-white/5">
          <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-400 mb-1">
            <span className="text-emerald-400 font-bold">THROTTLE</span>
            <span className="font-mono tabular-nums text-zinc-200 font-semibold">
              {Math.round(throttle)}%
            </span>
          </div>
          <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-emerald-500 transition-all duration-100 ease-out rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, throttle))}%` }}
            />
          </div>
        </div>

        {/* Brake */}
        <div className="bg-[#303841] rounded-lg p-2.5 border border-white/5">
          <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-400 mb-1">
            <span className="text-rose-400 font-bold">BRAKE</span>
            <span className="font-mono tabular-nums text-zinc-200 font-semibold">
              {Math.round(brake)}%
            </span>
          </div>
          <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-rose-500 transition-all duration-100 ease-out rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, brake))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Weather & Track Status Footer */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
        {/* Air & Track Temperatures + Weather */}
        <div className="flex items-center gap-3 text-zinc-400">
          <div className="flex items-center gap-1 font-mono">
            <Thermometer className="h-3.5 w-3.5 text-sky-400" />
            <span>Air: {airTemp}°C</span>
          </div>
          <div className="flex items-center gap-1 font-mono">
            <CloudSun className="h-3.5 w-3.5 text-amber-400" />
            <span>Track: {trackTemp}°C</span>
          </div>
          <span className="hidden sm:inline-block font-mono text-zinc-400">
            • {weatherCondition}
          </span>
        </div>

        {/* Track Status Badge */}
        <div
          className="flex items-center gap-1.5 px-2 py-0.5 rounded font-mono font-bold text-[10px] tracking-wide"
          style={{
            backgroundColor: `${trackStatusColor}22`,
            color: trackStatusColor,
            border: `1px solid ${trackStatusColor}44`,
          }}
        >
          <Flag className="h-3 w-3" />
          <span>
            {trackStatus === 'GREEN'
              ? 'TRACK CLEAR'
              : trackStatus === 'YELLOW'
              ? 'YELLOW FLAG'
              : trackStatus === 'RED'
              ? 'RED FLAG'
              : trackStatus === 'SC'
              ? 'SAFETY CAR'
              : 'VSC ACTIVE'}
          </span>
        </div>
      </div>
    </div>
  );
};
