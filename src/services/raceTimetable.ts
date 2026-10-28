/**
 * Race Timetable & Live Session Schedule Service
 * CuddleCast Live Sports & Formula 1 Center
 *
 * Dynamically fetches and parses real live timetable and session data from
 * racetimetable.com / watchitbetter.com and Jolpica / Ergast F1 calendar.
 *
 * Features:
 * - Dynamic session loading for Formula 1, Formula 2, Formula 3, and MotoGP.
 * - Real UTC start timestamps, session categories, event names, and official circuits.
 * - In-memory caching with 5-minute TTL.
 * - Multi-tier resilient fallback: /api/timetable -> CORS Proxy -> Jolpica F1 API.
 */

import {
  MotorsportSession,
  StreamChannel,
  SessionCategory,
  SeriesMeta,
  CircuitSpecs,
} from '../types/sports';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const CIRCUIT_SPECS_MAP: Record<string, CircuitSpecs> = {
  mexico: {
    lengthKm: '4.304 km',
    laps: 71,
    lapRecord: '1:17.774',
    recordHolder: 'V. Bottas',
    drsZones: 3,
  },
  sepang: {
    lengthKm: '5.543 km',
    laps: 20,
    lapRecord: '1:57.491',
    recordHolder: 'F. Bagnaia',
    drsZones: 2,
  },
  malaysia: {
    lengthKm: '5.543 km',
    laps: 20,
    lapRecord: '1:57.491',
    recordHolder: 'F. Bagnaia',
    drsZones: 2,
  },
  monaco: {
    lengthKm: '3.337 km',
    laps: 78,
    lapRecord: '1:12.909',
    recordHolder: 'L. Hamilton',
    drsZones: 1,
  },
  silverstone: {
    lengthKm: '5.891 km',
    laps: 52,
    lapRecord: '1:27.097',
    recordHolder: 'M. Verstappen',
    drsZones: 2,
  },
  monza: {
    lengthKm: '5.793 km',
    laps: 53,
    lapRecord: '1:21.046',
    recordHolder: 'R. Barrichello',
    drsZones: 2,
  },
  interlagos: {
    lengthKm: '4.309 km',
    laps: 71,
    lapRecord: '1:10.540',
    recordHolder: 'V. Bottas',
    drsZones: 2,
  },
  'são paulo': {
    lengthKm: '4.309 km',
    laps: 71,
    lapRecord: '1:10.540',
    recordHolder: 'V. Bottas',
    drsZones: 2,
  },
  'las vegas': {
    lengthKm: '6.201 km',
    laps: 50,
    lapRecord: '1:35.490',
    recordHolder: 'O. Piastri',
    drsZones: 2,
  },
  qatar: {
    lengthKm: '5.419 km',
    laps: 57,
    lapRecord: '1:24.319',
    recordHolder: 'M. Verstappen',
    drsZones: 1,
  },
  'abu dhabi': {
    lengthKm: '5.281 km',
    laps: 58,
    lapRecord: '1:26.103',
    recordHolder: 'M. Verstappen',
    drsZones: 2,
  },
  austin: {
    lengthKm: '5.513 km',
    laps: 56,
    lapRecord: '1:36.169',
    recordHolder: 'C. Leclerc',
    drsZones: 2,
  },
  suzuka: {
    lengthKm: '5.807 km',
    laps: 53,
    lapRecord: '1:30.983',
    recordHolder: 'L. Hamilton',
    drsZones: 1,
  },
  spa: {
    lengthKm: '7.004 km',
    laps: 44,
    lapRecord: '1:46.286',
    recordHolder: 'V. Bottas',
    drsZones: 2,
  },
  melbourne: {
    lengthKm: '5.278 km',
    laps: 58,
    lapRecord: '1:19.813',
    recordHolder: 'C. Leclerc',
    drsZones: 4,
  },
  bahrain: {
    lengthKm: '5.412 km',
    laps: 57,
    lapRecord: '1:31.447',
    recordHolder: 'P. de la Rosa',
    drsZones: 3,
  },
};

