import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Radio as RadioIcon,
  Search,
  Shuffle,
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Star,
  Globe as GlobeIcon,
  Plus,
  Minus,
  Compass,
  X,
} from 'lucide-react';
import { useAccent } from '../context/AccentContext';
import { authStorage } from '../services/storage';

export interface RadioStation {
  uuid: string;
  name: string;
  url: string;
  url_resolved?: string;
  homepage?: string;
  favicon?: string;
  tags?: string;
  country: string;
  countrycode: string;
  codec: string;
  bitrate: number;
  latitude: number;
  longitude: number;
}

// Country Centroids for accurate mapping
const COUNTRY_COORDS: Record<string, [number, number]> = {
  US: [37.09, -95.71],
  GB: [55.37, -3.43],
  FR: [46.22, 2.21],
  DE: [51.16, 10.45],
  JP: [36.20, 138.25],
  CA: [56.13, -106.34],
  AU: [-25.27, 133.77],
  BR: [-14.23, -51.92],
  IN: [20.59, 78.96],
  IT: [41.87, 12.56],
  ES: [40.46, -3.74],
  NL: [52.13, 5.29],
  GL: [71.70, -42.60],
  MX: [23.63, -102.55],
  ZA: [-30.55, 22.93],
  AR: [-38.41, -63.61],
  SE: [60.12, 18.64],
  NO: [60.47, 8.46],
  PL: [51.91, 19.14],
  KR: [35.90, 127.76],
  CH: [46.81, 8.22],
  IE: [53.14, -7.69],
  NZ: [-40.90, 174.88],
  JM: [18.10, -77.29],
  GR: [39.07, 21.82],
};

