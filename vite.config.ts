import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const tmdbKey = env.TMDB_API_KEY || env.VITE_TMDB_API_KEY;

  return {
    plugins: [
      react(),
      // Secure local development proxy for TMDB API (prevents browser exposure)
      {
        name: 'tmdb-api-dev-proxy',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && req.url.startsWith('/api/tmdb')) {
              try {
                const reqUrl = new URL(req.url, 'http://localhost:5173');
                const pathParam = reqUrl.searchParams.get('path');
                if (!pathParam) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Missing path parameter' }));
                  return;
                }

                const targetUrl = new URL(
                  `https://api.themoviedb.org/3${pathParam.startsWith('/') ? pathParam : `/${pathParam}`}`
                );
                reqUrl.searchParams.forEach((val, key) => {
                  if (key !== 'path') targetUrl.searchParams.set(key, val);
                });
                if (tmdbKey) {
                  targetUrl.searchParams.set('api_key', tmdbKey);
                }

                const response = await fetch(targetUrl.toString(), {
                  headers: {
                    Accept: 'application/json',
                    'User-Agent': 'Echora-Local-Proxy/1.0',
                  },
                });
                const data = await response.text();
                res.statusCode = response.status;
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.end(data);
                return;
              } catch (err: any) {
                res.statusCode = 502;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err?.message || 'Proxy error' }));
                return;
              }
            }
            if (req.url && req.url.startsWith('/api/timetable')) {
              try {
                const reqUrl = new URL(req.url, 'http://localhost:5173');
                const sessionId = reqUrl.searchParams.get('sessionId');

                if (sessionId) {
                  const targetUrl = `https://watchitbetter.com/watch/${encodeURIComponent(sessionId)}`;
                  const response = await fetch(targetUrl, {
                    headers: {
                      Accept: 'text/html,application/xhtml+xml',
                      'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    },
                  });
                  const html = await response.text();
                  const match = html.match(
                    /<script data-page="app" type="application\/json">([\s\S]*?)<\/script>/
                  );
                  if (match) {
                    const parsed = JSON.parse(match[1]);
                    const rawChannels = parsed.props?.channels || [];
                    const channels = rawChannels.map((c: any) => ({
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
                    }));
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.end(JSON.stringify({ session: parsed.props?.session, channels }));
                    return;
                  }
                }

                const response = await fetch('https://watchitbetter.com/', {
                  headers: {
                    Accept: 'text/html,application/xhtml+xml',
                    'User-Agent':
                      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  },
                });
                const html = await response.text();
                const match = html.match(
                  /<script data-page="app" type="application\/json">([\s\S]*?)<\/script>/
                );
                if (!match) {
                  throw new Error('Timetable payload not found');
                }

                const parsed = JSON.parse(match[1]);
                const rawSessions = parsed.props?.sessions || [];

                const sessions = rawSessions.map((s: any) => {
                  const isMoto =
                    s.series?.slug === 'motogp' ||
                    s.series?.slug === 'moto2' ||
                    s.series?.slug === 'moto3';
                  const isF1 = s.series?.slug === 'f1';

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
                      (s.name.toLowerCase().includes('race') ||
                      s.name.toLowerCase().includes('grand prix')
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
                    circuitSpecs:
                      (s.circuit || s.event || '').toLowerCase().includes('sepang') ||
                      (s.circuit || s.event || '').toLowerCase().includes('malaysia')
                        ? {
                            lengthKm: '5.543 km',
                            laps: 20,
                            lapRecord: '1:57.491',
                            recordHolder: 'F. Bagnaia',
                            drsZones: 2,
                          }
                        : (s.circuit || s.event || '').toLowerCase().includes('mexico') ||
                          (s.circuit || s.event || '').toLowerCase().includes('hermanos')
                        ? {
                            lengthKm: '4.304 km',
                            laps: 71,
                            lapRecord: '1:17.774',
                            recordHolder: 'V. Bottas',
                            drsZones: 3,
                          }
                        : {
                            lengthKm: '5.120 km',
                            laps: 53,
                            lapRecord: '1:24.500',
                            recordHolder: 'Lap Record',
                            drsZones: 2,
                          },
                  };
                });

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.end(
                  JSON.stringify({
                    source: 'racetimetable.com',
                    fetchedAt: new Date().toISOString(),
                    total: sessions.length,
                    sessions,
                  })
                );
                return;
              } catch (err: any) {
                res.statusCode = 502;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err?.message || 'Proxy error' }));
                return;
              }
            }
            next();
          });
        },
      },
      // Dynamic static asset compression on build
      ViteImageOptimizer({
        png: { quality: 80 },
        jpeg: { quality: 80 },
        webp: { lossless: true },
        svg: {
          multipass: true,
          plugins: [
            { name: 'removeViewBox', active: false },
            { name: 'sortAttrs' },
          ],
        },
      }),
    ],
    server: {
      port: 5173,
      host: true,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'zustand',
        '@tanstack/react-query',
        'hls.js',
        'lucide-react',
      ],
    },
    build: {
      target: 'esnext',
      cssCodeSplit: true,
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        treeshake: {
          moduleSideEffects: 'no-external',
          propertyReadSideEffects: false,
        },
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/react-router') || id.includes('node_modules/react-router-dom')) {
              return 'vendor-router';
            }
            if (id.includes('node_modules/@tanstack')) {
              return 'vendor-tanstack';
            }
            if (id.includes('node_modules/zustand')) {
              return 'vendor-state';
            }
            if (id.includes('node_modules/hls.js')) {
              return 'vendor-hls';
            }
            if (id.includes('node_modules/@clerk')) {
              return 'vendor-clerk';
            }
          },
        },
      },
    },
  };
});