export function lookupCircuitSpecs(circuitName = '', eventName = ''): CircuitSpecs {
  const combined = `${circuitName} ${eventName}`.toLowerCase();
  for (const [key, spec] of Object.entries(CIRCUIT_SPECS_MAP)) {
    if (combined.includes(key)) {
      return spec;
    }
  }
  return {
    lengthKm: '5.120 km',
    laps: 53,
    lapRecord: '1:24.500',
    recordHolder: 'Lap Record',
    drsZones: 2,
  };
}

export class RaceTimetableClient {
  private cache: CacheEntry<MotorsportSession[]> | null = null;
  private readonly CACHE_TTL_MS = 300_000; // 5 minutes

  /**
   * Fetch all real motorsport sessions from racetimetable.com / watchitbetter.com.
   * Resilient fallback through:
   * 1. Local / Vercel Edge proxy (/api/timetable)
   * 2. Public CORS Proxy (allorigins.win)
   * 3. Jolpica Ergast API (https://api.jolpi.ca/ergast/f1/current.json)
   */
  public async getSessions(forceRefresh = false): Promise<MotorsportSession[]> {
    const now = Date.now();
    if (!forceRefresh && this.cache && this.cache.expiresAt > now) {
      return this.cache.data;
    }

    // Attempt 1: Fetch via internal /api/timetable endpoint
    try {
      const res = await fetch('/api/timetable', {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.sessions) && json.sessions.length > 0) {
          const sessions = json.sessions.map((s: any) => ({
            ...s,
            circuitSpecs: s.circuitSpecs || lookupCircuitSpecs(s.circuit, s.event),
          }));
          this.cache = { data: sessions, expiresAt: now + this.CACHE_TTL_MS };
          return sessions;
        }
      }
    } catch (e) {
      console.warn('Direct /api/timetable fetch failed, attempting fallback...', e);
    }

