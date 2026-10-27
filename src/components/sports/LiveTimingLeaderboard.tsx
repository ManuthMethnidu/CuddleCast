import React, { useState } from 'react';
import {
  Clock,
  Wrench,
  ChevronRight,
} from 'lucide-react';
import {
  DriverTiming,
  TYRE_COMPOUND_COLORS,
  TyreCompound,
  SectorColor,
} from '../../types/sports';

export interface LiveTimingLeaderboardProps {
  drivers: DriverTiming[];
  sessionName: string;
  currentLap: number;
  totalLaps: number;
  selectedDriverNumber?: number;
  onSelectDriver?: (driver: DriverTiming) => void;
  className?: string;
}

const COMPOUND_SHORT_LETTER: Record<TyreCompound, string> = {
  SOFT: 'S',
  MEDIUM: 'M',
  HARD: 'H',
  INTERMEDIATE: 'I',
  WET: 'W',
};

const SECTOR_BG_MAP: Record<SectorColor, string> = {
  purple: 'bg-[#A855F7]/25 text-[#D8B4FE] border-[#A855F7]/40',
  green: 'bg-[#22C55E]/20 text-[#86EFAC] border-[#22C55E]/40',
  yellow: 'bg-[#EAB308]/20 text-[#FDE047] border-[#EAB308]/40',
};

/**
 * LiveTimingLeaderboard renders the 20-driver live timing grid.
 *
 * Requirements:
 * - Session status banner: Lap currentLap / totalLaps with session name.
 * - Sticky table header: POS, DRIVER, GAP, INT, S1, S2, S3, TYRE.
 * - Driver row: Position highlight (P1 gold, P2 silver, P3 bronze), team color accent strip,
 *   monospace driver acronym, gap to leader, interval, sector colors (purple, green, yellow),
 *   pit status badge, DRS badge, and Pirelli tyre compound badge with tyre age in laps.
 * - Clickable onboard switcher row (onSelectDriver).
 */
