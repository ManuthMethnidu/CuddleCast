import React, { useState } from 'react';
import { Trophy, Play, Activity, Clock } from 'lucide-react';
import { useAccent } from '../context/AccentContext';

interface Match {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: 'LIVE' | 'UPCOMING';
  minute?: string;
  time?: string;
  streamUrl: string;
  homeLogo: string;
  awayLogo: string;
}

const MATCHES: Match[] = [
  {
    id: 'ucl-1',
    league: 'UEFA Champions League',
    homeTeam: 'Real Madrid',
    awayTeam: 'Manchester City',
    homeScore: 2,
    awayScore: 2,
    status: 'LIVE',
    minute: "76' LIVE",
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    homeLogo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=80&q=80',
    awayLogo: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=80&q=80',
  },
  {
    id: 'ucl-2',
    league: 'UEFA Champions League',
    homeTeam: 'Arsenal',
    awayTeam: 'Bayern Munich',
    homeScore: 1,
    awayScore: 0,
    status: 'LIVE',
    minute: "64' LIVE",
    streamUrl: 'https://test-streams.mux.dev/pts_shift/master.m3u8',
    homeLogo: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=80&q=80',
    awayLogo: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=80&q=80',
  },
  {
    id: 'nba-1',
    league: 'NBA Playoffs',
    homeTeam: 'Los Angeles Lakers',
    awayTeam: 'Golden State Warriors',
    homeScore: 92,
    awayScore: 89,
    status: 'LIVE',
    minute: 'Q3 04:12',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    homeLogo: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=80&q=80',
    awayLogo: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=80&q=80',
  },
  {
    id: 'f1-1',
    league: 'Formula 1',
    homeTeam: 'Monaco Grand Prix',
    awayTeam: 'Circuit de Monaco',
    status: 'LIVE',
    minute: 'Lap 48/78',
    streamUrl: 'https://test-streams.mux.dev/pts_shift/master.m3u8',
    homeLogo: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=80&q=80',
    awayLogo: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=80&q=80',
  },
  {
    id: 'epl-1',
    league: 'Premier League',
    homeTeam: 'Liverpool',
    awayTeam: 'Chelsea',
    status: 'UPCOMING',
    time: 'Today 8:00 PM',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    homeLogo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=80&q=80',
    awayLogo: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=80&q=80',
  },
  {
    id: 'ufc-1',
    league: 'UFC 310',
    homeTeam: 'World Title Championship',
    awayTeam: 'Main Card PPV',
    status: 'UPCOMING',
    time: 'Tonight 10:30 PM',
    streamUrl: 'https://test-streams.mux.dev/pts_shift/master.m3u8',
    homeLogo: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=80&q=80',
    awayLogo: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=80&q=80',
  },
];

interface LiveSportsViewProps {
  onPlayStream: (url: string, title: string) => void;
}

export const LiveSportsView: React.FC<LiveSportsViewProps> = ({ onPlayStream }) => {
  const { accentHex } = useAccent();
  const [activeTab, setActiveTab] = useState<'ALL' | 'LIVE' | 'UPCOMING'>('ALL');

  const filtered = MATCHES.filter(m => {
    if (activeTab === 'LIVE') return m.status === 'LIVE';
    if (activeTab === 'UPCOMING') return m.status === 'UPCOMING';
    return true;
  });

  return (
    <div className="mx-auto max-w-[1560px] px-3.5 sm:px-12 pt-16 sm:pt-20 pb-20 select-none animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400"
          >
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Live Sports Center</span>
              <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Activity className="h-3 w-3 animate-pulse" />
                Live Feed
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live scoreboards, real-time match streams, and upcoming fixture countdowns
            </p>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 rounded-xl bg-[#18181d] border border-white/10 p-1">
          {(['ALL', 'LIVE', 'UPCOMING'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-white/15 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Matches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-8">
        {filtered.map(match => {
          const isLive = match.status === 'LIVE';

          return (
            <div
              key={match.id}
              className="rounded-2xl bg-[#131317] border border-white/10 p-5 flex flex-col justify-between hover:border-white/25 transition-all shadow-xl group"
            >
              {/* League & Status Row */}
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                  {match.league}
                </span>

                {isLive ? (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold font-mono border border-red-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                    {match.minute}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                    <Clock className="h-3 w-3" />
                    {match.time}
                  </span>
                )}
              </div>

              {/* Match Teams & Score Board */}
              <div className="py-5 flex items-center justify-between">
                {/* Home */}
                <div className="flex-1 flex flex-col items-center text-center">
                  <img
                    src={match.homeLogo}
                    alt={match.homeTeam}
                    className="h-12 w-12 rounded-full object-cover border border-white/10 shadow"
                  />
                  <span className="text-xs font-bold text-white mt-2 line-clamp-1">
                    {match.homeTeam}
                  </span>
                </div>

                {/* Score or VS */}
                <div className="px-4 text-center">
                  {isLive ? (
                    <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-wider">
                      {match.homeScore} - {match.awayScore}
                    </div>
                  ) : (
                    <span className="text-xs font-mono font-bold text-zinc-500">
                      VS
                    </span>
                  )}
                </div>

                {/* Away */}
                <div className="flex-1 flex flex-col items-center text-center">
                  <img
                    src={match.awayLogo}
                    alt={match.awayTeam}
                    className="h-12 w-12 rounded-full object-cover border border-white/10 shadow"
                  />
                  <span className="text-xs font-bold text-white mt-2 line-clamp-1">
                    {match.awayTeam}
                  </span>
                </div>
              </div>

              {/* Stream Action Button */}
              <button
                onClick={() =>
                  onPlayStream(
                    match.streamUrl,
                    `${match.league}: ${match.homeTeam} vs ${match.awayTeam}`
                  )
                }
                className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 shadow"
                style={{
                  background: isLive ? accentHex : 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                }}
              >
                <Play className="h-3.5 w-3.5 fill-white" />
                <span>{isLive ? 'Watch Live Stream HD' : 'Set Match Notification'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
