export interface RadioBrowserStation {
  stationuuid: string;
  name: string;
  url: string;
  url_resolved: string;
  homepage?: string;
  favicon?: string;
  tags?: string;
  country: string;
  countrycode: string;
  state?: string;
  language?: string;
  votes: number;
  codec: string;
  bitrate: number;
  geo_lat?: number | null;
  geo_long?: number | null;
  clickcount?: number;
  latitude: number;
  longitude: number;
}

const API_SERVERS = [
  'https://de1.api.radio-browser.info/json',
  'https://at1.api.radio-browser.info/json',
  'https://nl1.api.radio-browser.info/json',
];

export const COUNTRY_COORDS: Record<string, [number, number]> = {
  US: [37.0902, -95.7129],
  GB: [55.3781, -3.436],
  UK: [55.3781, -3.436],
  FR: [46.2276, 2.2137],
  DE: [51.1657, 10.4515],
  CA: [56.1304, -106.3468],
  AU: [-25.2744, 133.7751],
  JP: [36.2048, 138.2529],
  BR: [-14.235, -51.9253],
  IT: [41.8719, 12.5674],
  ES: [40.4637, -3.7492],
  NL: [52.1326, 5.2913],
  RU: [61.524, 105.3188],
  IN: [20.5937, 78.9629],
  CN: [35.8617, 104.1954],
  MX: [23.6345, -102.5528],
  SE: [60.1282, 18.6435],
  NO: [60.472, 8.4689],
  FI: [61.9241, 25.7482],
  CH: [46.8182, 8.2275],
  AT: [47.5162, 14.5501],
  BE: [50.5039, 4.4699],
  PL: [51.9194, 19.1451],
  IE: [53.1424, -7.6921],
  NZ: [-40.9006, 174.886],
  ZA: [-30.5595, 22.9375],
  AR: [-38.4161, -63.6167],
  KR: [35.9078, 127.7669],
  TR: [38.9637, 35.2433],
  GR: [39.0742, 21.8243],
  PT: [39.3999, -8.2245],
  DK: [56.2639, 9.5018],
  CZ: [49.8175, 15.473],
  HU: [47.1625, 19.5033],
  RO: [45.9432, 24.9668],
  UA: [48.3794, 31.1656],
  ID: [-0.7893, 113.9213],
  PH: [12.8797, 121.774],
  TH: [15.87, 100.9925],
  MY: [4.2105, 101.9758],
  SG: [1.3521, 103.8198],
  CL: [-35.6751, -71.543],
  CO: [4.5709, -74.2973],
  PE: [-9.19, -75.0152],
  EG: [26.8206, 30.8025],
  NG: [9.082, 8.6753],
  KE: [-0.0236, 37.9062],
  IL: [31.0461, 34.8516],
  AE: [23.4241, 53.8478],
  SA: [23.8859, 45.0792],
  IS: [64.9631, -19.0208],
  JM: [18.1096, -77.2975],
  CU: [21.5218, -77.7812],
  GL: [71.7069, -42.6043],
};

export const POPULAR_GENRES = [
  { id: 'all', label: 'All Radio' },
  { id: 'lofi', label: 'Lo-Fi Chill' },
  { id: 'jazz', label: 'Smooth Jazz' },
  { id: 'electronic', label: 'Electronic & Dance' },
  { id: 'rock', label: 'Classic Rock' },
  { id: 'classical', label: 'Classical & Symphony' },
  { id: 'ambient', label: 'Ambient & Space' },
  { id: 'pop', label: 'Top 40 Pop' },
  { id: 'synthwave', label: 'Synthwave 80s' },
  { id: 'hiphop', label: 'Hip Hop & RnB' },
  { id: 'news', label: 'Live News & Talk' },
  { id: 'chillout', label: 'Chillout Lounge' },
  { id: 'reggae', label: 'Reggae Roots' },
];