export const LiveTimingLeaderboard: React.FC<LiveTimingLeaderboardProps> = ({
  drivers = [],
  sessionName,
  currentLap,
  totalLaps,
  selectedDriverNumber,
  onSelectDriver,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter drivers if user enters search term
  const filteredDrivers = drivers.filter(
    (d) =>
      d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(d.driverNumber) === searchTerm.trim()
  );

  return (
    <div
      role="region"
      aria-label={`Live Timing Leaderboard for ${sessionName}`}
      className={`bg-[#303841] text-white rounded-xl border border-white/10 shadow-xl overflow-hidden flex flex-col ${className}`}
    >
      {/* 1. Header Bar: Session Status & Lap Counter */}
      <div className="p-3 bg-[#353f49] border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            {sessionName || 'LIVE TIMING'}
          </span>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-black/40 text-[#0070F3] border border-[#0070F3]/30">
            LAP {currentLap || 1} / {totalLaps || 53}
          </span>
        </div>

        {/* Tyre Compounds Mini Legend */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono">
          {(['SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET'] as TyreCompound[]).map(
            (compound) => (
              <span
                key={compound}
                title={`${compound} compound`}
                className="inline-flex items-center justify-center w-4 h-4 rounded-full font-bold text-[9px]"
                style={{
                  border: `1.5px solid ${TYRE_COMPOUND_COLORS[compound]}`,
                  color: TYRE_COMPOUND_COLORS[compound],
                  backgroundColor: `${TYRE_COMPOUND_COLORS[compound]}18`,
                }}
              >
                {COMPOUND_SHORT_LETTER[compound]}
              </span>
            )
          )}
        </div>
      </div>

      {/* 2. Optional Quick Filter */}
      {drivers.length > 10 && (
        <div className="px-3 py-1.5 bg-[#303841] border-b border-white/5 flex items-center justify-between text-xs">
          <input
            type="text"
            placeholder="Search driver, code, team..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#353f49] text-xs text-white placeholder-zinc-500 rounded px-2.5 py-1 border border-white/10 focus:outline-none focus:border-[#0070F3]"
          />
        </div>
      )}

      {/* 3. Sticky Table Container */}
      <div className="overflow-y-auto max-h-[520px] no-scrollbar divide-y divide-white/5">
        <table className="w-full text-left text-xs border-collapse">
          {/* Sticky Table Header */}
          <thead className="sticky top-0 z-20 bg-[#353f49] shadow-sm text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-2 pl-3 pr-1 w-10 text-center">POS</th>
              <th className="py-2 px-2">DRIVER</th>
              <th className="py-2 px-1 text-right">GAP</th>
              <th className="py-2 px-1 text-right hidden sm:table-cell">INT</th>
              <th className="py-2 px-1 text-center w-12 hidden md:table-cell">S1</th>
              <th className="py-2 px-1 text-center w-12 hidden md:table-cell">S2</th>
              <th className="py-2 px-1 text-center w-12 hidden md:table-cell">S3</th>
              <th className="py-2 pr-3 pl-2 text-center w-14">TYRE</th>
            </tr>
          </thead>

          {/* Leaderboard Rows */}
          <tbody className="divide-y divide-white/5 font-sans">
            {filteredDrivers.map((driver) => {
              const isSelected = selectedDriverNumber === driver.driverNumber;
              const pos = driver.position;

              const posBadgeColor =
                pos === 1
                  ? 'text-amber-400 font-bold bg-amber-400/10'
                  : pos === 2
                  ? 'text-slate-300 font-bold bg-slate-300/10'
                  : pos === 3
                  ? 'text-amber-600 font-bold bg-amber-600/10'
                  : 'text-zinc-400 font-medium';

              const tyreColor =
                TYRE_COMPOUND_COLORS[driver.tyreCompound] || '#FFFFFF';

              return (
                <tr
                  key={driver.driverNumber}
                  onClick={() => onSelectDriver?.(driver)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Select onboard feed for ${driver.fullName} in position ${pos}`}
                  className={`
                    group cursor-pointer transition-colors duration-150 select-none
                    ${
                      isSelected
                        ? 'bg-[#0070F3]/20 border-l-2 border-l-[#0070F3]'
                        : 'hover:bg-white/5'
                    }
                  `}
                >
                  {/* Position */}
                  <td className="py-2 pl-3 pr-1 text-center font-mono">
                    <span
                      className={`inline-block w-6 py-0.5 rounded text-[11px] tabular-nums ${posBadgeColor}`}
                    >
                      P{pos}
                    </span>
                  </td>

                  {/* Driver Name & Team Color Bar */}
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      {/* Team Vertical Color Strip */}
                      <span
                        className="w-1 h-5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: driver.teamColor || '#999999' }}
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-extrabold text-white text-xs tracking-wider">
                            {driver.code}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">
                            #{driver.driverNumber}
                          </span>

                          {/* Pit Stop Badge */}
                          {driver.inPit && (
                            <span className="flex items-center gap-0.5 px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-mono font-bold animate-pulse">
                              <Wrench className="h-2.5 w-2.5" />
                              PIT
                            </span>
                          )}

                          {/* DRS Badge */}
                          {driver.drsActive && !driver.inPit && (
                            <span className="px-1 py-0.2 rounded bg-[#0070F3]/25 text-[#0070F3] border border-[#0070F3]/40 text-[9px] font-mono font-bold">
                              DRS
                            </span>
                          )}
                        </div>

                        {/* Full Driver & Team Name */}
                        <div className="text-[11px] text-zinc-400 truncate max-w-[120px] sm:max-w-[150px]">
                          {driver.fullName}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Gap to Leader */}
                  <td className="py-2 px-1 text-right font-mono text-[11px] tabular-nums text-zinc-200">
                    {driver.gapToLeader === 'LEADER' ? (
                      <span className="text-amber-400 font-bold">LEADER</span>
                    ) : (
                      driver.gapToLeader
                    )}
                  </td>

                  {/* Interval */}
                  <td className="py-2 px-1 text-right font-mono text-[11px] tabular-nums text-zinc-400 hidden sm:table-cell">
                    {driver.interval}
                  </td>

                  {/* Sector 1 */}
                  <td className="py-2 px-1 text-center font-mono text-[10px] hidden md:table-cell">
                    <span
                      className={`inline-block px-1 py-0.5 rounded border text-[10px] font-semibold tabular-nums ${
                        SECTOR_BG_MAP[driver.sector1Color] || 'text-zinc-400'
                      }`}
                    >
                      {driver.sector1 || '-'}
                    </span>
                  </td>

                  {/* Sector 2 */}
                  <td className="py-2 px-1 text-center font-mono text-[10px] hidden md:table-cell">
                    <span
                      className={`inline-block px-1 py-0.5 rounded border text-[10px] font-semibold tabular-nums ${
                        SECTOR_BG_MAP[driver.sector2Color] || 'text-zinc-400'
                      }`}
                    >
                      {driver.sector2 || '-'}
                    </span>
                  </td>

                  {/* Sector 3 */}
                  <td className="py-2 px-1 text-center font-mono text-[10px] hidden md:table-cell">
                    <span
                      className={`inline-block px-1 py-0.5 rounded border text-[10px] font-semibold tabular-nums ${
                        SECTOR_BG_MAP[driver.sector3Color] || 'text-zinc-400'
                      }`}
                    >
                      {driver.sector3 || '-'}
                    </span>
                  </td>

                  {/* Tyre Compound Pill (Compound + Age in Laps) */}
                  <td className="py-2 pr-3 pl-2 text-center font-mono">
                    <span
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold tracking-tight shadow-xs"
                      style={{
                        border: `1.5px solid ${tyreColor}`,
                        color: tyreColor,
                        backgroundColor: `${tyreColor}18`,
                      }}
                      title={`${driver.tyreCompound} (${driver.tyreAge} laps)`}
                    >
                      <span>{COMPOUND_SHORT_LETTER[driver.tyreCompound]}</span>
                      <span className="text-[9px] opacity-80">{driver.tyreAge}L</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Info: Best Lap Time */}
      <div className="p-2.5 bg-[#353f49] border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-purple-400" />
          <span>Purple = Fastest Lap</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
          <span>Click driver row to switch onboard feed</span>
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </div>
  );
};
