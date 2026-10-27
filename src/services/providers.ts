/**
 * Complete Vidbox & Cloud Streaming Engine for Echora
 *
 * Integrates all 47 verified streaming providers categorized into:
 * - Fastest (VidFast, VidLink, Videasy 4K, VidPlus, Super, VidCore, VidRock, VixSrc, YTHD)
 * - OTT Mirrors (Netflix, Amazon Prime, Disney+ Hotstar, Nxsha Multi)
 * - International Dubs (Hindi, Tamil, Telugu, ModiPlay, NHD, Spanish, French, Brazil, Russian, German, Italian, Japanese, Polish, Thai, Turkish, Arabic)
 * - Backup Mirrors (VidKing, 2Embed, CinemaOS, VidNest, NontonGo, MoviesAPI, 111Movies, SuperFlix, RiveStream, Flicky, Peachify, PrimeSrc, VidSrc)
 */

export type ProviderCategory = 'fastest' | 'ott' | 'international' | 'backup';

export interface ProviderServer {
  id: string;
  name: string;
  tag: string;
}

export interface StreamProvider {
  id: string;
  name: string;
  category: ProviderCategory;
  badge?: string;
  description: string;
  countryCode?: string;
  flagUrl?: string;
  servers?: ProviderServer[];
  getMovieUrl: (
    tmdbId: string | number,
    options?: { server?: string; themeHex?: string; startAt?: number }
  ) => string;
  getTvUrl: (
    tmdbId: string | number,
    season: number,
    episode: number,
    options?: { server?: string; themeHex?: string; startAt?: number }
  ) => string;
}

export const VIDFAST_SERVERS: ProviderServer[] = [
  { id: 'Alpha', name: 'Alpha', tag: 'Fast / Auto (Default)' },
  { id: 'Beta', name: 'Beta', tag: '1080p Full HD' },
  { id: 'Max', name: 'Max', tag: '4K UHD / High Bitrate' },
  { id: 'Oscar', name: 'Oscar', tag: 'Resilient Backup' },
  { id: 'Iron', name: 'Iron', tag: 'ABR Adaptive Bitrate' },
  { id: 'Charlie', name: 'Charlie', tag: 'EU High-Speed CDN' },
  { id: 'Cobra', name: 'Cobra', tag: 'Multi-Mirror Failover' },
  { id: 'Viper', name: 'Viper', tag: 'Direct Edge Cache' },
  { id: 'Kirito', name: 'Kirito', tag: 'Anime Subbed' },
  { id: 'Meliodas', name: 'Meliodas', tag: 'Anime Dubbed' },
  { id: 'Bollywood', name: 'Bollywood', tag: 'Hindi / Indian Cinema' },
  { id: 'Pablo', name: 'Pablo', tag: 'Spanish Latino' },
  { id: 'Samba', name: 'Samba', tag: 'Portuguese / Brazil' },
  { id: 'Vodka', name: 'Vodka', tag: 'East European / Russian' },
];