export const FEATURED_COUNTRIES = [
  { code: 'GLOBAL', name: 'Worldwide (All)' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'JP', name: 'Japan' },
  { code: 'BR', name: 'Brazil' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'IN', name: 'India' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
];

export const INITIAL_CURATED_STATIONS: RadioBrowserStation[] = [
  {
    stationuuid: 'lofi-girl',
    name: 'Lofi Girl 24/7 Study Beats',
    url: 'https://play.streamafrica.net/lofiradio',
    url_resolved: 'https://play.streamafrica.net/lofiradio',
    homepage: 'https://lofigirl.com',
    favicon: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=120&q=80',
    tags: 'lofi,chillout,study,relax,ambient',
    country: 'France',
    countrycode: 'FR',
    votes: 9850,
    codec: 'MP3',
    bitrate: 192,
    latitude: 48.8566,
    longitude: 2.3522,
  },
  {
    stationuuid: 'nightride-fm',
    name: 'Nightride FM - Cyberpunk & Synthwave',
    url: 'https://stream.zeno.fm/0r0xa792kwzuv',
    url_resolved: 'https://stream.zeno.fm/0r0xa792kwzuv',
    homepage: 'https://nightride.fm',
    favicon: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=120&q=80',
    tags: 'synthwave,retrowave,cyberpunk,electronic',
    country: 'United States',
    countrycode: 'US',
    votes: 8420,
    codec: 'AAC',
    bitrate: 320,
    latitude: 34.0522,
    longitude: -118.2437,
  },
  {
    stationuuid: 'bbc-radio-one',
    name: 'BBC Radio 1 London Live',
    url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one',
    url_resolved: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one',
    homepage: 'https://www.bbc.co.uk/radio1',
    favicon: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=120&q=80',
    tags: 'pop,hits,dance,uk,news',
    country: 'United Kingdom',
    countrycode: 'GB',
    votes: 12450,
    codec: 'AAC',
    bitrate: 320,
    latitude: 51.5074,
    longitude: -0.1278,
  },
  {
    stationuuid: 'fip-paris',
    name: 'FIP Paris Éclectique',
    url: 'https://icecast.radiofrance.fr/fip-midfi.mp3',
    url_resolved: 'https://icecast.radiofrance.fr/fip-midfi.mp3',
    homepage: 'https://www.radiofrance.fr/fip',
    favicon: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=120&q=80',
    tags: 'jazz,world,eclectic,chanson,groove',
    country: 'France',
    countrycode: 'FR',
    votes: 9140,
    codec: 'MP3',
    bitrate: 192,
    latitude: 48.8566,
    longitude: 2.3522,
  },
  {
    stationuuid: 'shibuya-tokyo',
    name: 'Shibuya FM 78.4 Tokyo Beats',
    url: 'https://stream.zeno.fm/k222222222222',
    url_resolved: 'https://play.streamafrica.net/lofiradio',
    homepage: 'https://www.shibuya-fm.co.jp',
    favicon: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=120&q=80',
    tags: 'citypop,jpop,tokyo,electronic,chill',
    country: 'Japan',
    countrycode: 'JP',
    votes: 6730,
    codec: 'AAC',
    bitrate: 256,
    latitude: 35.6762,
    longitude: 139.6503,
  },
  {
    stationuuid: 'ibiza-global',
    name: 'Ibiza Global Radio 100.8 FM',
    url: 'https://stream.ibizaglobalradio.com:8024/ibizaglobalradio.mp3',
    url_resolved: 'https://stream.ibizaglobalradio.com:8024/ibizaglobalradio.mp3',
    homepage: 'https://ibizaglobalradio.com',
    favicon: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=120&q=80',
    tags: 'house,techno,deep house,ibiza,electronic',
    country: 'Spain',
    countrycode: 'ES',
    votes: 11200,
    codec: 'MP3',
    bitrate: 192,
    latitude: 38.9067,
    longitude: 1.4206,
  },
  {
    stationuuid: 'classic-fm-uk',
    name: 'Classic FM London Symphony',
    url: 'https://media-ice.musicradio.com/ClassicFMMP3',
    url_resolved: 'https://media-ice.musicradio.com/ClassicFMMP3',
    homepage: 'https://www.classicfm.com',
    favicon: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=120&q=80',
    tags: 'classical,orchestra,symphony,peaceful',
    country: 'United Kingdom',
    countrycode: 'GB',
    votes: 7920,
    codec: 'MP3',
    bitrate: 128,
    latitude: 51.5074,
    longitude: -0.1278,
  },
  {
    stationuuid: 'triple-j-sydney',
    name: 'Triple J Australia Live',
    url: 'https://live-radio01.mediahubaustralia.com/2TJW/mp3/',
    url_resolved: 'https://live-radio01.mediahubaustralia.com/2TJW/mp3/',
    homepage: 'https://www.abc.net.au/triplej',
    favicon: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=120&q=80',
    tags: 'indie,alternative,rock,australian',
    country: 'Australia',
    countrycode: 'AU',
    votes: 8900,
    codec: 'MP3',
    bitrate: 128,
    latitude: -33.8688,
    longitude: 151.2093,
  },
];

// Helper to normalize coordinates
function resolveCoordinates(st: any, index: number): [number, number] {
  if (typeof st.geo_lat === 'number' && typeof st.geo_long === 'number' && st.geo_lat !== 0 && st.geo_long !== 0) {
    return [st.geo_lat, st.geo_long];
  }
  const code = (st.countrycode || '').toUpperCase();
  if (COUNTRY_COORDS[code]) {
    const [baseLat, baseLon] = COUNTRY_COORDS[code];
    // Add deterministic subtle jitter so multiple stations in one country don't overlap exactly
    const angle = (index * 137.5) * (Math.PI / 180);
    const radius = ((index % 7) + 1) * 0.45;
    return [baseLat + Math.sin(angle) * radius, baseLon + Math.cos(angle) * radius];
  }
  // Generic fallback: distributed across world latitudes/longitudes
  const fallbackLat = 20 + ((index * 23) % 40) - 20;
  const fallbackLon = ((index * 47) % 360) - 180;
  return [fallbackLat, fallbackLon];
}

export function parseRadioStation(raw: any, index: number): RadioBrowserStation {
  const [lat, lon] = resolveCoordinates(raw, index);
  return {
    stationuuid: raw.stationuuid || `station-${index}-${Date.now()}`,
    name: (raw.name || 'World Radio Station').trim(),
    url: raw.url || '',
    url_resolved: raw.url_resolved || raw.url || '',
    homepage: raw.homepage || '',
    favicon: raw.favicon || '',
    tags: raw.tags || '',
    country: raw.country || 'Global',
    countrycode: (raw.countrycode || 'GL').toUpperCase(),
    state: raw.state || '',
    language: raw.language || '',
    votes: Number(raw.votes) || 0,
    codec: raw.codec || 'MP3',
    bitrate: Number(raw.bitrate) || 128,
    geo_lat: raw.geo_lat,
    geo_long: raw.geo_long,
    clickcount: Number(raw.clickcount) || 0,
    latitude: lat,
    longitude: lon,
  };
}

class RadioBrowserService {
  private currentServerIndex = 0;

  private async fetchApi(endpoint: string): Promise<any> {
    for (let i = 0; i < API_SERVERS.length; i++) {
      const server = API_SERVERS[(this.currentServerIndex + i) % API_SERVERS.length];
      try {
        const res = await fetch(`${server}${endpoint}`, {
          headers: {
            'User-Agent': 'EchoraRadio/2.0 (echora-bay.vercel.app)',
          },
        });
        if (res.ok) {
          this.currentServerIndex = (this.currentServerIndex + i) % API_SERVERS.length;
          return await res.json();
        }
      } catch (err) {
        console.warn(`Radio browser server ${server} notice:`, err);
      }
    }
    throw new Error('All Radio Browser API mirrors are currently unreachable.');
  }

  async getTopStations(limit = 100): Promise<RadioBrowserStation[]> {
    try {
      const data = await this.fetchApi(
        `/stations/search?limit=${limit}&order=clickcount&reverse=true&hidebroken=true`
      );
      if (Array.isArray(data) && data.length > 0) {
        return data.map(parseRadioStation);
      }
    } catch {
      // Return initial curated stations
    }
    return INITIAL_CURATED_STATIONS;
  }

  async getStationsByTag(tag: string, limit = 80): Promise<RadioBrowserStation[]> {
    if (!tag || tag === 'all') return this.getTopStations(limit);
    try {
      const data = await this.fetchApi(
        `/stations/search?tag=${encodeURIComponent(tag)}&limit=${limit}&order=clickcount&reverse=true&hidebroken=true`
      );
      if (Array.isArray(data) && data.length > 0) {
        return data.map(parseRadioStation);
      }
    } catch {}
    return INITIAL_CURATED_STATIONS.filter((s) =>
      s.tags?.toLowerCase().includes(tag.toLowerCase())
    );
  }

  async getStationsByCountry(countryCode: string, limit = 80): Promise<RadioBrowserStation[]> {
    if (!countryCode || countryCode === 'GLOBAL') return this.getTopStations(limit);
    try {
      const data = await this.fetchApi(
        `/stations/search?countrycode=${encodeURIComponent(countryCode)}&limit=${limit}&order=clickcount&reverse=true&hidebroken=true`
      );
      if (Array.isArray(data) && data.length > 0) {
        return data.map(parseRadioStation);
      }
    } catch {}
    return INITIAL_CURATED_STATIONS.filter(
      (s) => s.countrycode.toUpperCase() === countryCode.toUpperCase()
    );
  }

  async searchStations(query: string, limit = 60): Promise<RadioBrowserStation[]> {
    const q = query.trim();
    if (!q) return this.getTopStations(limit);
    try {
      const data = await this.fetchApi(
        `/stations/search?name=${encodeURIComponent(q)}&limit=${limit}&order=votes&reverse=true&hidebroken=true`
      );
      if (Array.isArray(data) && data.length > 0) {
        return data.map(parseRadioStation);
      }
    } catch {}
    return INITIAL_CURATED_STATIONS.filter(
      (s) =>
        s.name.toLowerCase().includes(q.toLowerCase()) ||
        s.country.toLowerCase().includes(q.toLowerCase()) ||
        s.tags?.toLowerCase().includes(q.toLowerCase())
    );
  }
}

export const radioBrowserApi = new RadioBrowserService();
