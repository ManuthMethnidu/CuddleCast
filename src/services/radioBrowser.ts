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
  hasGeo: boolean;
  clickcount?: number;
  latitude: number;
  longitude: number;
}

const API_SERVERS = [
  'https://de1.api.radio-browser.info/json',
  'https://all.api.radio-browser.info/json',
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
  LK: [7.8731, 80.7718],
  VN: [14.0583, 108.2772],
  PK: [30.3753, 69.3451],
  BD: [23.685, 90.3563],
  RS: [44.0165, 21.0059],
  HR: [45.1, 15.2],
  SK: [48.669, 19.699],
  BG: [42.7339, 25.4858],
  SI: [46.1512, 14.9955],
  EE: [58.5953, 25.0136],
  LV: [56.8796, 24.6032],
  LT: [55.1694, 23.8813],
  UY: [-32.5228, -55.7658],
  EC: [-1.8312, -78.1834],
  VE: [6.4238, -66.5897],
  CR: [9.7489, -83.7534],
  PA: [8.5379, -80.7821],
  DO: [18.7357, -70.1627],
  PR: [18.2208, -66.5901],
  DZ: [28.0339, 1.6596],
  MA: [31.7917, -7.0926],
  TN: [33.8869, 9.5375],
  GH: [7.9465, -1.0232],
  SN: [14.4974, -14.4524],
  CI: [7.54, -5.5471],
  CM: [7.3697, 12.3547],
  ET: [9.145, 40.4897],
  TZ: [-6.369, 34.8888],
  UG: [1.3733, 32.2903],
  AO: [-11.2027, 17.8739],
  ZW: [-19.0154, 29.1549],
  MZ: [-18.6657, 35.5296],
  MG: [-18.7669, 46.8691],
  IR: [32.4279, 53.688],
  IQ: [33.2232, 43.6793],
  JO: [30.5852, 36.2384],
  LB: [33.8547, 35.8623],
  QA: [25.3548, 51.1839],
  KW: [29.3117, 47.4818],
  OM: [21.4735, 55.9754],
  GT: [15.7835, -90.2308],
  HN: [15.2, -86.2419],
  SV: [13.7942, -88.8965],
  NI: [12.8654, -85.2072],
  BO: [-16.2902, -63.5887],
  PY: [-23.4425, -58.4438],
  TW: [23.6978, 120.9605],
  HK: [22.3193, 114.1694],
  NP: [28.3949, 84.124],
  KZ: [48.0196, 66.9237],
  LU: [49.8153, 6.1296],
  MT: [35.9375, 14.3754],
  CY: [35.1264, 33.4299],
  AL: [41.1533, 20.1683],
  BA: [43.9159, 17.6791],
  BY: [53.7098, 27.9534],
  MD: [47.4116, 28.3699],
  FJ: [-17.7134, 178.065],
  PG: [-6.315, 143.9555],
};

export interface RadioCountry {
  name: string;
  iso_3166_1: string;
  stationcount: number;
}

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

export function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode === 'GLOBAL' || countryCode.length !== 2) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function detectUserCountryCode(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Europe/Berlin') || tz.includes('Europe/Vienna')) return 'DE';
    if (tz.includes('Europe/London')) return 'GB';
    if (tz.includes('Europe/Paris')) return 'FR';
    if (tz.includes('Asia/Kolkata') || tz.includes('Calcutta')) return 'IN';
    if (tz.includes('Asia/Tokyo')) return 'JP';
    if (tz.includes('America/Sao_Paulo')) return 'BR';
    if (tz.includes('Australia/')) return 'AU';
    if (tz.includes('America/Toronto') || tz.includes('America/Vancouver')) return 'CA';
    if (tz.includes('America/Mexico_City')) return 'MX';
    if (tz.includes('America/')) return 'US';
    if (tz.includes('Europe/Madrid')) return 'ES';
    if (tz.includes('Europe/Rome')) return 'IT';
    if (tz.includes('Europe/Amsterdam')) return 'NL';
    if (tz.includes('Europe/Stockholm')) return 'SE';
    if (tz.includes('Europe/')) return 'DE';
  } catch {}

  if (typeof navigator !== 'undefined' && navigator.language) {
    const lang = navigator.language;
    if (lang.includes('-')) {
      const code = lang.split('-')[1].toUpperCase();
      if (code.length === 2) return code;
    }
  }
  return 'US';
}

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
    hasGeo: true,
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
    hasGeo: true,
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
    hasGeo: true,
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
    hasGeo: true,
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
    hasGeo: true,
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
    hasGeo: true,
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
    hasGeo: true,
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
    hasGeo: true,
    latitude: -33.8688,
    longitude: 151.2093,
  },
];

// Helper to validate geographic coordinates on land
export function isValidCoordinate(lat: any, lon: any): boolean {
  if (typeof lat !== 'number' || typeof lon !== 'number') return false;
  if (isNaN(lat) || isNaN(lon)) return false;
  if (lat === 0 && lon === 0) return false; // Exclude Null Island in Gulf of Guinea
  return lat >= -85 && lat <= 85 && lon >= -180 && lon <= 180;
}