// Rich curated world stations ready out-of-the-box
const CURATED_STATIONS: RadioStation[] = [
  {
    uuid: 'gl-nanoq',
    name: 'Nanoq FM',
    url: 'https://stream.rcs.revma.com/9v8y2r6b5k8uv',
    country: 'Greenland',
    countrycode: 'GL',
    codec: 'MP3',
    bitrate: 256,
    tags: 'pop, arctic, hits',
    latitude: 64.18,
    longitude: -51.72,
  },
  {
    uuid: 'gl-knr',
    name: 'KNR Live Radio',
    url: 'https://knr.dk/live.mp3',
    country: 'Greenland',
    countrycode: 'GL',
    codec: 'MP3',
    bitrate: 192,
    tags: 'news, culture, greenlandic',
    latitude: 68.70,
    longitude: -52.86,
  },
  {
    uuid: 'us-kexp',
    name: 'KEXP 90.3 FM Seattle',
    url: 'https://kexp-mp3-128.streamguys1.com/kexp128.mp3',
    country: 'United States',
    countrycode: 'US',
    codec: 'MP3',
    bitrate: 320,
    tags: 'indie, rock, live, alternative',
    latitude: 47.60,
    longitude: -122.33,
  },
  {
    uuid: 'us-somafm-groove',
    name: 'SomaFM: Groove Salad',
    url: 'https://ice1.somafm.com/groovesalad-128-mp3',
    country: 'United States',
    countrycode: 'US',
    codec: 'MP3',
    bitrate: 128,
    tags: 'ambient, chillout, downtempo',
    latitude: 37.77,
    longitude: -122.41,
  },
  {
    uuid: 'us-lofi',
    name: 'Lofi Girl - Chill Study Beats',
    url: 'https://play.streamafrica.net/lofiradio',
    country: 'United States',
    countrycode: 'US',
    codec: 'MP3',
    bitrate: 192,
    tags: 'lofi, hiphop, beats, study',
    latitude: 34.05,
    longitude: -118.24,
  },
  {
    uuid: 'gb-bbc1',
    name: 'BBC Radio 1',
    url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one',
    country: 'United Kingdom',
    countrycode: 'GB',
    codec: 'AAC',
    bitrate: 320,
    tags: 'hits, electronic, pop',
    latitude: 51.50,
    longitude: -0.12,
  },
  {
    uuid: 'gb-bbc-world',
    name: 'BBC World Service Live',
    url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service',
    country: 'United Kingdom',
    countrycode: 'GB',
    codec: 'AAC',
    bitrate: 128,
    tags: 'news, talk, global',
    latitude: 51.52,
    longitude: -0.14,
  },
  {
    uuid: 'fr-fip',
    name: 'FIP Paris Radio',
    url: 'https://icecast.radiofrance.fr/fip-midfi.mp3',
    country: 'France',
    countrycode: 'FR',
    codec: 'MP3',
    bitrate: 192,
    tags: 'eclectic, jazz, world',
    latitude: 48.85,
    longitude: 2.35,
  },
  {
    uuid: 'fr-franceinfo',
    name: 'France Info Live',
    url: 'https://icecast.radiofrance.fr/franceinfo-midfi.mp3',
    country: 'France',
    countrycode: 'FR',
    codec: 'MP3',
    bitrate: 128,
    tags: 'news, national, talk',
    latitude: 48.86,
    longitude: 2.34,
  },
  {
    uuid: 'de-nightride',
    name: 'Nightride FM - Cyberpunk & Synth',
    url: 'https://stream.zeno.fm/0r0xa792kwzuv',
    country: 'Germany',
    countrycode: 'DE',
    codec: 'AAC',
    bitrate: 320,
    tags: 'synthwave, retrowave, cyberpunk',
    latitude: 52.52,
    longitude: 13.40,
  },
  {
    uuid: 'de-chillhop',
    name: 'Chillhop Cafe',
    url: 'https://streams.ilovemusic.de/iloveradio17.mp3',
    country: 'Germany',
    countrycode: 'DE',
    codec: 'MP3',
    bitrate: 192,
    tags: 'chillhop, jazz, relax',
    latitude: 50.11,
    longitude: 8.68,
  },
  {
    uuid: 'jp-jpop',
    name: 'Tokyo FM Live',
    url: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
    country: 'Japan',
    countrycode: 'JP',
    codec: 'MP3',
    bitrate: 192,
    tags: 'jpop, anime, tokyo',
    latitude: 35.67,
    longitude: 139.65,
  },
  {
    uuid: 'jp-lofi-tokyo',
    name: 'Japan Anime & City Pop Beats',
    url: 'https://stream.zeno.fm/54unv2m1g08uv',
    country: 'Japan',
    countrycode: 'JP',
    codec: 'MP3',
    bitrate: 192,
    tags: 'citypop, lofi, anime',
    latitude: 34.69,
    longitude: 135.50,
  },
  {
    uuid: 'nl-defected',
    name: 'Amsterdam Deep House FM',
    url: 'https://stream.zeno.fm/4w90c0wmdg8uv',
    country: 'Netherlands',
    countrycode: 'NL',
    codec: 'MP3',
    bitrate: 320,
    tags: 'deephouse, club, electronic',
    latitude: 52.36,
    longitude: 4.90,
  },
  {
    uuid: 'au-triplej',
    name: 'Triple J Sydney Live',
    url: 'https://live-radio01.mediahubaustralia.com/2TJW/mp3/',
    country: 'Australia',
    countrycode: 'AU',
    codec: 'MP3',
    bitrate: 192,
    tags: 'alternative, indie, new music',
    latitude: -33.86,
    longitude: 151.20,
  },
  {
    uuid: 'br-bossanova',
    name: 'Bossa Nova Brazil Rio',
    url: 'https://stream.zeno.fm/wz3kv6wmdg8uv',
    country: 'Brazil',
    countrycode: 'BR',
    codec: 'MP3',
    bitrate: 192,
    tags: 'bossanova, samba, acoustic',
    latitude: -22.90,
    longitude: -43.17,
  },
  {
    uuid: 'in-bollywood',
    name: 'Radio City Hindi Hits',
    url: 'https://stream.zeno.fm/8p3wv6wmdg8uv',
    country: 'India',
    countrycode: 'IN',
    codec: 'MP3',
    bitrate: 160,
    tags: 'bollywood, hindi, acoustic',
    latitude: 19.07,
    longitude: 72.87,
  },
  {
    uuid: 'es-ibiza',
    name: 'Ibiza Global Radio',
    url: 'https://stream.ibizaglobalradio.com:8024/ibizaglobalradio.mp3',
    country: 'Spain',
    countrycode: 'ES',
    codec: 'MP3',
    bitrate: 320,
    tags: 'ibiza, electronic, balearic',
    latitude: 38.90,
    longitude: 1.43,
  },
  {
    uuid: 'jm-reggae',
    name: 'Irie FM Jamaica Reggae',
    url: 'https://stream.zeno.fm/s4wvbbqmdg8uv',
    country: 'Jamaica',
    countrycode: 'JM',
    codec: 'MP3',
    bitrate: 192,
    tags: 'reggae, dub, roots',
    latitude: 18.40,
    longitude: -77.10,
  },
];

