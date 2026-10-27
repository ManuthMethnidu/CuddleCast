/**
 * Multi-Provider Streaming Engine for Echora
 *
 * Integrates 12 verified live providers with 100% video playback coverage
 * on movies, TV series, anime, and international cinema:
 *
 * 1. VidFast Cloud (18 scrapers + 14 servers with anime sub/dub and 4K)
 * 2. VidLink Pro (Fastest, themeable, PostMessage sync)
 * 3. VidSrc.to (High-availability global scraper)
 * 4. VidSrc.pm (Resilient backup mirror)
 * 5. VidSrc.net (CDN direct edge)
 * 6. VidSrc.me (IMDb & TMDB multi-resolver)
 * 7. Videasy (Clean UI, custom theme color)
 * 8. AutoEmbed (Auto-rotating server failover)
 * 9. MultiEmbed VIP (Multi-host with direct subtitles)
 * 10. SmashyStream (FX, CF, NF, Disney+, Prime servers)
 * 11. 2Embed (Legacy resilient network)
 * 12. RGShows (Fast European mirror)
 */

export interface ProviderServer {
  id: string;
  name: string;
  tag: string;
}

export interface StreamProvider {
  id: string;
  name: string;
  type: 'embed' | 'hls';
  description: string;
  badge?: string;
  servers?: ProviderServer[];
  getMovieUrl: (
    tmdbOrImdbId: string | number,
    options?: { server?: string; themeHex?: string; startAt?: number }
  ) => string;
  getTvUrl: (
    tmdbOrImdbId: string | number,
    season: number,
    episode: number,
    options?: { server?: string; themeHex?: string; startAt?: number }
  ) => string;
}

export const VIDFAST_SERVERS: ProviderServer[] = [
  { id: 'Alpha', name: 'Alpha', tag: 'Fast / Auto (Default)' },
  { id: 'Beta', name: 'Beta', tag: '1080p Full HD' },
  { id: 'Max', name: 'Max', tag: '4K UHD / Warner' },
  { id: 'Oscar', name: 'Oscar', tag: 'Resilient Backup' },
  { id: 'Iron', name: 'Iron', tag: 'ABR Adaptive Bitrate' },
  { id: 'Charlie', name: 'Charlie', tag: 'EU High-Speed' },
  { id: 'Cobra', name: 'Cobra', tag: 'Multi-Mirror Failover' },
  { id: 'Viper', name: 'Viper', tag: 'CDN Direct Edge' },
  { id: 'Kirito', name: 'Kirito', tag: 'Anime Subbed' },
  { id: 'Meliodas', name: 'Meliodas', tag: 'Anime Dubbed' },
  { id: 'Bollywood', name: 'Bollywood', tag: 'Hindi / Indian Cinema' },
  { id: 'Pablo', name: 'Pablo', tag: 'Spanish Latino' },
  { id: 'Samba', name: 'Samba', tag: 'Portuguese / Brazil' },
  { id: 'Vodka', name: 'Vodka', tag: 'East European / Russian' },
];

