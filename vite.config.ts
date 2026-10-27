import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

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