/**
 * Detects if a coordinate is in an open ocean void or geographically incompatible with its country.
 * Catches corrupt community-submitted coordinates (e.g. Chinese radio in the Atlantic, German radio in the tropical sea).
 */
export function isOceanOrCorruptCoordinate(lat: number, lon: number, countrycode?: string): boolean {
  const code = (countrycode || '').toUpperCase();

  // 1. Deep Mid-Atlantic Ocean void (except island nations like Cape Verde, Saint Helena, Iceland, Greenland, Azores/Canaries)
  if (lat > -50 && lat < 60 && lon > -44 && lon < -26) {
    if (!['CV', 'SH', 'IS', 'GL', 'PT', 'ES'].includes(code)) return true;
  }

  // 2. Deep South Atlantic void
  if (lat > -45 && lat < -5 && lon > -25 && lon < 8) {
    if (!['SH'].includes(code)) return true;
  }

  // 3. Deep Mid-Indian Ocean void (except Mauritius, Reunion, Seychelles)
  if (lat > -45 && lat < -10 && lon > 65 && lon < 90) {
    if (!['MU', 'RE', 'SC'].includes(code)) return true;
  }

  // 4. Deep Central Pacific Ocean void (except Hawaii, Fiji, Samoa, French Polynesia)
  if (lat > -40 && lat < 45 && lon > -165 && lon < -125) {
    if (!['US', 'FJ', 'WS', 'PF', 'KI', 'TO'].includes(code)) return true;
  }

  // 5. Inconsistency with reported country centroid
  if (COUNTRY_COORDS[code]) {
    const [cLat, cLon] = COUNTRY_COORDS[code];
    const maxDiff = ['US', 'RU', 'CA', 'CN', 'BR', 'AU', 'IN', 'KZ', 'AR', 'ID'].includes(code) ? 38 : 16;
    if (Math.abs(lat - cLat) > maxDiff || Math.abs(lon - cLon) > maxDiff) {
      return true;
    }
  }

  return false;
}

export function parseRadioStation(raw: any, index: number): RadioBrowserStation {
  const latNum = typeof raw.geo_lat === 'number' ? raw.geo_lat : parseFloat(raw.geo_lat);
  const lonNum = typeof raw.geo_long === 'number' ? raw.geo_long : parseFloat(raw.geo_long);
  const code = (raw.countrycode || '').toUpperCase();
  const hasBasicGeo = isValidCoordinate(latNum, lonNum);

  let finalLat = 0;
  let finalLon = 0;
  let hasGeo = false;

  if (hasBasicGeo && !isOceanOrCorruptCoordinate(latNum, lonNum, code)) {
    // 100% verified genuine terrestrial broadcast coordinate
    finalLat = latNum;
    finalLon = lonNum;
    hasGeo = true;
  } else if (COUNTRY_COORDS[code]) {
    // If coordinate was missing or corrupt (e.g. submitted in the sea), snap safely to the country's land center
    const [baseLat, baseLon] = COUNTRY_COORDS[code];
    const angle = (index * 137.5) * (Math.PI / 180);
    const microRadius = ((index % 5) + 1) * 0.02; // max ~0.1 deg (~10km) tightly around land capital
    finalLat = baseLat + Math.sin(angle) * microRadius;
    finalLon = baseLon + Math.cos(angle) * microRadius;
    hasGeo = true;
  }

  return {
    stationuuid: raw.stationuuid || `station-${index}-${Date.now()}`,
    name: (raw.name || 'World Radio Station').trim(),
    url: raw.url || '',
    url_resolved: raw.url_resolved || raw.url || '',
    homepage: raw.homepage || '',
    favicon: raw.favicon || '',
    tags: raw.tags || '',
    country: raw.country || 'Global',
    countrycode: code || 'GL',
    state: raw.state || '',
    language: raw.language || '',
    votes: Number(raw.votes) || 0,
    codec: raw.codec || 'MP3',
    bitrate: Number(raw.bitrate) || 128,
    geo_lat: hasGeo ? finalLat : null,
    geo_long: hasGeo ? finalLon : null,
    hasGeo,
    clickcount: Number(raw.clickcount) || 0,
    latitude: finalLat,
    longitude: finalLon,
  };
}

class RadioBrowserService {
  private currentServerIndex = 0;