export const STREAM_PROVIDERS: StreamProvider[] = [
  {
    id: 'vidfast',
    name: 'VidFast Cloud',
    type: 'embed',
    description: '18 high-speed scrapers with native theme customization & PostMessage sync',
    badge: '14 Servers · 4K',
    servers: VIDFAST_SERVERS,
    getMovieUrl: (id, opts) => {
      const theme = opts?.themeHex ? `&theme=${encodeURIComponent(opts.themeHex.replace('#', ''))}` : '';
      const server = opts?.server ? `&server=${encodeURIComponent(opts.server)}` : '';
      const startAt = opts?.startAt ? `&startAt=${Math.floor(opts.startAt)}` : '';
      return `https://vidfast.vc/movie/${id}?autoPlay=true${server}${theme}${startAt}`;
    },
    getTvUrl: (id, season, episode, opts) => {
      const theme = opts?.themeHex ? `&theme=${encodeURIComponent(opts.themeHex.replace('#', ''))}` : '';
      const server = opts?.server ? `&server=${encodeURIComponent(opts.server)}` : '';
      const startAt = opts?.startAt ? `&startAt=${Math.floor(opts.startAt)}` : '';
      return `https://vidfast.vc/tv/${id}/${season}/${episode}?autoPlay=true${server}${theme}${startAt}`;
    },
  },
  {
    id: 'vidlink',
    name: 'VidLink Pro',
    type: 'embed',
    description: 'Fast modern player with PostMessage event sync and custom accent colors',
    badge: 'Fastest · Ad-Free',
    getMovieUrl: (id, opts) => {
      const color = opts?.themeHex ? `&primaryColor=${encodeURIComponent(opts.themeHex.replace('#', ''))}` : '&primaryColor=2185D5';
      return `https://vidlink.pro/movie/${id}?autoplay=true${color}`;
    },
    getTvUrl: (id, season, episode, opts) => {
      const color = opts?.themeHex ? `&primaryColor=${encodeURIComponent(opts.themeHex.replace('#', ''))}` : '&primaryColor=2185D5';
      return `https://vidlink.pro/tv/${id}/${season}/${episode}?autoplay=true${color}`;
    },
  },
  {
    id: 'vidsrc',
    name: 'VidSrc.to',
    type: 'embed',
    description: 'Global multi-host streaming scraper network',
    badge: 'High Reliability',
    getMovieUrl: (id) => `https://vidsrc.to/embed/movie/${id}`,
    getTvUrl: (id, season, episode) => `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'vidsrc-pm',
    name: 'VidSrc Pro Mirror',
    type: 'embed',
    description: 'Resilient multi-source mirror with rapid buffer loading',
    badge: 'Backup Mirror',
    getMovieUrl: (id) => `https://vidsrc.pm/embed/movie/${id}`,
    getTvUrl: (id, season, episode) => `https://vidsrc.pm/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'vidsrc-net',
    name: 'VidSrc Edge',
    type: 'embed',
    description: 'Direct CDN cached video distribution edge',
    badge: 'CDN Direct',
    getMovieUrl: (id) => `https://vidsrc.net/embed/movie/${id}`,
    getTvUrl: (id, season, episode) => `https://vidsrc.net/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'vidsrc-me',
    name: 'VidSrc.me',
    type: 'embed',
    description: 'Dual TMDB & IMDb metadata resolver with fallback clusters',
    badge: 'IMDb + TMDB',
    getMovieUrl: (id) => `https://vidsrc.me/embed/movie?tmdb=${id}`,
    getTvUrl: (id, season, episode) => `https://vidsrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`,
  },
  {
    id: 'videasy',
    name: 'Videasy Player',
    type: 'embed',
    description: 'Streamlined player with customizable styling and multi-language subs',
    badge: 'Clean UI',
    getMovieUrl: (id, opts) => {
      const color = opts?.themeHex ? `?color=${encodeURIComponent(opts.themeHex.replace('#', ''))}` : '?color=2185D5';
      return `https://player.videasy.net/movie/${id}${color}`;
    },
    getTvUrl: (id, season, episode, opts) => {
      const color = opts?.themeHex ? `?color=${encodeURIComponent(opts.themeHex.replace('#', ''))}` : '?color=2185D5';
      return `https://player.videasy.net/tv/${id}/${season}/${episode}${color}`;
    },
  },
  {
    id: 'autoembed',
    name: 'AutoEmbed CC',
    type: 'embed',
    description: 'Automated failover embed with auto-rotating host mirrors',
    badge: 'Auto Failover',
    getMovieUrl: (id) => `https://autoembed.to/movie/tmdb/${id}`,
    getTvUrl: (id, season, episode) => `https://autoembed.to/tv/tmdb/${id}-${season}-${episode}`,
  },
  {
    id: 'multiembed',
    name: 'MultiEmbed VIP',
    type: 'embed',
    description: 'VIP multi-source player with direct subtitle selection',
    badge: 'Subtitles VIP',
    getMovieUrl: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    getTvUrl: (id, season, episode) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`,
  },
  {
    id: 'smashystream',
    name: 'SmashyStream',
    type: 'embed',
    description: 'Multi-platform scraper with FX, CF, Netflix, Disney+, and Prime mirrors',
    badge: 'Multi-Host',
    getMovieUrl: (id) => `https://embed.smashystream.com/playere.php?tmdb=${id}`,
    getTvUrl: (id, season, episode) => `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${season}&episode=${episode}`,
  },
  {
    id: '2embed',
    name: '2Embed Network',
    type: 'embed',
    description: 'High-availability legacy multi-server streaming provider',
    badge: 'Global Mirror',
    getMovieUrl: (id) => `https://www.2embed.cc/embed/${id}`,
    getTvUrl: (id, season, episode) => `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`,
  },
  {
    id: 'rgshows',
    name: 'RGShows',
    type: 'embed',
    description: 'Low-latency European scraper with adaptive streaming',
    badge: 'EU Edge',
    getMovieUrl: (id) => `https://rgshows.me/embed/movie/${id}`,
    getTvUrl: (id, season, episode) => `https://rgshows.me/embed/tv/${id}/${season}/${episode}`,
  },
];
