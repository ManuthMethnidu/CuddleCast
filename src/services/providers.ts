/**
 * Multi-Provider Streaming Engine for Echora
 *
 * Integrates VidFast (18 scraper clusters + 6 EU proxies), VidSrc, AutoEmbed,
 * and MultiEmbed for 100% video playback coverage on movies and TV series.
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
    id: 'vidsrc',
    name: 'VidSrc Pro',
    type: 'embed',
    description: 'Global multi-host streaming scraper network',
    getMovieUrl: (id) => `https://vidsrc.to/embed/movie/${id}`,
    getTvUrl: (id, season, episode) => `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'autoembed',
    name: 'AutoEmbed CC',
    type: 'embed',
    description: 'Automated failover embed with high availability',
    getMovieUrl: (id) => `https://player.autoembed.cc/embed/movie/${id}`,
    getTvUrl: (id, season, episode) => `https://player.autoembed.cc/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'multiembed',
    name: 'MultiEmbed VIP',
    type: 'embed',
    description: 'VIP multi-source player with direct subtitle selection',
    getMovieUrl: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    getTvUrl: (id, season, episode) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`,
  },
];
