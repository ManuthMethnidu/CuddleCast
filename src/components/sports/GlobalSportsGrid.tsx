import React, { useState } from 'react';
import {
  Trophy,
  Play,
  Clock,
  Server,
  CheckCircle2,
} from 'lucide-react';

import '@material/web/button/filled-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/chips/filter-chip.js';

export interface GlobalStreamServer {
  id: string;
  name: string; // e.g. "Server 1 Direct HLS", "Server 2 Sandboxed Mirror"
  quality: string; // "1080p 60fps", "720p HD"
  url: string;
  isDirectHls: boolean;
}

export interface GlobalMatch {
  id: string;
  category: 'FOOTBALL' | 'BASKETBALL' | 'COMBAT' | 'TENNIS';
  league: string; // "UEFA Champions League", "Premier League", "NBA", "UFC"
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  homeScore?: number | string;
  awayScore?: number | string;
  status: 'LIVE' | 'UPCOMING' | 'FINISHED';
  minute?: string; // e.g. "76' LIVE", "Q4 02:18", "Round 3"
  startTime?: string;
  venue?: string;
  servers: GlobalStreamServer[];
}

export interface GlobalSportsGridProps {
  onPlayStream: (url: string, title: string) => void;
  selectedCategory?: string;
  className?: string;
}

const GLOBAL_MATCHES: GlobalMatch[] = [
  // 1. UEFA Champions League - Real Madrid vs Man City
  {
    id: 'ucl-rm-mc',
    category: 'FOOTBALL',
    league: 'UEFA Champions League',
    homeTeam: 'Real Madrid',
    awayTeam: 'Manchester City',
    homeLogo: 'https://crests.football-data.org/86.png',
    awayLogo: 'https://crests.football-data.org/65.png',
    homeScore: 2,
    awayScore: 1,
    status: 'LIVE',
    minute: "76' LIVE",
    venue: 'Santiago Bernabéu, Madrid',
    servers: [
      {
        id: 's1',
        name: 'Server 1 Direct HLS',
        quality: '1080p 60fps',
        url: 'https://amg00378-mavtv-amg00378c2-rakuten-us-1048.playouts.now.amagi.tv/playlist/amg00378-mavtvfast-motorsportsnetwork-rakutenus/playlist.m3u8',
        isDirectHls: true,
      },
      {
        id: 's2',
        name: 'Server 2 Sandboxed Mirror',
        quality: '1080p HD',
        url: 'https://live.watchitbetter.com/embed/watch/ucl-rm-mc',
        isDirectHls: false,
      },
    ],
  },

  // 2. UEFA Champions League - Arsenal vs Bayern Munich
  {
    id: 'ucl-ars-bay',
    category: 'FOOTBALL',
    league: 'UEFA Champions League',
    homeTeam: 'Arsenal FC',
    awayTeam: 'Bayern Munich',
    homeLogo: 'https://crests.football-data.org/57.png',
    awayLogo: 'https://crests.football-data.org/5.png',
    homeScore: 1,
    awayScore: 1,
    status: 'LIVE',
    minute: "62' LIVE",
    venue: 'Emirates Stadium, London',
    servers: [
      {
        id: 's1',
        name: 'Server 1 Direct HLS',
        quality: '1080p 60fps',
        url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
        isDirectHls: true,
      },
      {
        id: 's2',
        name: 'Server 2 Mirror HD',
        quality: '720p HD',
        url: 'https://live.watchitbetter.com/embed/watch/ucl-ars-bay',
        isDirectHls: false,
      },
    ],
  },

  // 3. English Premier League - Liverpool vs Chelsea
  {
    id: 'epl-liv-che',
    category: 'FOOTBALL',
    league: 'Premier League',
    homeTeam: 'Liverpool FC',
    awayTeam: 'Chelsea FC',
    homeLogo: 'https://crests.football-data.org/64.png',
    awayLogo: 'https://crests.football-data.org/61.png',
    status: 'UPCOMING',
    minute: 'Today 20:00',
    startTime: '2026-10-31T20:00:00Z',
    venue: 'Anfield, Liverpool',
    servers: [
      {
        id: 's1',
        name: 'Server 1 Direct HLS',
        quality: '1080p 60fps',
        url: 'https://amg02278-amg02278c1-flosports-worldwide-7592.playouts.now.amagi.tv/playlist.m3u8',
        isDirectHls: true,
      },
      {
        id: 's2',
        name: 'Server 2 Sandboxed Mirror',
        quality: '1080p HD',
        url: 'https://live.watchitbetter.com/embed/watch/epl-liv-che',
        isDirectHls: false,
      },
    ],
  },

  // 4. NBA Basketball - Lakers vs Warriors
  {
    id: 'nba-lal-gsw',
    category: 'BASKETBALL',
    league: 'NBA Basketball',
    homeTeam: 'Los Angeles Lakers',
    awayTeam: 'Golden State Warriors',
    homeLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png',
    awayLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/gsw.png',
    homeScore: 114,
    awayScore: 110,
    status: 'LIVE',
    minute: 'Q4 02:18',
    venue: 'Crypto.com Arena, Los Angeles',
    servers: [
      {
        id: 's1',
        name: 'Server 1 Direct HLS',
        quality: '1080p 60fps',
        url: 'https://amg01258-raycomsports-powernationau-samsungau-18bwc.amagi.tv/playlist.m3u8',
        isDirectHls: true,
      },
      {
        id: 's2',
        name: 'Server 2 Mirror HD',
        quality: '720p HD',
        url: 'https://live.watchitbetter.com/embed/watch/nba-lal-gsw',
        isDirectHls: false,
      },
    ],
  },

  // 5. NBA Basketball - Celtics vs Mavericks
  {
    id: 'nba-bos-dal',
    category: 'BASKETBALL',
    league: 'NBA Basketball',
    homeTeam: 'Boston Celtics',
    awayTeam: 'Dallas Mavericks',
    homeLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png',
    awayLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/dal.png',
    homeScore: 118,
    awayScore: 104,
    status: 'FINISHED',
    minute: 'Final',
    venue: 'TD Garden, Boston',
    servers: [
      {
        id: 's1',
        name: 'Highlights & Replay',
        quality: '1080p HD',
        url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
        isDirectHls: true,
      },
    ],
  },

  // 6. UFC Championship - UFC 310
  {
    id: 'ufc-310',
    category: 'COMBAT',
    league: 'UFC Championship',
    homeTeam: 'Alexandre Pantoja',
    awayTeam: 'Kai Asakura',
    homeLogo: 'https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/3041697.png&w=350&h=254',
    awayLogo: 'https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/4405380.png&w=350&h=254',
    homeScore: 'W',
    awayScore: 'L',
    status: 'LIVE',
    minute: 'Round 3 LIVE',
    venue: 'T-Mobile Arena, Las Vegas',
    servers: [
      {
        id: 's1',
        name: 'Server 1 Direct HLS',
        quality: '1080p 60fps',
        url: 'https://amg00378-mavtv-amg00378c2-rakuten-us-1048.playouts.now.amagi.tv/playlist/amg00378-mavtvfast-motorsportsnetwork-rakutenus/playlist.m3u8',
        isDirectHls: true,
      },
      {
        id: 's2',
        name: 'Server 2 Sandboxed Mirror',
        quality: '1080p HD',
        url: 'https://live.watchitbetter.com/embed/watch/ufc-310',
        isDirectHls: false,
      },
    ],
  },
];