export const STREAM_PROVIDERS: StreamProvider[] = [
  // ==========================================
  // 1. FASTEST / PRIMARY STREAMING SERVERS (10)
  // ==========================================
  {
    id: 'vidfast',
    name: 'VidFast Cloud',
    category: 'fastest',
    badge: 'Fastest · 14 Servers',
    description: 'High-speed cloud scraper network with 14 regional nodes and 4K support',
    countryCode: 'US',
    servers: VIDFAST_SERVERS,
    getMovieUrl: (id, opts) => {
      const server = opts?.server ? `&server=${encodeURIComponent(opts.server)}` : '';
      const theme = opts?.themeHex ? `&theme=${encodeURIComponent(opts.themeHex.replace('#', ''))}` : '';
      return `https://vidfast.vc/movie/${id}?autoPlay=true${server}${theme}`;
    },
    getTvUrl: (id, season, episode, opts) => {
      const server = opts?.server ? `&server=${encodeURIComponent(opts.server)}` : '';
      const theme = opts?.themeHex ? `&theme=${encodeURIComponent(opts.themeHex.replace('#', ''))}` : '';
      return `https://vidfast.vc/tv/${id}/${season}/${episode}?autoPlay=true${server}${theme}`;
    },
  },
  {
    id: 'vidlink',
    name: 'VidLink Pro',
    category: 'fastest',
    badge: 'Clean · Ad-Free',
    description: 'Modern ad-free player with custom accent synchronization',
    countryCode: 'US',
    getMovieUrl: (id, opts) => {
      const color = opts?.themeHex ? opts.themeHex.replace('#', '') : '2185D5';
      return `https://vidlink.pro/movie/${id}?autoplay=true&primaryColor=${color}&title=false&poster=true`;
    },
    getTvUrl: (id, season, episode, opts) => {
      const color = opts?.themeHex ? opts.themeHex.replace('#', '') : '2185D5';
      return `https://vidlink.pro/tv/${id}/${season}/${episode}?autoplay=true&primaryColor=${color}&title=false&poster=true`;
    },
  },
  {
    id: 'videasy-4k',
    name: 'Videasy 4K',
    category: 'fastest',
    badge: '4K UHD',
    description: 'High-definition 4K streaming pipeline with instant loading',
    countryCode: 'GB',
    getMovieUrl: (id, opts) => {
      const color = opts?.themeHex ? `?color=${encodeURIComponent(opts.themeHex.replace('#', ''))}` : '';
      return `https://player.videasy.to/movie/${id}${color}`;
    },
    getTvUrl: (id, season, episode, opts) => {
      const color = opts?.themeHex ? `?color=${encodeURIComponent(opts.themeHex.replace('#', ''))}` : '';
      return `https://player.videasy.to/tv/${id}/${season}/${episode}${color}`;
    },
  },
  {
    id: 'vidplus-v2',
    name: 'VidPlus V2',
    category: 'fastest',
    badge: 'Ultra Fast',
    description: 'Next-generation VidPlus engine with rapid buffer caching',
    countryCode: 'GB',
    getMovieUrl: (id) => `https://player2.vidplus.pro/embed/movie/${id}?autoplay=true`,
    getTvUrl: (id, season, episode) =>
      `https://player2.vidplus.pro/embed/tv/${id}/${season}/${episode}?autoplay=true`,
  },
  {
    id: 'vidplus-premium',
    name: 'VidPlus Premium',
    category: 'fastest',
    badge: 'HDR Multi-Audio',
    description: 'Direct master stream with multi-channel audio tracks',
    countryCode: 'US',
    getMovieUrl: (id) =>
      `https://player.vidplus.pro/embed/movie/${id}?autoplay=true&download=true`,
    getTvUrl: (id, season, episode) =>
      `https://player2.vidplus.pro/embed/tv/${id}/${season}/${episode}?autoplay=true&autonext=true&nextbutton=true&poster=true`,
  },
  {
    id: 'vidsuper',
    name: 'VidSuper Net',
    category: 'fastest',
    badge: '1080p Pure',
    description: 'Direct high-bitrate encoder with low latency',
    countryCode: 'GB',
    getMovieUrl: (id) => `https://vidsuper.net/movie/${id}`,
    getTvUrl: (id, season, episode) => `https://vidsuper.net/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'vidcore',
    name: 'VidCore HD',
    category: 'fastest',
    badge: 'Subtitles',
    description: 'Cloud core with multi-language embedded subtitles',
    countryCode: 'GB',
    getMovieUrl: (id) => `https://vidcore.net/movie/${id}?autoPlay=true&sub=en`,
    getTvUrl: (id, season, episode) =>
      `https://vidcore.net/tv/${id}/${season}/${episode}?autoPlay=true&sub=en`,
  },
  {
    id: 'vidrock',
    name: 'VidRock Direct',
    category: 'fastest',
    badge: 'No Buffer',
    description: 'Reliable high-throughput video delivery network',
    countryCode: 'GB',
    getMovieUrl: (id) => `https://vidrock.net/embed/movie/${id}?autoplay=true`,
    getTvUrl: (id, season, episode) =>
      `https://vidrock.net/embed/tv/${id}/${season}/${episode}?autoplay=true&nextbutton=false&episodeselector=false`,
  },
  {
    id: 'vixsrc',
    name: 'VixSrc Pro',
    category: 'fastest',
    badge: 'Pro Scraper',
    description: 'Advanced multi-host video extractor with adaptive bitrate',
    countryCode: 'GB',
    getMovieUrl: (id) => `https://vixsrc.to/movie/${id}`,
    getTvUrl: (id, season, episode) => `https://vixsrc.to/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'ythd-max',
    name: 'YTHD Max',
    category: 'fastest',
    badge: 'Max HD',
    description: 'Resilient high-availability embed provider',
    countryCode: 'US',
    getMovieUrl: (id) => `https://ythd.org/embed/${id}`,
    getTvUrl: (id, season, episode) => `https://ythd.org/embed/${id}/${season}-${episode}`,
  },

  // ==========================================
  // 2. OTT PLATFORM MIRRORS (4)
  // ==========================================
  {
    id: 'ott-netflix',
    name: 'Netflix Mirror',
    category: 'ott',
    badge: 'Netflix CDN',
    description: 'OTT optimized mirror powered by ZetPly streaming cluster',
    countryCode: 'US',
    getMovieUrl: (id) =>
      `https://nxsha.space/embed/movie/${id}?lang=en&autoplay=true&one_server=true&server=ZetPly-[Multi-Lang]`,
    getTvUrl: (id, season, episode) =>
      `https://nxsha.space/embed/tv/${id}/${season}/${episode}?lang=en&autoplay=true&one_server=true&server=ZetPly-[Multi-Lang]`,
  },
  {
    id: 'ott-prime',
    name: 'Prime Video Mirror',
    category: 'ott',
    badge: 'Prime Multi',
    description: 'High-availability mirror powered by OrVid streaming cluster',
    countryCode: 'US',
    getMovieUrl: (id) =>
      `https://nxsha.space/embed/movie/${id}?lang=en&autoplay=true&one_server=true&server=OrVid-[Multi-Lang]`,
    getTvUrl: (id, season, episode) =>
      `https://nxsha.space/embed/tv/${id}/${season}/${episode}?lang=en&autoplay=true&one_server=true&server=OrVid-[Multi-Lang]`,
  },
  {
    id: 'ott-hotstar',
    name: 'Hotstar Mirror',
    category: 'ott',
    badge: 'Disney+ Hotstar',
    description: 'Global streaming node powered by QsPly cluster with multi-language support',
    countryCode: 'US',
    getMovieUrl: (id) =>
      `https://nxsha.space/embed/movie/${id}?lang=en&autoplay=true&one_server=true&server=QsPly-[Multi-Lang]`,
    getTvUrl: (id, season, episode) =>
      `https://nxsha.space/embed/tv/${id}/${season}/${episode}?lang=en&autoplay=true&one_server=true&server=QsPly-[Multi-Lang]`,
  },
  {
    id: 'nxsha-main',
    name: 'Nxsha Multi-Server',
    category: 'ott',
    badge: 'Auto Rotate',
    description: 'Intelligent multi-server resolver with English audio and subtitles',
    countryCode: 'US',
    getMovieUrl: (id) => `https://nxsha.space/embed/movie/${id}?lang=en&autoplay=true&sub=en`,
    getTvUrl: (id, season, episode) =>
      `https://nxsha.space/embed/tv/${id}/${season}/${episode}?lang=en&autoplay=true&sub=en`,
  },

  // ==========================================
  // 3. INTERNATIONAL DUBS & REGIONAL (18)
  // ==========================================
  {
    id: 'intl-hindi',
    name: 'Hindi Cinema & Dub',
    category: 'international',
    badge: 'Hindi Audio',
    description: 'Bollywood and international releases dubbed in pure Hindi',
    countryCode: 'IN',
    getMovieUrl: (id) => `https://nxsha.space/embed/movie/${id}?lang=hindi&autoplay=true`,
    getTvUrl: (id, season, episode) =>
      `https://nxsha.space/embed/tv/${id}/${season}/${episode}?lang=hindi&autoplay=true`,
  },
  {
    id: 'intl-tamil',
    name: 'Tamil Cinema & Dub',
    category: 'international',
    badge: 'Tamil Audio',
    description: 'Kollywood blockbusters and global movies with Tamil audio',
    countryCode: 'IN',
    getMovieUrl: (id) => `https://nxsha.space/embed/movie/${id}?lang=tamil&autoplay=true`,
    getTvUrl: (id, season, episode) =>
      `https://nxsha.space/embed/tv/${id}/${season}/${episode}?lang=tamil&autoplay=true`,
  },
  {
    id: 'intl-telugu',
    name: 'Telugu Cinema & Dub',
    category: 'international',
    badge: 'Telugu Audio',
    description: 'Tollywood blockbusters and multi-language movies in Telugu',
    countryCode: 'IN',
    getMovieUrl: (id) => `https://nxsha.space/embed/movie/${id}?lang=telugu&autoplay=true`,
    getTvUrl: (id, season, episode) =>
      `https://nxsha.space/embed/tv/${id}/${season}/${episode}?lang=telugu&autoplay=true`,
  },
  {
    id: 'intl-modiplay',
    name: 'ModiPlay India',
    category: 'international',
    badge: 'India CDN',
    description: 'High-speed Indian regional content delivery server',
    countryCode: 'IN',
    getMovieUrl: (id) => `https://rozgarlelo.modiplay.xyz/embed/tmdb/movie?id=${id}`,
    getTvUrl: (id, season, episode) =>
      `https://rozgarlelo.modiplay.xyz/embed/tmdb/tv?id=${id}&s=${season}&e=${episode}`,
  },
  {
    id: 'intl-nhd',
    name: 'NHD Multi-Audio',
    category: 'international',
    badge: 'Dual Audio',
    description: 'Direct dual-audio and multi-track Indian cinema streaming',
    countryCode: 'IN',
    getMovieUrl: (id) =>
      `https://nhdapi.com/embed/movie/${id}?autoplay=true&autonext=true&audio=true&title=true&download=true`,
    getTvUrl: (id, season, episode) =>
      `https://nhdapi.com/embed/tv/${id}/${season}/${episode}?autoplay=true&autonext=true&audio=true&title=true&download=true`,
  },
  {
    id: 'intl-spanish',
    name: 'Spanish / Latino',
    category: 'international',
    badge: 'Español Latino',
    description: 'Cinema and series with Spanish Latino audio and subtitles',
    countryCode: 'ES',
    getMovieUrl: (id) => `https://nxsha.space/embed/movie/${id}?lang=es&autoplay=true&sub=es`,
    getTvUrl: (id, season, episode) =>
      `https://nxsha.space/embed/tv/${id}/${season}/${episode}?lang=es&autoplay=true&sub=es`,
  },
  {
    id: 'intl-french',
    name: 'French HD (Frembed)',
    category: 'international',
    badge: 'Français VF',
    description: 'French dubbed releases and native French cinema (VF/VOSTFR)',
    countryCode: 'FR',
    getMovieUrl: (id) => `https://frembed.hair/api/film.php?id=${id}`,
    getTvUrl: (id, season, episode) =>
      `https://frembed.hair/api/serie.php?id=${id}&sa=${season}&epi=${episode}`,
  },
  {
    id: 'intl-french2',
    name: 'French 2 (Nxsha)',
    category: 'international',
    badge: 'Français V2',
    description: 'Alternative high-speed French streaming mirror',
    countryCode: 'FR',
    getMovieUrl: (id) => `https://nxsha.space/embed/movie/${id}?lang=fr&autoplay=true&sub=fr`,
    getTvUrl: (id, season, episode) =>
      `https://nxsha.space/embed/tv/${id}/${season}/${episode}?lang=fr&autoplay=true&sub=fr`,
  },
  {
    id: 'intl-brazil',
    name: 'Portuguese / Brazil',
    category: 'international',
    badge: 'Português BR',
    description: 'Brazilian Portuguese dubbing with subtitles',
    countryCode: 'BR',
    getMovieUrl: (id) => `https://nxsha.space/embed/movie/${id}?lang=pt&autoplay=true&sub=pt`,
    getTvUrl: (id, season, episode) =>
      `https://nxsha.space/embed/tv/${id}/${season}/${episode}?lang=pt&autoplay=true&sub=pt`,
  },
  {
    id: 'intl-rus',
    name: 'Russian Dub',
    category: 'international',
    badge: 'Русский',
    description: 'Russian multi-voice translation and dubbed cinema',
    countryCode: 'RU',
    getMovieUrl: (id) => `https://nxsha.space/embed/movie/${id}?lang=ru&autoplay=true&sub=ru`,
    getTvUrl: (id, season, episode) =>
      `https://nxsha.space/embed/tv/${id}/${season}/${episode}?lang=ru&autoplay=true&sub=ru`,
  },
  {
    id: 'intl-german',
    name: 'German Dub',
    category: 'international',
    badge: 'Deutsch',
    description: 'German synchronized cinema audio tracks',
    countryCode: 'DE',
    getMovieUrl: (id) => `https://nxsha.space/embed/movie/${id}?lang=de&autoplay=true&sub=de`,
    getTvUrl: (id, season, episode) =>
      `https://nxsha.space/embed/tv/${id}/${season}/${episode}?lang=de&autoplay=true&sub=de`,
  },
  {
    id: 'intl-italy',
    name: 'Italian Dub (VixSrc)',
    category: 'international',
    badge: 'Italiano',
    description: 'Italian language audio mirror via VixSrc',
    countryCode: 'IT',
    getMovieUrl: (id) => `https://vixsrc.to/movie/${id}?lang=it`,
    getTvUrl: (id, season, episode) => `https://vixsrc.to/tv/${id}/${season}/${episode}?lang=it`,
  },
  {
    id: 'intl-italy2',
    name: 'Italian 2 (Nxsha)',
    category: 'international',
    badge: 'Italiano V2',
    description: 'Alternative Italian streaming mirror with subtitles',
    countryCode: 'IT',
    getMovieUrl: (id) => `https://nxsha.space/embed/movie/${id}?lang=it&autoplay=true&sub=it`,
    getTvUrl: (id, season, episode) =>
      `https://nxsha.space/embed/tv/${id}/${season}/${episode}?lang=it&autoplay=true&sub=it`,
  },
  {
    id: 'intl-japan',
    name: 'Japanese / Anime',
    category: 'international',
    badge: '日本語 Anime',
    description: 'Original Japanese audio with English subtitles, ideal for anime',
    countryCode: 'JP',
    getMovieUrl: (id) => `https://nxsha.space/embed/movie/${id}?lang=ja&autoplay=true&sub=ja`,
    getTvUrl: (id, season, episode) =>
      `https://nxsha.space/embed/tv/${id}/${season}/${episode}?lang=ja&autoplay=true&sub=ja`,
  },
  {
    id: 'intl-polish',
    name: 'Polish Dub',
    category: 'international',
    badge: 'Polski',
    description: 'Polish voice-over (Lektor) and subtitles',
    countryCode: 'PL',
    getMovieUrl: (id) => `https://nxsha.space/embed/movie/${id}?lang=pl&autoplay=true&sub=pl`,
    getTvUrl: (id, season, episode) =>
      `https://nxsha.space/embed/tv/${id}/${season}/${episode}?lang=pl&autoplay=true&sub=pl`,
  },
  {
    id: 'intl-thai',
    name: 'Thai Dub',
    category: 'international',
    badge: 'ภาษาไทย',
    description: 'Thai dubbed cinema with synchronized subtitles',
    countryCode: 'TH',
    getMovieUrl: (id) => `https://nxsha.space/embed/movie/${id}?lang=th&autoplay=true&sub=th`,
    getTvUrl: (id, season, episode) =>
      `https://nxsha.space/embed/tv/${id}/${season}/${episode}?lang=th&autoplay=true&sub=th`,
  },
  {
    id: 'intl-turkish',
    name: 'Turkish Dub',
    category: 'international',
    badge: 'Türkçe',
    description: 'Turkish cinema audio dubbing and subtitles',
    countryCode: 'TR',
    getMovieUrl: (id) => `https://nxsha.space/embed/movie/${id}?lang=tr&autoplay=true&sub=tr`,
    getTvUrl: (id, season, episode) =>
      `https://nxsha.space/embed/tv/${id}/${season}/${episode}?lang=tr&autoplay=true&sub=tr`,
  },
  {
    id: 'intl-arab',
    name: 'Arabic Dub',
    category: 'international',
    badge: 'العربية',
    description: 'Arabic audio dubbing and synchronized Arabic subtitles',
    countryCode: 'SA',
    getMovieUrl: (id) => `https://nxsha.space/embed/movie/${id}?lang=ar&autoplay=true&sub=ar`,
    getTvUrl: (id, season, episode) =>
      `https://nxsha.space/embed/tv/${id}/${season}/${episode}?lang=ar&autoplay=true&sub=ar`,
  },

  // ==========================================
  // 4. HIGH-AVAILABILITY BACKUP MIRRORS (15)
  // ==========================================
  {
    id: 'backup-vidking',
    name: 'VidKing Net',
    category: 'backup',
    badge: 'Backup 1',
    description: 'High-availability embed mirror with episode picker',
    countryCode: 'US',
    getMovieUrl: (id) => `https://www.vidking.net/embed/movie/${id}?autoplay=true`,
    getTvUrl: (id, season, episode) =>
      `https://www.vidking.net/embed/tv/${id}/${season}/${episode}?autoplay=true&episodeSelector=true`,
  },
  {
    id: 'backup-2embed',
    name: '2Embed Stream',
    category: 'backup',
    badge: 'Backup 2',
    description: 'Legacy resilient streaming cluster for movies & series',
    countryCode: 'AU',
    getMovieUrl: (id) => `https://2embed.stream/embed/movie/${id}`,
    getTvUrl: (id, season, episode) => `https://www.2embed.stream/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'backup-cinemaos',
    name: 'CinemaOS Tech',
    category: 'backup',
    badge: 'Backup 3',
    description: 'Cloud player with native browser controls',
    countryCode: 'US',
    getMovieUrl: (id) => `https://cinemaos.tech/player/${id}`,
    getTvUrl: (id, season, episode) => `https://cinemaos.tech/player/${id}/${season}/${episode}`,
  },
  {
    id: 'backup-vidnest',
    name: 'VidNest Fun',
    category: 'backup',
    badge: 'Backup 4',
    description: 'Fast CDN mirror with rapid buffer loading',
    countryCode: 'GB',
    getMovieUrl: (id) => `https://vidnest.fun/movie/${id}`,
    getTvUrl: (id, season, episode) => `https://vidnest.fun/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'backup-nontongo',
    name: 'NontonGo Win',
    category: 'backup',
    badge: 'Backup 5',
    description: 'International resilient mirror for older and catalog releases',
    countryCode: 'US',
    getMovieUrl: (id) => `https://www.NontonGo.win/embed/movie/${id}`,
    getTvUrl: (id, season, episode) =>
      `https://www.NontonGo.win/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'backup-moviesapi',
    name: 'MoviesAPI Bravo',
    category: 'backup',
    badge: 'Backup 6',
    description: 'Direct TMDB indexed high-speed player',
    countryCode: 'GB',
    getMovieUrl: (id) => `https://moviesapi.to/movie/${id}`,
    getTvUrl: (id, season, episode) => `https://moviesapi.to/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'backup-111movies',
    name: '111Movies Net',
    category: 'backup',
    badge: 'Backup 7',
    description: 'Fast European mirror for movies and TV series',
    countryCode: 'GB',
    getMovieUrl: (id) => `https://111movies.net/movie/${id}`,
    getTvUrl: (id, season, episode) => `https://111movies.net/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'backup-superflix',
    name: 'SuperFlix Jade',
    category: 'backup',
    badge: 'Backup 8',
    description: 'Portuguese and international catalog streaming mirror',
    countryCode: 'PT',
    getMovieUrl: (id) => `https://superflixapi.lifestyle/filme/${id}`,
    getTvUrl: (id, season, episode) =>
      `https://superflixapi.lifestyle/serie/${id}/${season}/${episode}`,
  },
  {
    id: 'backup-rivestream',
    name: 'RiveStream App',
    category: 'backup',
    badge: 'Backup 9',
    description: 'Clean responsive embed player',
    countryCode: 'GB',
    getMovieUrl: (id) => `https://www.rivestream.app/embed?type=movie&id=${id}`,
    getTvUrl: (id, season, episode) =>
      `https://www.rivestream.app/embed?type=tv&id=${id}&season=${season}&episode=${episode}`,
  },
  {
    id: 'backup-flicky',
    name: 'Flicky Host',
    category: 'backup',
    badge: 'Backup 10',
    description: 'High-speed alternative embed server',
    countryCode: 'IN',
    getMovieUrl: (id) => `https://flicky.host/embed/movie/?id=${id}`,
    getTvUrl: (id, season, episode) =>
      `https://flicky.host/embed/tv/?id=${id}/${season}/${episode}`,
  },
  {
    id: 'backup-peachify',
    name: 'Peachify Top',
    category: 'backup',
    badge: 'Backup 11',
    description: 'Embed mirror with default English subtitles',
    countryCode: 'US',
    getMovieUrl: (id) => `https://peachify.top/embed/movie/${id}?autoplay=true&sub=English`,
    getTvUrl: (id, season, episode) =>
      `https://peachify.top/embed/tv/${id}/${season}/${episode}?autoplay=true&sub=English`,
  },
  {
    id: 'backup-primesrc',
    name: 'PrimeSrc Me',
    category: 'backup',
    badge: 'Backup 12',
    description: 'IMDb and TMDB resolver mirror',
    countryCode: 'AU',
    getMovieUrl: (id) => `https://primesrc.me/embed/movie?imdb=${id}`,
    getTvUrl: (id, season, episode) =>
      `https://primesrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`,
  },
  {
    id: 'backup-vidsrc',
    name: 'VidSrc To',
    category: 'backup',
    badge: 'Backup 13',
    description: 'Global multi-host streaming scraper network',
    countryCode: 'US',
    getMovieUrl: (id) => `https://vidsrc.to/embed/movie/${id}`,
    getTvUrl: (id, season, episode) => `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'backup-vidsrc-pm',
    name: 'VidSrc PM',
    category: 'backup',
    badge: 'Backup 14',
    description: 'Resilient multi-source mirror with rapid buffer loading',
    countryCode: 'US',
    getMovieUrl: (id) => `https://vidsrc.pm/embed/movie/${id}`,
    getTvUrl: (id, season, episode) => `https://vidsrc.pm/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'backup-autoembed',
    name: 'AutoEmbed CC',
    category: 'backup',
    badge: 'Backup 15',
    description: 'Automated failover mirror with auto-rotating host servers',
    countryCode: 'US',
    getMovieUrl: (id) => `https://autoembed.to/movie/tmdb/${id}`,
    getTvUrl: (id, season, episode) =>
      `https://autoembed.to/tv/tmdb/${id}-${season}-${episode}`,
  },
];

/**
 * Returns providers filtered by category tab
 */
export function getProvidersByCategory(category: ProviderCategory): StreamProvider[] {
  return STREAM_PROVIDERS.filter((p) => p.category === category);
}

/**
 * Finds the next provider in sequence for automated failover
 */
export function getNextProvider(currentProviderId: string): StreamProvider {
  const currentIndex = STREAM_PROVIDERS.findIndex((p) => p.id === currentProviderId);
  if (currentIndex === -1 || currentIndex === STREAM_PROVIDERS.length - 1) {
    return STREAM_PROVIDERS[0];
  }
  return STREAM_PROVIDERS[currentIndex + 1];
}