interface RadioAtlasViewProps {
  onBack: () => void;
}

export const RadioAtlasView: React.FC<RadioAtlasViewProps> = ({ onBack }) => {
  const { accentHex } = useAccent();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Stations State
  const [stations, setStations] = useState<RadioStation[]>(CURATED_STATIONS);
  const [selectedStation, setSelectedStation] = useState<RadioStation>(CURATED_STATIONS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);

  // Tabs & Search State
  const [mode, setMode] = useState<'world' | 'favorites' | 'recent'>('world');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() =>
    authStorage.getRadioFavorites()
  );
  const [recent, setRecent] = useState<string[]>(() =>
    authStorage.getRadioRecent()
  );

  // Subscribe to authStorage user switches or updates
  useEffect(() => {
    const reload = () => {
      setFavorites(authStorage.getRadioFavorites());
      setRecent(authStorage.getRadioRecent());
    };
    const unsubscribe = authStorage.subscribe(reload);
    return unsubscribe;
  }, []);

  // 3D Globe Projection State
  const [centreLatitude, setCentreLatitude] = useState(selectedStation.latitude || 20);
  const [centreLongitude, setCentreLongitude] = useState(selectedStation.longitude || -30);
  const [globeScale, setGlobeScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const velocityRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });

  // GeoJSON countries
  const [geoFeatures, setGeoFeatures] = useState<any[]>([]);

  // Fetch GeoJSON countries on mount
  useEffect(() => {
    fetch('/countries.json')
      .then(res => res.json())
      .then(data => {
        if (data?.features) setGeoFeatures(data.features);
      })
      .catch(() => {});
  }, []);

  // Fetch dynamic stations from Radio Browser API
  useEffect(() => {
    fetch('https://de1.api.radio-browser.info/json/stations/topclick/60')
      .then(res => res.json())
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const parsed: RadioStation[] = data
            .filter(d => d.url_resolved || d.url)
            .map((d, idx) => {
              const code = (d.countrycode || 'US').toUpperCase();
              const coords = COUNTRY_COORDS[code] || [20 + ((idx * 7) % 60) - 30, ((idx * 17) % 360) - 180];
              return {
                uuid: d.stationuuid || `api-${idx}`,
                name: d.name || 'World Radio Station',
                url: d.url_resolved || d.url,
                country: d.country || 'Global',
                countrycode: code,
                codec: d.codec || 'MP3',
                bitrate: d.bitrate || 128,
                tags: d.tags || '',
                latitude: Number(d.geo_lat) || coords[0],
                longitude: Number(d.geo_long) || coords[1],
              };
            });

          // Combine with curated stations
          setStations(prev => {
            const uuids = new Set(prev.map(p => p.uuid));
            const newStations = parsed.filter(p => !uuids.has(p.uuid));
            return [...prev, ...newStations];
          });
        }
      })
      .catch(() => {});
  }, []);

  // Playback handling
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, selectedStation]);

  const playStation = useCallback((st: RadioStation) => {
    setSelectedStation(st);
    setIsPlaying(true);
    // Smoothly pan globe to station
    setCentreLatitude(st.latitude);
    setCentreLongitude(st.longitude);

    // Record in recent
    setRecent(prev => {
      const updated = [st.uuid, ...prev.filter(id => id !== st.uuid)].slice(0, 30);
      authStorage.saveRadioRecent(updated);
      return updated;
    });
  }, []);

  const toggleFavorite = (uuid: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      const exists = prev.includes(uuid);
      const updated = exists ? prev.filter(id => id !== uuid) : [...prev, uuid];
      authStorage.saveRadioFavorites(updated);
      return updated;
    });
  };

  const handleRandomTune = () => {
    const random = stations[Math.floor(Math.random() * stations.length)];
    if (random) playStation(random);
  };

  // 3D Orthographic Projection Math
  const project = useCallback((lat: number, lon: number, cLat: number, cLon: number) => {
    const rad = Math.PI / 180;
    const phi = lat * rad;
    const lambda = (((lon - cLon + 180) % 360) - 180) * rad;
    const phi0 = cLat * rad;

    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);
    const cosPhi0 = Math.cos(phi0);
    const sinPhi0 = Math.sin(phi0);

    return {
      x: cosPhi * Math.sin(lambda),
      y: cosPhi0 * sinPhi - sinPhi0 * cosPhi * Math.cos(lambda),
      z: sinPhi0 * sinPhi + cosPhi0 * cosPhi * Math.cos(lambda),
    };
  }, []);

  // Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const radius = Math.min(width, height) * 0.42 * globeScale;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // 1. Atmosphere Glow & Outer Ring
      const bgGrad = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius * 1.08);
      bgGrad.addColorStop(0, 'rgba(0, 163, 255, 0.08)');
      bgGrad.addColorStop(0.7, 'rgba(0, 163, 255, 0.02)');
      bgGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.08, 0, Math.PI * 2);
      ctx.fill();

      // 2. Base Sphere (Ocean Dark Blue/Black)
      const sphereGrad = ctx.createRadialGradient(
        cx - radius * 0.35,
        cy - radius * 0.35,
        radius * 0.1,
        cx,
        cy,
        radius
      );
      sphereGrad.addColorStop(0, '#1a222e');
      sphereGrad.addColorStop(0.65, '#0e131a');
      sphereGrad.addColorStop(1, '#06080b');

      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Sphere Outline Border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 3. Graticules (Latitude & Longitude Grid Lines)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 0.8;

      // Parallels (Latitudes)
      for (let lat = -60; lat <= 60; lat += 20) {
        ctx.beginPath();
        let first = true;
        for (let lon = -180; lon <= 180; lon += 5) {
          const pt = project(lat, lon, centreLatitude, centreLongitude);
          if (pt.z >= 0) {
            const sx = cx + pt.x * radius;
            const sy = cy - pt.y * radius;
            if (first) {
              ctx.moveTo(sx, sy);
              first = false;
            } else {
              ctx.lineTo(sx, sy);
            }
          } else {
            first = true;
          }
        }
        ctx.stroke();
      }

      // Meridians (Longitudes)
      for (let lon = -180; lon < 180; lon += 30) {
        ctx.beginPath();
        let first = true;
        for (let lat = -85; lat <= 85; lat += 5) {
          const pt = project(lat, lon, centreLatitude, centreLongitude);
          if (pt.z >= 0) {
            const sx = cx + pt.x * radius;
            const sy = cy - pt.y * radius;
            if (first) {
              ctx.moveTo(sx, sy);
              first = false;
            } else {
              ctx.lineTo(sx, sy);
            }
          } else {
            first = true;
          }
        }
        ctx.stroke();
      }

      // 4. Country Landmass Polygons
      const activeCode = selectedStation?.countrycode?.toUpperCase() || '';

      if (geoFeatures.length > 0) {
        for (let i = 0; i < geoFeatures.length; i++) {
          const feat = geoFeatures[i];
          const isSelectedCountry = feat.properties?.code?.toUpperCase() === activeCode;

          ctx.fillStyle = isSelectedCountry ? `${accentHex}35` : 'rgba(40, 52, 65, 0.85)';
          ctx.strokeStyle = isSelectedCountry ? accentHex : 'rgba(120, 138, 155, 0.35)';
          ctx.lineWidth = isSelectedCountry ? 1.5 : 0.6;

          const geom = feat.geometry;
          if (!geom) continue;

          const polygons = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;

          for (const poly of polygons) {
            for (const ring of poly) {
              ctx.beginPath();
              let started = false;
              for (let p = 0; p < ring.length; p++) {
                const [lon, lat] = ring[p];
                const pt = project(lat, lon, centreLatitude, centreLongitude);
                if (pt.z >= -0.05) {
                  const sx = cx + pt.x * radius;
                  const sy = cy - pt.y * radius;
                  if (!started) {
                    ctx.moveTo(sx, sy);
                    started = true;
                  } else {
                    ctx.lineTo(sx, sy);
                  }
                }
              }
              if (started) {
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
              }
            }
          }
        }
      }

      // 5. Radio Station Signal Beacons
      const timeNow = Date.now();
      for (const st of stations) {
        if (st.latitude === undefined || st.longitude === undefined) continue;
        const pt = project(st.latitude, st.longitude, centreLatitude, centreLongitude);
        if (pt.z > 0) {
          const sx = cx + pt.x * radius;
          const sy = cy - pt.y * radius;
          const isSelected = selectedStation?.uuid === st.uuid;

          if (isSelected) {
            // Animated Pulse Beacon
            const pulse = (timeNow % 1200) / 1200;
            ctx.beginPath();
            ctx.arc(sx, sy, 5 + pulse * 14, 0, Math.PI * 2);
            ctx.strokeStyle = `${accentHex}${Math.floor((1 - pulse) * 255).toString(16).padStart(2, '0')}`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Center Pin
            ctx.beginPath();
            ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.strokeStyle = accentHex;
            ctx.lineWidth = 2;
            ctx.stroke();
          } else {
            // Signal dot
            ctx.beginPath();
            ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(235, 240, 245, 0.9)';
            ctx.fill();
          }
        }
      }

      // Kinetic inertia deceleration
      if (!isDragging) {
        if (Math.abs(velocityRef.current.vx) > 0.01 || Math.abs(velocityRef.current.vy) > 0.01) {
          setCentreLongitude(lon => lon - velocityRef.current.vx);
          setCentreLatitude(lat => Math.max(-80, Math.min(80, lat + velocityRef.current.vy)));
          velocityRef.current.vx *= 0.92;
          velocityRef.current.vy *= 0.92;
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [centreLatitude, centreLongitude, globeScale, isDragging, geoFeatures, stations, selectedStation, accentHex, project]);

  // Mouse & Touch Interaction Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    velocityRef.current = { vx: 0, vy: 0 };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    const sensitivity = 0.28 / globeScale;
    const vx = dx * sensitivity;
    const vy = dy * sensitivity;

    velocityRef.current = { vx, vy };
    setCentreLongitude(lon => lon - vx);
    setCentreLatitude(lat => Math.max(-80, Math.min(80, lat + vy)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Canvas Click / Tap to Tune into nearby Station
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;
    const radius = Math.min(width, height) * 0.42 * globeScale;
    const cx = width / 2;
    const cy = height / 2;

    // Check if clicked near any station beacon
    let closestStation: RadioStation | null = null;
    let closestDist = 20; // 20px hit threshold

    for (const st of stations) {
      if (st.latitude === undefined || st.longitude === undefined) continue;
      const pt = project(st.latitude, st.longitude, centreLatitude, centreLongitude);
      if (pt.z > 0) {
        const sx = cx + pt.x * radius;
        const sy = cy - pt.y * radius;
        const dist = Math.hypot(clickX - sx, clickY - sy);
        if (dist < closestDist) {
          closestDist = dist;
          closestStation = st;
        }
      }
    }

    if (closestStation) {
      playStation(closestStation);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setGlobeScale(scale => Math.max(0.7, Math.min(3.5, scale * zoomFactor)));
  };

  // Filtered station list based on tab & query
  const filteredStations = useMemo(() => {
    let list = stations;

    if (mode === 'favorites') {
      list = list.filter(s => favorites.includes(s.uuid));
    } else if (mode === 'recent') {
      list = recent.map(id => stations.find(s => s.uuid === id)).filter(Boolean) as RadioStation[];
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.country.toLowerCase().includes(q) ||
          s.countrycode.toLowerCase().includes(q) ||
          (s.tags && s.tags.toLowerCase().includes(q))
      );
    }

    return list;
  }, [stations, mode, favorites, recent, searchQuery]);

  return (
    <div className="fixed inset-0 z-[120] bg-[#090a0c] text-white flex flex-col font-mono select-none animate-fadeIn">
      {/* Hidden Global Audio Element for Live Stream */}
      <audio ref={audioRef} src={selectedStation.url} preload="none" />

      {/* Top Header Navigation Bar */}
      <div className="flex items-center justify-between px-3 sm:px-8 py-2.5 sm:py-3.5 bg-[#0e1014] border-b border-white/10 flex-none z-20 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 flex-none">
          <div
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl flex-none"
            style={{ background: `${accentHex}25`, color: accentHex }}
          >
            <RadioIcon className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xs sm:text-lg font-black tracking-widest uppercase flex items-center gap-2">
              <span>RADIO ATLAS</span>
              <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                Live Signal
              </span>
            </h1>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Interactive 3D live radio globe · Tune stations worldwide
            </p>
          </div>
        </div>

        {/* Search, Random Tune, and Back Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          {/* Search Input Bar */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 sm:left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-28 xs:w-36 sm:w-64 rounded-xl bg-[#161a20] border border-white/10 pl-8 sm:pl-9 pr-2.5 sm:pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 font-sans"
            />
          </div>

          {/* Random Tune Button */}
          <button
            onClick={handleRandomTune}
            className="flex items-center justify-center h-8 sm:h-auto gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all active:scale-95 border border-white/10 flex-none"
            title="Tune a random station anywhere in the world [R]"
          >
            <Shuffle className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden md:inline">Random Tune</span>
          </button>

          {/* Close / Return Button */}
          <button
            onClick={onBack}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors flex-none"
            title="Return to Echora"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Workspace: 3D Globe (Left) + Stations & Player (Right) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Column: 3D Rotatable Canvas Globe */}
        <div className="flex-1 relative bg-[#06080b] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing min-h-[320px] md:min-h-0">
          <canvas
            ref={canvasRef}
            width={850}
            height={850}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleCanvasClick}
            onWheel={handleWheel}
            className="max-h-full max-w-full aspect-square p-2"
          />

          {/* Floating Zoom Controls */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 bg-[#13161c]/90 p-1.5 rounded-xl border border-white/10 backdrop-blur-md shadow-xl z-10">
            <button
              onClick={() => setGlobeScale(s => Math.min(3.5, s * 1.2))}
              className="p-2 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
              title="Zoom In"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={() => setGlobeScale(s => Math.max(0.7, s * 0.8))}
              className="p-2 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
              title="Zoom Out"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setGlobeScale(1);
                setCentreLatitude(selectedStation.latitude || 20);
                setCentreLongitude(selectedStation.longitude || -30);
              }}
              className="p-2 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
              title="Reset Globe Orientation"
            >
              <Compass className="h-4 w-4" />
            </button>
          </div>

          {/* Globe Bottom Status Bar */}
          <div className="absolute bottom-3 inset-x-3 sm:inset-x-8 flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-400 bg-[#0e1014]/80 backdrop-blur-md px-3.5 py-1.5 sm:py-2 rounded-xl border border-white/5 font-mono pointer-events-none z-10">
            <div className="flex items-center gap-1.5 sm:gap-2 truncate">
              <span className="font-bold text-white truncate max-w-[120px] sm:max-w-none">
                {selectedStation.country}
              </span>
              <span>·</span>
              <span className="text-zinc-400 hidden xs:inline truncate">Click any beacon to tune in</span>
            </div>
            <div className="flex items-center gap-2 flex-none">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{stations.length} radio signals</span>
            </div>
          </div>
        </div>

        {/* Right Column: Station Directory & Live Player Dock */}
        <div className="w-full md:w-[380px] lg:w-[420px] bg-[#0c0e12] border-t md:border-t-0 md:border-l border-white/10 flex flex-col flex-none h-[45vh] md:h-full z-10">
          {/* Directory Tabs */}
          <div className="flex items-center border-b border-white/10 px-4 pt-3 pb-2.5 gap-4 text-xs font-bold uppercase tracking-wider flex-none">
            {(['world', 'favorites', 'recent'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setMode(tab)}
                className={`py-1 relative transition-colors ${
                  mode === tab ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <span>{tab}</span>
                {mode === tab && (
                  <span
                    className="absolute -bottom-2.5 inset-x-0 h-0.5 rounded-full"
                    style={{ background: accentHex }}
                  />
                )}
              </button>
            ))}
            <span className="ml-auto text-[10px] text-zinc-500 font-mono">
              {filteredStations.length} stations
            </span>
          </div>

          {/* Station List */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-1.5">
            {filteredStations.length > 0 ? (
              filteredStations.map(st => {
                const isSelected = selectedStation.uuid === st.uuid;
                const isFav = favorites.includes(st.uuid);

                return (
                  <div
                    key={st.uuid}
                    onClick={() => playStation(st)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border group ${
                      isSelected
                        ? 'bg-white/15 border-white/30 text-white shadow-lg'
                        : 'bg-[#12151b] border-white/5 hover:border-white/15 text-zinc-300'
                    }`}
                    style={{
                      borderLeft: isSelected ? `4px solid ${accentHex}` : undefined,
                    }}
                  >
                    {/* Active Equalizer animation or radio icon */}
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/40 flex-none border border-white/10">
                      {isSelected && isPlaying ? (
                        <div className="flex items-end gap-0.5 h-4">
                          <span className="w-0.5 bg-emerald-400 animate-pulse h-3" />
                          <span className="w-0.5 bg-emerald-400 animate-bounce h-4" />
                          <span className="w-0.5 bg-emerald-400 animate-pulse h-2" />
                        </div>
                      ) : (
                        <RadioIcon className="h-4 w-4 text-zinc-400 group-hover:text-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-white truncate">
                        {st.name}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono mt-0.5">
                        <span className="font-bold text-zinc-300">{st.countrycode}</span>
                        <span>•</span>
                        <span>{st.codec}</span>
                        <span>•</span>
                        <span>{st.bitrate} kbps</span>
                      </div>
                    </div>

                    {/* Star Favorite Button */}
                    <button
                      onClick={e => toggleFavorite(st.uuid, e)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isFav
                          ? 'text-amber-400'
                          : 'text-zinc-500 hover:text-white hover:bg-white/10'
                      }`}
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star className={`h-4 w-4 ${isFav ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-xs text-zinc-500 font-mono">
                <GlobeIcon className="h-8 w-8 mb-2 text-zinc-600" />
                <p>No stations found matching "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-[11px] text-amber-400 underline"
                >
                  Clear search filter
                </button>
              </div>
            )}
          </div>

          {/* Bottom Audio Player Bar */}
          <div className="border-t border-white/10 p-4 bg-[#0a0c10] flex-none">
            <div className="flex items-center justify-between mb-2">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-xs font-bold text-white truncate">
                  {selectedStation.name}
                </p>
                <p className="text-[10px] text-zinc-400 font-mono">
                  {selectedStation.country} · {isPlaying ? 'Live Streaming' : 'Paused'}
                </p>
              </div>

              <button
                onClick={() => toggleFavorite(selectedStation.uuid)}
                className={`p-1.5 rounded-lg ${
                  favorites.includes(selectedStation.uuid)
                    ? 'text-amber-400'
                    : 'text-zinc-500 hover:text-white'
                }`}
              >
                <Star
                  className={`h-4 w-4 ${
                    favorites.includes(selectedStation.uuid) ? 'fill-amber-400' : ''
                  }`}
                />
              </button>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const idx = stations.findIndex(s => s.uuid === selectedStation.uuid);
                    if (idx > 0) playStation(stations[idx - 1]);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                  title="Previous station"
                >
                  <SkipBack className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white shadow-lg transition-transform active:scale-95"
                  style={{ background: accentHex }}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 fill-white" />
                  ) : (
                    <Play className="h-4 w-4 fill-white ml-0.5" />
                  )}
                </button>

                <button
                  onClick={() => setIsPlaying(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                  title="Stop playback"
                >
                  <Square className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => {
                    const idx = stations.findIndex(s => s.uuid === selectedStation.uuid);
                    if (idx >= 0 && idx + 1 < stations.length) playStation(stations[idx + 1]);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                  title="Next station"
                >
                  <SkipForward className="h-4 w-4" />
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-zinc-400 hover:text-white p-1"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-3.5 w-3.5" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={e => {
                    setVolume(Number(e.target.value));
                    setIsMuted(false);
                  }}
                  className="w-16 h-1 rounded bg-white/20 cursor-pointer"
                  style={{ accentColor: accentHex }}
                />
                <span className="text-[10px] text-zinc-400 font-mono w-7 text-right">
                  {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
