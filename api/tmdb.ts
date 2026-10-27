export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.searchParams.get('path');

  if (!path) {
    return new Response(
      JSON.stringify({ error: 'Missing path query parameter (e.g. ?path=/search/multi)' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Private server-side secret - never sent to the browser
  const apiKey = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'TMDB_API_KEY is not configured on the server environment' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Construct target TMDB API v3 URL
  const targetUrl = new URL(
    `https://api.themoviedb.org/3${path.startsWith('/') ? path : `/${path}`}`
  );

  // Forward all query parameters except our routing 'path'
  url.searchParams.forEach((value, key) => {
    if (key !== 'path') {
      targetUrl.searchParams.set(key, value);
    }
  });

  // Attach the private API key on the backend
  targetUrl.searchParams.set('api_key', apiKey);

  try {
    const tmdbRes = await fetch(targetUrl.toString(), {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Echora-Secure-Edge-Proxy/1.0',
      },
    });

    const data = await tmdbRes.text();

    return new Response(data, {
      status: tmdbRes.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'Failed to proxy request to TMDB', details: err?.message }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