export const GlobalSportsGrid: React.FC<GlobalSportsGridProps> = ({
  onPlayStream,
  selectedCategory = 'ALL',
  className = '',
}) => {
  const [activeServerMap, setActiveServerMap] = useState<Record<string, string>>({
    'ucl-rm-mc': 's1',
    'ucl-ars-bay': 's1',
    'epl-liv-che': 's1',
    'nba-lal-gsw': 's1',
    'nba-bos-dal': 's1',
    'ufc-310': 's1',
  });

  const [filter, setFilter] = useState<string>(selectedCategory);

  const filteredMatches = GLOBAL_MATCHES.filter((m) => {
    if (filter === 'ALL') return true;
    return m.category === filter;
  });

  const handleServerSelect = (matchId: string, serverId: string) => {
    setActiveServerMap((prev) => ({
      ...prev,
      [matchId]: serverId,
    }));
  };

  const handleLaunchStream = (match: GlobalMatch) => {
    const activeServerId = activeServerMap[match.id] || match.servers[0]?.id;
    const selectedServer =
      match.servers.find((s) => s.id === activeServerId) || match.servers[0];
    if (selectedServer) {
      onPlayStream(
        selectedServer.url,
        `${match.league}: ${match.homeTeam} vs ${match.awayTeam}`
      );
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'ALL', label: 'All Global Sports' },
          { id: 'FOOTBALL', label: 'Football / UCL' },
          { id: 'BASKETBALL', label: 'NBA Basketball' },
          { id: 'COMBAT', label: 'UFC & Combat' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
              filter === cat.id
                ? 'bg-[#0070F3] text-white border-[#0070F3] shadow-md shadow-blue-500/20'
                : 'bg-[#353f49] text-zinc-300 border-white/10 hover:border-white/20 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Match Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMatches.map((match) => {
          const isLive = match.status === 'LIVE';
          const activeServerId = activeServerMap[match.id] || match.servers[0]?.id;

          return (
            <div
              key={match.id}
              className="rounded-2xl bg-[#353f49] border border-white/10 hover:border-white/20 transition-all duration-300 p-4 shadow-xl flex flex-col justify-between space-y-4"
            >
              {/* Header: League & Status Tag */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-black/40 text-zinc-300">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  </span>
                  <div>
                    <div className="text-xs font-bold text-white tracking-wide">
                      {match.league}
                    </div>
                    {match.venue && (
                      <div className="text-[10px] text-zinc-400 truncate max-w-[180px]">
                        {match.venue}
                      </div>
                    )}
                  </div>
                </div>

                {isLive ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-[11px] font-mono font-bold animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span>{match.minute || 'LIVE'}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 text-zinc-400 text-[11px] font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{match.minute || 'UPCOMING'}</span>
                  </div>
                )}
              </div>

              {/* Match Score Board / Teams Layout */}
              <div className="py-2 px-3 rounded-xl bg-[#2a323a] border border-white/5 flex items-center justify-between">
                {/* Home Team */}
                <div className="flex-1 flex flex-col items-center text-center space-y-1.5">
                  <div className="w-12 h-12 rounded-full p-1 bg-white/5 border border-white/10 flex items-center justify-center shadow">
                    <img
                      src={match.homeLogo}
                      alt={match.homeTeam}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-white line-clamp-1 max-w-[90px]">
                    {match.homeTeam}
                  </span>
                </div>

                {/* Score / VS Display */}
                <div className="px-3 text-center">
                  {match.homeScore !== undefined && match.awayScore !== undefined ? (
                    <div className="text-2xl font-black font-mono text-white tracking-wider">
                      {match.homeScore} : {match.awayScore}
                    </div>
                  ) : (
                    <span className="text-xs font-mono font-bold text-zinc-500 px-2.5 py-1 rounded bg-white/5 border border-white/5">
                      VS
                    </span>
                  )}
                  {isLive && (
                    <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                      Active In-Play
                    </div>
                  )}
                </div>

                {/* Away Team */}
                <div className="flex-1 flex flex-col items-center text-center space-y-1.5">
                  <div className="w-12 h-12 rounded-full p-1 bg-white/5 border border-white/10 flex items-center justify-center shadow">
                    <img
                      src={match.awayLogo}
                      alt={match.awayTeam}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-white line-clamp-1 max-w-[90px]">
                    {match.awayTeam}
                  </span>
                </div>
              </div>

              {/* Multi-Server Stream Selection Pills */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Server className="w-3 h-3 text-zinc-400" />
                  <span>Stream Mirror</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {match.servers.map((server) => {
                    const isSelected = activeServerId === server.id;
                    return (
                      <button
                        key={server.id}
                        onClick={() => handleServerSelect(match.id, server.id)}
                        className={`py-1 px-2 rounded-lg text-[11px] font-medium transition-all text-left flex items-center justify-between border ${
                          isSelected
                            ? 'bg-[#0070F3]/20 border-[#0070F3] text-white shadow'
                            : 'bg-white/5 border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/10'
                        }`}
                      >
                        <span className="truncate">{server.name}</span>
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-[#0070F3] flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary Action Button */}
              <md-filled-button
                onClick={() => handleLaunchStream(match)}
                className="w-full text-xs font-semibold shadow"
                style={{
                  '--md-filled-button-container-color': isLive ? '#0070F3' : 'rgba(255, 255, 255, 0.1)',
                  '--md-filled-button-label-text-color': '#FFFFFF',
                  '--md-filled-button-icon-color': '#FFFFFF',
                }}
              >
                <Play className="w-3.5 h-3.5 fill-current" slot="icon" />
                {isLive ? 'Watch Live Match Stream' : 'Match Preview & Streams'}
              </md-filled-button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