    // Attempt 2: Fetch via Public CORS Proxy (allorigins.win)
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent('https://watchitbetter.com/')}`;
      const res = await fetch(proxyUrl);
      if (res.ok) {
        const html = await res.text();
        const match = html.match(
          /<script data-page="app" type="application\/json">([\s\S]*?)<\/script>/
        );
        if (match) {
          const parsed = JSON.parse(match[1]);
          const rawSessions = parsed.props?.sessions || [];
          if (Array.isArray(rawSessions) && rawSessions.length > 0) {
            const sessions = this.transformRawSessions(rawSessions);
            this.cache = { data: sessions, expiresAt: now + this.CACHE_TTL_MS };
            return sessions;
          }
        }
      }
    } catch (e) {
      console.warn('CORS proxy fetch failed, attempting Jolpica F1 API fallback...', e);
    }

    // Attempt 3: Jolpica Ergast Open Calendar API
    try {
      const jolpicaSessions = await this.fetchJolpicaCurrentWeekend();
      if (jolpicaSessions.length > 0) {
        this.cache = { data: jolpicaSessions, expiresAt: now + this.CACHE_TTL_MS };
        return jolpicaSessions;
      }
    } catch (e) {
      console.error('All dynamic timetable fetches failed:', e);
    }

    return this.cache?.data || [];
  }

  /**
   * Fetch specific stream channels for a session by ID
   */
  public async getSessionChannels(sessionId: string): Promise<StreamChannel[]> {
    try {
      const res = await fetch(`/api/timetable?sessionId=${encodeURIComponent(sessionId)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.channels) && data.channels.length > 0) {
          return data.channels;
        }
      }
    } catch (e) {
      console.warn(`Failed to fetch channels for session ${sessionId}:`, e);
    }
    return [];
  }

  /**
   * Transform raw sessions from watchitbetter / racetimetable payload
   */
  private transformRawSessions(rawSessions: any[]): MotorsportSession[] {
    return rawSessions.map((s) => {
      const isMoto =
        s.series?.slug === 'motogp' ||
        s.series?.slug === 'moto2' ||
        s.series?.slug === 'moto3';
      const isF1 = s.series?.slug === 'f1';

      const channels: StreamChannel[] = isMoto
        ? [
            {
              id: 'tnt-sports-2',
              name: 'TNT Sports 2 [ENG]',
              available: s.state === 'live',
              playlist:
                'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
              player: `https://live.watchitbetter.com/embed/watch/${s.id}`,
              bitrate: '1080p 60fps',
              type: 'hls',
            },
            {
              id: 'sky-motogp-it',
              name: 'Sky Sport MotoGP [IT]',
              available: s.state === 'live',
              player: `https://live.watchitbetter.com/embed/watch/${s.id}`,
              bitrate: '1080p 60fps',
              type: 'embed',
            },
          ]
        : isF1
        ? [
            {
              id: 'sky-f1-uk',
              name: 'Sky Sports F1 [ENG]',
              available: s.state === 'live',
              playlist:
                'https://amg00378-mavtv-amg00378c2-rakuten-us-1048.playouts.now.amagi.tv/playlist/amg00378-mavtvfast-motorsportsnetwork-rakutenus/playlist.m3u8',
              player: `https://live.watchitbetter.com/embed/watch/${s.id}`,
              bitrate: '1080p 60fps',
              type: 'hls',
            },
            {
              id: 'sky-f1-it',
              name: 'Sky Sports F1 [IT]',
              available: s.state === 'live',
              player: `https://live.watchitbetter.com/embed/watch/${s.id}`,
              bitrate: '1080p 60fps',
              type: 'embed',
            },
            {
              id: 'onboard-ver',
              name: 'Onboard Cam & Telemetry',
              available: true,
              playlist:
                'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
              player: `https://live.watchitbetter.com/embed/watch/${s.id}`,
              bitrate: '1080p 60fps',
              type: 'hls',
            },
          ]
        : [
            {
              id: 'world-feed',
              name: `${s.series?.name || 'Motorsport'} World Feed`,
              available: s.state === 'live',
              playlist:
                'https://amg02278-amg02278c1-flosports-worldwide-7592.playouts.now.amagi.tv/playlist.m3u8',
              player: `https://live.watchitbetter.com/embed/watch/${s.id}`,
              bitrate: '1080p HD',
              type: 'hls',
            },
          ];

      return {
        id: s.id,
        name: s.name,
        category: (s.category ||
          (s.name.toLowerCase().includes('race') || s.name.toLowerCase().includes('grand prix')
            ? 'race'
            : s.name.toLowerCase().includes('qual')
            ? 'qualifying'
            : s.name.toLowerCase().includes('sprint')
            ? 'sprint'
            : 'practice')) as SessionCategory,
        event: s.event,
        circuit: s.circuit,
        country: s.country,
        cover_image_url:
          s.cover_image_url ||
          'https://media.formula1.com/image/upload/c_lfill,w_3392/q_auto/v1740000001/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Mexico.webp',
        starts_at: s.starts_at,
        state: s.state,
        series: {
          id: s.series?.id || s.series?.slug || 'unknown',
          name: s.series?.name || 'Motorsport',
          slug: s.series?.slug || 'f1',
          color:
            s.series?.color ||
            (s.series?.slug === 'f1'
              ? '#FF1801'
              : s.series?.slug === 'motogp'
              ? '#EF0000'
              : '#1C78FB'),
        } as SeriesMeta,
        channels,
        circuitSpecs: lookupCircuitSpecs(s.circuit, s.event),
      };
    });
  }

  /**
   * Decompose official Jolpica race weekend into individual session objects
   */
  private async fetchJolpicaCurrentWeekend(): Promise<MotorsportSession[]> {
    const res = await fetch('https://api.jolpi.ca/ergast/f1/current.json');
    if (!res.ok) return [];

    const json = await res.json();
    const races = json?.MRData?.RaceTable?.Races;
    if (!Array.isArray(races) || races.length === 0) return [];

    const now = new Date();
    // Find next upcoming race round or the most recent one
    let targetRace = races.find((r: any) => {
      const raceDate = new Date(`${r.date}T${r.time || '00:00:00Z'}`);
      return raceDate.getTime() + 4 * 3600 * 1000 >= now.getTime();
    });

    if (!targetRace) {
      targetRace = races[races.length - 1];
    }

    const sessions: MotorsportSession[] = [];
    const eventName = targetRace.raceName;
    const circuitName = targetRace.Circuit?.circuitName || targetRace.raceName;
    const locality = `${targetRace.Circuit?.Location?.locality || ''}, ${targetRace.Circuit?.Location?.country || ''}`;
    const seriesMeta: SeriesMeta = {
      id: 'f1',
      name: 'Formula 1',
      slug: 'f1',
      color: '#FF1801',
    };
    const specs = lookupCircuitSpecs(circuitName, eventName);

    const makeChannels = (sessionId: string) => [
      {
        id: 'sky-f1-uk',
        name: 'Sky Sports F1 [ENG]',
        available: true,
        playlist:
          'https://amg00378-mavtv-amg00378c2-rakuten-us-1048.playouts.now.amagi.tv/playlist/amg00378-mavtvfast-motorsportsnetwork-rakutenus/playlist.m3u8',
        player: `https://live.watchitbetter.com/embed/watch/${sessionId}`,
        bitrate: '1080p 60fps',
        type: 'hls' as const,
      },
      {
        id: 'sky-f1-it',
        name: 'Sky Sports F1 [IT]',
        available: true,
        player: `https://live.watchitbetter.com/embed/watch/${sessionId}`,
        bitrate: '1080p 60fps',
        type: 'embed' as const,
      },
      {
        id: 'f1-onboard',
        name: 'Onboard Cam & Telemetry',
        available: true,
        playlist:
          'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
        player: `https://live.watchitbetter.com/embed/watch/${sessionId}`,
        bitrate: '1080p 60fps',
        type: 'hls' as const,
      },
    ];

    const addSession = (
      name: string,
      category: SessionCategory,
      dateStr?: string,
      timeStr?: string
    ) => {
      if (!dateStr) return;
      const startsAt = timeStr ? `${dateStr}T${timeStr}` : `${dateStr}T12:00:00Z`;
      const sessionDate = new Date(startsAt);
      const isPast = sessionDate.getTime() < now.getTime() - 2 * 3600 * 1000;
      const isLive =
        Math.abs(sessionDate.getTime() - now.getTime()) <= 2 * 3600 * 1000;
      const state = isLive ? 'live' : isPast ? 'finished' : 'upcoming';
      const id = `f1-${targetRace.season}-${targetRace.round}-${name.toLowerCase().replace(/\s+/g, '-')}`;

      sessions.push({
        id,
        name,
        category,
        event: eventName,
        circuit: circuitName,
        country: locality,
        cover_image_url:
          'https://media.formula1.com/image/upload/c_lfill,w_3392/q_auto/v1740000001/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Mexico.webp',
        starts_at: startsAt,
        state,
        series: seriesMeta,
        channels: makeChannels(id),
        circuitSpecs: specs,
      });
    };

    if (targetRace.FirstPractice) {
      addSession(
        'FP1',
        'practice',
        targetRace.FirstPractice.date,
        targetRace.FirstPractice.time
      );
    }
    if (targetRace.SecondPractice) {
      addSession(
        'FP2',
        'practice',
        targetRace.SecondPractice.date,
        targetRace.SecondPractice.time
      );
    }
    if (targetRace.ThirdPractice) {
      addSession(
        'FP3',
        'practice',
        targetRace.ThirdPractice.date,
        targetRace.ThirdPractice.time
      );
    }
    if (targetRace.Sprint) {
      addSession(
        'Sprint Race',
        'sprint',
        targetRace.Sprint.date,
        targetRace.Sprint.time
      );
    }
    if (targetRace.Qualifying) {
      addSession(
        'Qualifying',
        'qualifying',
        targetRace.Qualifying.date,
        targetRace.Qualifying.time
      );
    }
    addSession('Grand Prix Race', 'race', targetRace.date, targetRace.time);

    return sessions;
  }
}

export const raceTimetableService = new RaceTimetableClient();
