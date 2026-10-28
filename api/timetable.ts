export const config = {
  runtime: 'edge',
};

interface RawSession {
  id: string;
  name: string;
  category: string;
  cover_image_url: string;
  event: string;
  circuit: string;
  country: string;
  starts_at: string;
  state: 'upcoming' | 'live' | 'finished';
  series: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
}

interface RawChannel {
  id: string;
  name: string;
  available: boolean;
  playlist?: string;
  player: string;
}

const CIRCUIT_SPECS: Record<
  string,
  { lengthKm: string; laps: number; lapRecord: string; recordHolder: string; drsZones: number }
> = {
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
};

function resolveCircuitSpecs(circuitName: string, eventName: string) {
  const target = `${circuitName} ${eventName}`.toLowerCase();
  for (const [key, spec] of Object.entries(CIRCUIT_SPECS)) {
    if (target.includes(key)) {
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

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get('sessionId');

  try {
    // 1. If specific session channels requested:
    if (sessionId) {
      const sessionUrl = `https://watchitbetter.com/watch/${encodeURIComponent(sessionId)}`;
      const res = await fetch(sessionUrl, {
        headers: {
          Accept: 'text/html,application/xhtml+xml',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (!res.ok) {
        return new Response(
          JSON.stringify({ error: `Failed to fetch session page: ${res.status}` }),
          { status: res.status, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const html = await res.text();
      const match = html.match(
        /<script data-page="app" type="application\/json">([\s\S]*?)<\/script>/
      );

      if (!match) {
        return new Response(JSON.stringify({ error: 'Session payload not found in HTML' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const parsed = JSON.parse(match[1]);
      const session = parsed.props?.session;
      const channels: RawChannel[] = parsed.props?.channels || [];

      return new Response(
        JSON.stringify({
          session,
          channels: channels.map((c) => ({
            id: c.id,
            name: c.name,
            available: c.available,
            playlist: c.playlist?.startsWith('http')
              ? c.playlist
              : c.playlist
              ? `https://watchitbetter.com${c.playlist}`
              : undefined,
            player: c.player,
            bitrate: '1080p 60fps',
            type: c.playlist ? 'hls' : 'embed',
          })),
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // 2. Fetch all live and upcoming sessions from watchitbetter.com (sourced from racetimetable.com)
    const res = await fetch('https://watchitbetter.com/', {
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch timetable: ${res.status}` }),
        { status: res.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const html = await res.text();
    const match = html.match(
      /<script data-page="app" type="application\/json">([\s\S]*?)<\/script>/
    );

    if (!match) {
      return new Response(JSON.stringify({ error: 'Timetable payload not found in HTML' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const parsed = JSON.parse(match[1]);
    const rawSessions: RawSession[] = parsed.props?.sessions || [];

    const sessions = rawSessions.map((s) => {
      const isMoto =
        s.series?.slug === 'motogp' || s.series?.slug === 'moto2' || s.series?.slug === 'moto3';
      const isF1 = s.series?.slug === 'f1';

      // Build initial channels
      const channels = isMoto
        ? [
            {
              id: 'tnt-sports',
              name: 'TNT Sports 2 [ENG]',
              available: s.state === 'live',
              playlist:
                'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
              player: `https://live.watchitbetter.com/embed/watch/${s.id}`,
              bitrate: '1080p 60fps',
              type: 'hls' as const,
            },
            {
              id: 'sky-it-motogp',
              name: 'Sky Sport MotoGP [IT]',
              available: s.state === 'live',
              player: `https://live.watchitbetter.com/embed/watch/${s.id}`,
              bitrate: '1080p 60fps',
              type: 'embed' as const,
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
              type: 'hls' as const,
            },
            {
              id: 'sky-f1-it',
              name: 'Sky Sports F1 [IT]',
              available: s.state === 'live',
              player: `https://live.watchitbetter.com/embed/watch/${s.id}`,
              bitrate: '1080p 60fps',
              type: 'embed' as const,
            },
            {
              id: 'f1-onboard',
              name: 'Onboard Cam & Telemetry',
              available: true,
              playlist:
                'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
              player: `https://live.watchitbetter.com/embed/watch/${s.id}`,
              bitrate: '1080p 60fps',
              type: 'hls' as const,
            },
          ]
        : [
            {
              id: 'series-feed',
              name: `${s.series?.name || 'Motorsport'} World Feed`,
              available: s.state === 'live',
              playlist:
                'https://amg02278-amg02278c1-flosports-worldwide-7592.playouts.now.amagi.tv/playlist.m3u8',
              player: `https://live.watchitbetter.com/embed/watch/${s.id}`,
              bitrate: '1080p HD',
              type: 'hls' as const,
            },
          ];

      return {
        id: s.id,
        name: s.name,
        category:
          s.category ||
          (s.name.toLowerCase().includes('race') || s.name.toLowerCase().includes('grand prix')
            ? 'race'
            : s.name.toLowerCase().includes('qual')
            ? 'qualifying'
            : s.name.toLowerCase().includes('sprint')
            ? 'sprint'
            : 'practice'),
        event: s.event,
        circuit: s.circuit,
        country: s.country,
        cover_image_url: s.cover_image_url,
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
        },
        channels,
        circuitSpecs: resolveCircuitSpecs(s.circuit || '', s.event || ''),
      };
    });

    return new Response(
      JSON.stringify({
        source: 'racetimetable.com',
        fetchedAt: new Date().toISOString(),
        total: sessions.length,
        sessions,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: 'Failed to proxy timetable data',
        details: err?.message,
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