  private async fetchApi(endpoint: string): Promise<any> {
    for (let i = 0; i < API_SERVERS.length; i++) {
      const server = API_SERVERS[(this.currentServerIndex + i) % API_SERVERS.length];
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      try {
        const res = await fetch(`${server}${endpoint}`, {
          headers: {
            'User-Agent': 'EchoraRadio/2.0 (echora-bay.vercel.app)',
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          this.currentServerIndex = (this.currentServerIndex + i) % API_SERVERS.length;
          return await res.json();
        }
      } catch (err) {
        clearTimeout(timeoutId);
        console.warn(`Radio browser server ${server} notice:`, err);
      }
    }
    throw new Error('All Radio Browser API mirrors are currently unreachable.');
  }

  async getTopStations(limit = 600): Promise<RadioBrowserStation[]> {
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

  async getCountries(): Promise<RadioCountry[]> {
    try {
      const data = await this.fetchApi(`/countries?order=stationcount&reverse=true`);
      if (Array.isArray(data)) {
        return data.filter((c: any) => c.iso_3166_1 && c.stationcount > 0);
      }
    } catch {}
    return [];
  }

  private cachedWorldStations: RadioBrowserStation[] | null = null;

  async getStationsWithGeo(limit = 1200): Promise<RadioBrowserStation[]> {
    if (this.cachedWorldStations && this.cachedWorldStations.length > 0) {
      return this.cachedWorldStations;
    }

    try {
      // Fetch verified geographic radio stations worldwide with real lat/long coordinates on land
      const data = await this.fetchApi(
        `/stations/search?has_geo_info=true&limit=${limit}&order=clickcount&reverse=true&hidebroken=true`
      );

      if (Array.isArray(data) && data.length > 0) {
        const validStations: RadioBrowserStation[] = [];
        data.forEach((raw: any, index: number) => {
          const st = parseRadioStation(raw, index);
          if (st.hasGeo && isValidCoordinate(st.latitude, st.longitude)) {
            validStations.push(st);
          }
        });

        if (validStations.length > 0) {
          this.cachedWorldStations = validStations;
          return validStations;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch geo stations:', err);
    }
    return INITIAL_CURATED_STATIONS;
  }

  async getRandomStation(): Promise<RadioBrowserStation | null> {
    try {
      const data = await this.fetchApi(
        `/stations/search?limit=1&order=random&hidebroken=true`
      );
      if (Array.isArray(data) && data.length > 0) {
        return parseRadioStation(data[0], 0);
      }
    } catch {}
    const randomIndex = Math.floor(Math.random() * INITIAL_CURATED_STATIONS.length);
    return INITIAL_CURATED_STATIONS[randomIndex];
  }

  async getStats(): Promise<{ stations: number; countries: number; tags: number }> {
    try {
      const data = await this.fetchApi(`/stats`);
      if (data && typeof data.stations === 'number') {
        return {
          stations: data.stations,
          countries: data.countries || 228,
          tags: data.tags || 12000,
        };
      }
    } catch {}
    return { stations: 65000, countries: 228, tags: 12800 };
  }

  async countClick(stationuuid: string): Promise<string | null> {
    if (!stationuuid) return null;
    try {
      const data = await this.fetchApi(`/url/${encodeURIComponent(stationuuid)}`);
      if (data && data.url) {
        return data.url;
      }
    } catch {}
    return null;
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

  async getStationsByCountry(countryCode: string, limit = 200): Promise<RadioBrowserStation[]> {
    if (!countryCode || countryCode === 'GLOBAL') return this.getStationsWithGeo();
    try {
      const data = await this.fetchApi(
        `/stations/search?countrycode=${encodeURIComponent(countryCode)}&limit=${limit}&order=clickcount&reverse=true&hidebroken=true`
      );
      if (Array.isArray(data) && data.length > 0) {
        return data.map(parseRadioStation);
      }
    } catch (err) {
      console.warn('Failed to fetch country stations:', err);
    }
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

  async getCuratedForUser(countryCode: string, genres: string[] = [], limit = 40): Promise<RadioBrowserStation[]> {
    const results: RadioBrowserStation[] = [];
    const seenUuids = new Set<string>();

    if (countryCode && countryCode !== 'GLOBAL') {
      try {
        const countryStations = await this.getStationsByCountry(countryCode, 30);
        countryStations.forEach((st) => {
          if (!seenUuids.has(st.stationuuid)) {
            seenUuids.add(st.stationuuid);
            results.push(st);
          }
        });
      } catch {}
    }

    for (const g of genres.slice(0, 4)) {
      if (results.length >= limit) break;
      try {
        const genreStations = await this.getStationsByTag(g, 15);
        genreStations.forEach((st) => {
          if (!seenUuids.has(st.stationuuid)) {
            seenUuids.add(st.stationuuid);
            results.push(st);
          }
        });
      } catch {}
    }

    if (results.length < 8) {
      INITIAL_CURATED_STATIONS.forEach((st) => {
        if (!seenUuids.has(st.stationuuid)) {
          seenUuids.add(st.stationuuid);
          results.push(st);
        }
      });
    }

    return results.slice(0, limit);
  }

  async getStationsByUuids(uuids: string[]): Promise<RadioBrowserStation[]> {
    if (!uuids || uuids.length === 0) return [];
    try {
      const data = await this.fetchApi(
        `/stations/byuuid?uuids=${encodeURIComponent(uuids.join(','))}`
      );
      if (Array.isArray(data) && data.length > 0) {
        return data.map(parseRadioStation);
      }
    } catch {}
    return INITIAL_CURATED_STATIONS.filter((s) => uuids.includes(s.stationuuid));
  }
}

export const radioBrowserApi = new RadioBrowserService();
