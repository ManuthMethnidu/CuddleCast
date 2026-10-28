import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Play,
  Pause,
  Compass,
  Volume2,
  VolumeX,
  Radio,
  Heart,
  BarChart3,
  Sun,
  Activity,
  Sparkles,
  Grid3X3,
  Disc3,
} from 'lucide-react';
import * as THREE from 'three';
import { Visualizer, AudioAnalyzer } from 'waviz';
import { useRadioStore, ScreensaverTheme, getGlobalRadioAudio } from '../store/radioStore';
import { useSettingsStore } from '../store/settingsStore';
import { useAccent } from '../context/AccentContext';
import { authStorage } from '../services/storage';

interface VisualizerVariant {
  id: ScreensaverTheme;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const VISUALIZER_VARIANTS: VisualizerVariant[] = [
  { id: 'particula', label: 'Particula 3D', icon: Sparkles },
  { id: 'waviz-bars', label: 'Waviz Bars', icon: BarChart3 },
  { id: 'waviz-waves', label: 'Waviz Waves', icon: Activity },
  { id: 'waviz-polar', label: 'Waviz Polar', icon: Sun },
  { id: 'waviz-dots', label: 'Waviz Dots', icon: Grid3X3 },
  { id: 'waviz-mixed', label: 'Waviz Mixed', icon: Disc3 },
];

// Perlin / Simplex 3D Noise generator adapted from Humprt/particula
function createParticulaNoise() {
  const p = new Array(256).fill(0).map((_, i) => i);
  const perm = new Array(512);

  for (let i = p.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255];
  }

  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (t: number, a: number, b: number) => a + t * (b - a);
  const grad = (hash: number, x: number, y: number, z: number) => {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  };

  return {
    noise3D(x: number, y: number, z: number) {
      const X = Math.floor(x) & 255;
      const Y = Math.floor(y) & 255;
      const Z = Math.floor(z) & 255;

      x -= Math.floor(x);
      y -= Math.floor(y);
      z -= Math.floor(z);

      const u = fade(x);
      const v = fade(y);
      const w = fade(z);

      const A = perm[X] + Y;
      const AA = perm[A] + Z;
      const AB = perm[A + 1] + Z;
      const B = perm[X + 1] + Y;
      const BA = perm[B] + Z;
      const BB = perm[B + 1] + Z;

      return lerp(
        w,
        lerp(
          v,
          lerp(u, grad(perm[AA], x, y, z), grad(perm[BA], x - 1, y, z)),
          lerp(u, grad(perm[AB], x, y - 1, z), grad(perm[BB], x - 1, y - 1, z))
        ),
        lerp(
          v,
          lerp(u, grad(perm[AA + 1], x, y, z - 1), grad(perm[BA + 1], x - 1, y, z - 1)),
          lerp(u, grad(perm[AB + 1], x, y - 1, z - 1), grad(perm[BB + 1], x - 1, y - 1, z - 1))
        )
      );
    },
  };
}

// Global persistent Web Audio bridge for Radio stream analysis
let sharedAudioCtx: AudioContext | null = null;
let sharedAnalyser: AnalyserNode | null = null;
let sharedSourceNode: MediaElementAudioSourceNode | null = null;
let isAudioConnected = false;

function initSharedAudioBridge(audioEl: HTMLAudioElement) {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!sharedAudioCtx && AudioContextClass) {
      sharedAudioCtx = new AudioContextClass();
    }
    if (sharedAudioCtx && !sharedAnalyser) {
      sharedAnalyser = sharedAudioCtx.createAnalyser();
      sharedAnalyser.fftSize = 2048;
      sharedAnalyser.smoothingTimeConstant = 0.82;
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    if (sharedAudioCtx && sharedAnalyser && audioEl && !isAudioConnected) {
      try {
        sharedSourceNode = sharedAudioCtx.createMediaElementSource(audioEl);
        sharedSourceNode.connect(sharedAnalyser);
        sharedAnalyser.connect(sharedAudioCtx.destination);
        isAudioConnected = true;
      } catch {
        // Can throw if already connected or blocked by browser media security
      }
    }
  } catch {
    // Graceful fallback to procedural synthesis
  }
}

// Resilient Audio Bridge implementing AudioAnalyzer from waviz
class ResilientAudioBridge extends AudioAnalyzer {
  private freqArray: Uint8Array = new Uint8Array(1024);
  private timeArray: Uint8Array = new Uint8Array(1024);

  override get freqData(): any {
    return this.getFrequencyData();
  }

  override get timeData(): any {
    return this.getTimeDomainData();
  }

  override getFrequencyData(): any {
    const radio = useRadioStore.getState();
    const isPlaying = radio.isPlaying && !radio.isLoadingStream && !radio.isMuted && radio.volume > 0;
    const vol = isPlaying ? radio.volume : 0;

    let hasRealAudio = false;
    if (sharedAnalyser) {
      sharedAnalyser.getByteFrequencyData(this.freqArray as any);
      let sum = 0;
      for (let i = 0; i < 40; i++) {
        sum += this.freqArray[i];
      }
      if (sum > 10) {
        hasRealAudio = true;
      }
    }

    if (!hasRealAudio) {
      // Synthesize rhythmic harmonic frequencies matching active stream volume
      const t = performance.now() * 0.003;
      const beatPulse = isPlaying ? Math.pow(Math.max(0, Math.sin(t * 2.8)), 3) : 0;

      for (let i = 0; i < 1024; i++) {
        if (!isPlaying) {
          this.freqArray[i] = 0;
          continue;
        }
        const freqRatio = i / 1024;
        const decay = Math.exp(-freqRatio * 6);
        const subBass = i < 20 ? beatPulse * 220 : 0;
        const midHarmonic = Math.sin(t * 3.5 + i * 0.18) * 45 + 50;
        const shimmer = Math.cos(t * 7.2 + i * 0.45) * 30;
        const val = Math.min(255, Math.max(0, (subBass + (midHarmonic + shimmer) * decay) * vol));
        this.freqArray[i] = Math.round(val);
      }
    }
    return this.freqArray;
  }

  override getTimeDomainData(): any {
    const radio = useRadioStore.getState();
    const isPlaying = radio.isPlaying && !radio.isLoadingStream && !radio.isMuted && radio.volume > 0;
    const vol = isPlaying ? radio.volume : 0;

    let hasRealAudio = false;
    if (sharedAnalyser) {
      sharedAnalyser.getByteTimeDomainData(this.timeArray as any);
      let variance = 0;
      for (let i = 0; i < 40; i++) {
        variance += Math.abs(this.timeArray[i] - 128);
      }
      if (variance > 10) {
        hasRealAudio = true;
      }
    }

    if (!hasRealAudio) {
      const t = performance.now() * 0.005;
      for (let i = 0; i < 1024; i++) {
        if (!isPlaying) {
          this.timeArray[i] = 128;
          continue;
        }
        const wave =
          Math.sin(t * 4 + i * 0.08) * 0.6 +
          Math.sin(t * 8 + i * 0.15) * 0.3 +
          Math.cos(t * 12 + i * 0.25) * 0.1;
        const amp = wave * 64 * vol;
        this.timeArray[i] = Math.min(255, Math.max(0, Math.round(128 + amp)));
      }
    }
    return this.timeArray;
  }
}

export const RadioScreensaver: React.FC = () => {
  const {
    currentStation,
    isPlaying,
    isScreensaverOpen,
    screensaverTheme,
    volume,
    isMuted,
    setScreensaverOpen,
    setScreensaverTheme,
    togglePlay,
    wander,
    setVolume,
    toggleMute,
  } = useRadioStore();

  const performanceMode = useSettingsStore((s) => s.performanceMode);
  const { accentHex } = useAccent();

  const particulaCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const wavizCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isFavorited, setIsFavorited] = useState(false);
  const [clock, setClock] = useState('');
  const [currentFps, setCurrentFps] = useState(60);

  // Initialize Audio Bridge
  useEffect(() => {
    if (!isScreensaverOpen) return;
    const audio = getGlobalRadioAudio();
    if (audio) {
      initSharedAudioBridge(audio);
    }
  }, [isScreensaverOpen]);

  // Live Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync favorites
  useEffect(() => {
    if (!currentStation) return;
    const favs = authStorage.getRadioFavorites();
    setIsFavorited(favs.includes(currentStation.stationuuid));
  }, [currentStation]);

  // Keyboard shortcut (ESC to exit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isScreensaverOpen) {
        setScreensaverOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isScreensaverOpen, setScreensaverOpen]);

  // ==========================================
  // 1. PARTICULA 3D SCREENSAVER
  // (Humprt/particula 5-Sphere Turbulence Engine)
  // Supports WebGL (Three.js) + Universal 2D Canvas Projection Fallback
  // ==========================================
  useEffect(() => {
    if (!isScreensaverOpen || screensaverTheme !== 'particula') return;
    const canvas = particulaCanvasRef.current;
    if (!canvas) return;

    let animId: number;
    let isDisposed = false;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const noise = createParticulaNoise();
    const audioBridge = new ResilientAudioBridge();

    // Check if WebGL context can be initialized
    let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
    try {
      gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as
        | WebGLRenderingContext
        | WebGL2RenderingContext
        | null;
    } catch {
      gl = null;
    }

    const sphereConfigs = [
      {
        minFreq: 20,
        maxFreq: 80,
        radius: 1.05,
        inner: 0.28,
        colorStart: '#ff0077',
        colorEnd: '#7928ca',
        particleCount: performanceMode === 'low' ? 2500 : performanceMode === 'medium' ? 4500 : 7500,
        particleSize: 0.0045,
        turbulence: 0.005,
        noiseScale: 3.5,
        speed: 0.1,
        beatThreshold: 170,
        beatStrength: 0.016,
        enabled: true,
      },
      {
        minFreq: 120,
        maxFreq: 250,
        radius: 1.35,
        inner: 0.35,
        colorStart: '#ff5e00',
        colorEnd: '#ff0077',
        particleCount: performanceMode === 'low' ? 1800 : performanceMode === 'medium' ? 3200 : 5500,
        particleSize: 0.004,
        turbulence: 0.006,
        noiseScale: 4.2,
        speed: 0.12,
        beatThreshold: 180,
        beatStrength: 0.014,
        enabled: true,
      },
      {
        minFreq: 250,
        maxFreq: 800,
        radius: 1.65,
        inner: 0.42,
        colorStart: '#00e5ff',
        colorEnd: '#7928ca',
        particleCount: performanceMode === 'low' ? 1200 : performanceMode === 'medium' ? 2200 : 4000,
        particleSize: 0.0035,
        turbulence: 0.007,
        noiseScale: 4.8,
        speed: 0.14,
        beatThreshold: 190,
        beatStrength: 0.012,
        enabled: true,
      },
      {
        minFreq: 1000,
        maxFreq: 4000,
        radius: 1.95,
        inner: 0.5,
        colorStart: '#00ff88',
        colorEnd: '#00b4d8',
        particleCount: performanceMode === 'low' ? 0 : performanceMode === 'medium' ? 1500 : 3000,
        particleSize: 0.003,
        turbulence: 0.008,
        noiseScale: 5.6,
        speed: 0.16,
        beatThreshold: 200,
        beatStrength: 0.01,
        enabled: performanceMode !== 'low',
      },
      {
        minFreq: 5000,
        maxFreq: 10000,
        radius: 2.25,
        inner: 0.58,
        colorStart: '#ffea00',
        colorEnd: '#ff0055',
        particleCount: performanceMode === 'low' ? 0 : performanceMode === 'medium' ? 1000 : 2500,
        particleSize: 0.0028,
        turbulence: 0.009,
        noiseScale: 6.4,
        speed: 0.18,
        beatThreshold: 210,
        beatStrength: 0.008,
        enabled: performanceMode === 'high',
      },
    ];

    const beatManager = {
      currentWaveRadius: 0,
      waveStrength: 0,
      isWaveActive: false,
      triggerWave(energy: number) {
        const energyExcess = Math.max(0, energy - 170);
        this.waveStrength = (energyExcess / 85) * 16.0;
        this.currentWaveRadius = 0.05;
        this.isWaveActive = true;
      },
      update(deltaTime: number) {
        if (this.isWaveActive) {
          this.currentWaveRadius += deltaTime * 1.6;
          this.waveStrength *= 0.95;
          if (this.currentWaveRadius > 2.6 || this.waveStrength < 0.08) {
            this.isWaveActive = false;
          }
        }
      },
    };

    if (gl) {
      // ==========================================
      // PATH A: FULL THREE.JS WEBGL RENDERER
      // ==========================================
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x030712);
      scene.fog = new THREE.Fog(new THREE.Color(0x030712), 2.2, 4.2);

      const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 2.45;

      let renderer: THREE.WebGLRenderer | null = null;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          context: gl,
          antialias: performanceMode !== 'low',
          alpha: false,
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x030712, 1);
      } catch {
        // Fallback handled below
      }

      if (renderer) {
        const handleResize = () => {
          if (!renderer || isDisposed) return;
          const w = window.innerWidth;
          const h = window.innerHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        interface ParticulaSphere {
          geometry: THREE.BufferGeometry;
          material: THREE.PointsMaterial;
          particleSystem: THREE.Points;
          positions: Float32Array;
          colors: Float32Array;
          velocities: Float32Array;
          lifetimes: Float32Array;
          beatEffects: Float32Array;
          config: (typeof sphereConfigs)[0];
          energyHistory: number[];
          lastPeakTime: number;
        }

        const spheres: ParticulaSphere[] = [];

        sphereConfigs.forEach((cfg) => {
          if (!cfg.enabled || cfg.particleCount <= 0) return;

          const pc = cfg.particleCount;
          const geometry = new THREE.BufferGeometry();
          const positions = new Float32Array(pc * 3);
          const colors = new Float32Array(pc * 3);
          const velocities = new Float32Array(pc * 3);
          const lifetimes = new Float32Array(pc);
          const beatEffects = new Float32Array(pc);

          const color1 = new THREE.Color(cfg.colorStart);
          const color2 = new THREE.Color(cfg.colorEnd);

          for (let i = 0; i < pc; i++) {
            const i3 = i * 3;
            const radius = THREE.MathUtils.lerp(0, cfg.radius, cfg.inner);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = Math.cbrt(Math.random()) * radius;

            positions[i3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = r * Math.cos(phi);

            velocities[i3] = 0;
            velocities[i3 + 1] = 0;
            velocities[i3 + 2] = 0;

            lifetimes[i] = Math.random() * 3.5;
            beatEffects[i] = 0;

            const t = i / pc;
            colors[i3] = color1.r * (1 - t) + color2.r * t;
            colors[i3 + 1] = color1.g * (1 - t) + color2.g * t;
            colors[i3 + 2] = color1.b * (1 - t) + color2.b * t;
          }

          geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

          const material = new THREE.PointsMaterial({
            size: cfg.particleSize,
            vertexColors: true,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            fog: true,
          });

          const particleSystem = new THREE.Points(geometry, material);
          scene.add(particleSystem);

          spheres.push({
            geometry,
            material,
            particleSystem,
            positions,
            colors,
            velocities,
            lifetimes,
            beatEffects,
            config: cfg,
            energyHistory: [],
            lastPeakTime: 0,
          });
        });

        let lastTime = performance.now();
        let frameCount = 0;
        let fpsTimer = performance.now();

        const animateParticula = (now: number) => {
          if (isDisposed || !renderer) return;
          animId = requestAnimationFrame(animateParticula);

          const deltaTime = Math.min(0.06, (now - lastTime) / 1000);
          lastTime = now;

          frameCount++;
          if (now - fpsTimer >= 1000) {
            setCurrentFps(Math.round((frameCount * 1000) / (now - fpsTimer)));
            frameCount = 0;
            fpsTimer = now;
          }

          beatManager.update(deltaTime);

          const frequencies = audioBridge.getFrequencyData();
          const binCount = frequencies.length;
          const sampleRate = 44100;

          spheres.forEach((sphere) => {
            const { geometry, positions, velocities, lifetimes, beatEffects, config } = sphere;
            const pc = config.particleCount;

            const minBin = Math.max(0, Math.floor((config.minFreq / (sampleRate / 2)) * binCount));
            const maxBin = Math.min(binCount - 1, Math.ceil((config.maxFreq / (sampleRate / 2)) * binCount));
            let bandSum = 0;
            let count = 0;
            for (let b = minBin; b <= maxBin; b++) {
              bandSum += frequencies[b];
              count++;
            }
            const bandEnergy = count > 0 ? bandSum / count : 0;

            sphere.energyHistory.push(bandEnergy);
            if (sphere.energyHistory.length > 30) {
              sphere.energyHistory.shift();
            }
            const avgEnergy =
              sphere.energyHistory.reduce((a, b) => a + b, 0) / sphere.energyHistory.length;
            const isPeak = bandEnergy > avgEnergy * 1.15 && now - sphere.lastPeakTime > 180;
            if (isPeak) {
              sphere.lastPeakTime = now;
            }

            const isBeat = bandEnergy > config.beatThreshold;
            if (isBeat && !beatManager.isWaveActive && config.beatStrength > 0) {
              beatManager.triggerWave(bandEnergy);
            }

            const ns = config.noiseScale;
            const speed = config.speed;
            const timeFactor = now * 0.001;

            for (let i = 0; i < pc; i++) {
              const i3 = i * 3;
              let x = positions[i3];
              let y = positions[i3 + 1];
              let z = positions[i3 + 2];

              let vx = velocities[i3];
              let vy = velocities[i3 + 1];
              let vz = velocities[i3 + 2];

              let lt = lifetimes[i] - deltaTime;
              let be = beatEffects[i];

              const nx = noise.noise3D(x * ns + timeFactor * speed, y * ns, z * ns);
              const ny = noise.noise3D(x * ns, y * ns + timeFactor * speed, z * ns);
              const nz = noise.noise3D(x * ns, y * ns, z * ns + timeFactor * speed);

              vx += nx * config.turbulence;
              vy += ny * config.turbulence;
              vz += nz * config.turbulence;

              if (isBeat) {
                be = 1.0;
              }
              be *= 0.94;

              if (be > 0.02) {
                const dist = Math.sqrt(x * x + y * y + z * z);
                if (dist > 0.001) {
                  const push = be * config.beatStrength;
                  vx += (x / dist) * push;
                  vy += (y / dist) * push;
                  vz += (z / dist) * push;
                }
              }

              x += vx;
              y += vy;
              z += vz;

              vx *= 0.98;
              vy *= 0.98;
              vz *= 0.98;

              const currentDist = Math.sqrt(x * x + y * y + z * z);
              if (currentDist > config.radius) {
                const overflow = currentDist - config.radius;
                const pull = overflow * 0.12;
                x -= (x / currentDist) * pull;
                y -= (y / currentDist) * pull;
                z -= (z / currentDist) * pull;
                vx *= 0.9;
                vy *= 0.9;
                vz *= 0.9;
              }

              if (lt <= 0) {
                const radius = THREE.MathUtils.lerp(0, config.radius, config.inner);
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                const r = Math.cbrt(Math.random()) * radius;

                x = r * Math.sin(phi) * Math.cos(theta);
                y = r * Math.sin(phi) * Math.sin(theta);
                z = r * Math.cos(phi);

                vx = 0;
                vy = 0;
                vz = 0;
                lt = Math.random() * 3.5;
                be = 0;
              }

              positions[i3] = x;
              positions[i3 + 1] = y;
              positions[i3 + 2] = z;

              velocities[i3] = vx;
              velocities[i3 + 1] = vy;
              velocities[i3 + 2] = vz;

              lifetimes[i] = lt;
              beatEffects[i] = be;
            }

            geometry.attributes.position.needsUpdate = true;

            const rotSpeed = 0.002 + (bandEnergy / 255) * 0.015;
            sphere.particleSystem.rotation.y += rotSpeed;
            sphere.particleSystem.rotation.x += rotSpeed * 0.35;
          });

          camera.position.x = Math.sin(now * 0.0004) * 0.15;
          camera.position.y = Math.cos(now * 0.0005) * 0.12;
          camera.lookAt(0, 0, 0);

          renderer.render(scene, camera);
        };

        animId = requestAnimationFrame(animateParticula);

        return () => {
          isDisposed = true;
          cancelAnimationFrame(animId);
          window.removeEventListener('resize', handleResize);

          spheres.forEach((s) => {
            scene.remove(s.particleSystem);
            s.geometry.dispose();
            s.material.dispose();
          });

          if (renderer) {
            renderer.dispose();
          }
        };
      }
    }

    // ==========================================
    // PATH B: 2D CANVAS 3D PROJECTION FALLBACK
    // (Used if WebGL unavailable in headless or environment)
    // ==========================================
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    interface FallbackParticle {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      lt: number;
      color: string;
      radius: number;
      inner: number;
    }

    const fallbackParticles: FallbackParticle[] = [];
    sphereConfigs.forEach((cfg) => {
      if (!cfg.enabled) return;
      const count = Math.min(cfg.particleCount, 800);
      for (let i = 0; i < count; i++) {
        const radius = cfg.radius * cfg.inner;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = Math.cbrt(Math.random()) * radius;
        fallbackParticles.push({
          x: r * Math.sin(phi) * Math.cos(theta),
          y: r * Math.sin(phi) * Math.sin(theta),
          z: r * Math.cos(phi),
          vx: 0,
          vy: 0,
          vz: 0,
          lt: Math.random() * 3.5,
          color: i % 2 === 0 ? cfg.colorStart : cfg.colorEnd,
          radius: cfg.radius,
          inner: cfg.inner,
        });
      }
    });

    let angleY = 0;
    const render2DFallback = () => {
      if (isDisposed) return;
      animId = requestAnimationFrame(render2DFallback);

      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, w, h);

      angleY += 0.008;
      const cosA = Math.cos(angleY);
      const sinA = Math.sin(angleY);

      fallbackParticles.forEach((p) => {
        p.lt -= 0.016;
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        if (p.lt <= 0) {
          const r = Math.random() * p.radius * p.inner;
          const theta = Math.random() * Math.PI * 2;
          p.x = r * Math.cos(theta);
          p.y = r * Math.sin(theta);
          p.z = (Math.random() - 0.5) * p.radius;
          p.lt = Math.random() * 3.5;
        }

        // Rotate around Y axis
        const rx = p.x * cosA - p.z * sinA;
        const rz = p.x * sinA + p.z * cosA;

        // Perspective projection
        const cameraZ = 2.4;
        const fov = 420;
        const scale = fov / (rz + cameraZ);
        if (scale > 0) {
          const px = w / 2 + rx * scale;
          const py = h / 2 + p.y * scale;
          const size = Math.max(1.2, scale * 0.012);

          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    };

    animId = requestAnimationFrame(render2DFallback);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
    };
  }, [isScreensaverOpen, screensaverTheme, performanceMode]);

  // ==========================================
  // 2. WAVIZ AUDIO VISUALIZERS (npm install waviz)
  // (Bars, Waves, Polar, Dots, Mixed)
  // ==========================================
  useEffect(() => {
    if (!isScreensaverOpen || screensaverTheme === 'particula') return;
    const canvas = wavizCanvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const audioBridge = new ResilientAudioBridge();
    // Instantiate Waviz Visualizer with our resilient audio bridge subclass
    const visualizer = new Visualizer(canvas, audioBridge as any);

    let options: any;
    if (screensaverTheme === 'waviz-bars') {
      const barWidth = Math.max(6, Math.floor(canvas.width / 54));
      options = {
        domain: ['freq', 240, 128],
        coord: ['rect'],
        viz: ['bars', 54],
        color: ['linearGradient', accentHex, '#38bdf8', 'horizontal'],
        stroke: [barWidth],
      };
    } else if (screensaverTheme === 'waviz-waves') {
      options = [
        {
          domain: ['time', 220, 512, 'hann'],
          coord: ['rect'],
          viz: ['line', 256],
          color: ['linearGradient', accentHex, '#c084fc', 'horizontal'],
          stroke: [4],
        },
        {
          domain: ['time', 140, 512, 'hamming'],
          coord: ['rect'],
          viz: ['line', 128],
          color: ['#38bdf8'],
          stroke: [2, 'dashes'],
        },
      ];
    } else if (screensaverTheme === 'waviz-polar') {
      const radius = Math.min(canvas.width, canvas.height) * 0.22;
      options = [
        {
          domain: ['freq', 180, 256],
          coord: ['polar', radius, 0, 0.4],
          viz: ['bars', 72],
          color: ['radialGradient', accentHex, '#ec4899', radius * 0.6, radius * 1.8],
          stroke: [4],
        },
        {
          domain: ['time', 90, 256],
          coord: ['polar', radius, 0, -0.25],
          viz: ['line', 160],
          color: ['#38bdf8'],
          stroke: [2],
        },
      ];
    } else if (screensaverTheme === 'waviz-dots') {
      options = {
        domain: ['time', 180, 512, 'bharris'],
        coord: ['rect'],
        viz: ['dots', 110],
        color: ['randomPalette', [accentHex, '#38bdf8', '#a855f7', '#ec4899', '#10b981']],
        stroke: [5],
      };
    } else if (screensaverTheme === 'waviz-mixed') {
      const radius = Math.min(canvas.width, canvas.height) * 0.2;
      options = [
        {
          domain: ['time', 200, 256],
          coord: ['polar', radius, 0, 0.35],
          viz: ['bars', 90],
          color: ['randomPalette', [accentHex, '#38bdf8', '#a855f7', '#06b6d4']],
          stroke: [3, 'dashes'],
        },
        {
          domain: ['time', 100, 256],
          coord: ['polar', radius * 0.6, 0, -0.4],
          viz: ['particles', [1.4, 1.4], 0, 30, 3, 60],
          color: ['randomPalette', ['#ec4899', '#f43f5e', '#8b5cf6', accentHex]],
          stroke: [2],
        },
        {
          domain: ['freq', 130, 128],
          coord: ['polar', radius * 1.25, 0, 0.15],
          viz: ['line', 96],
          color: ['#06b6d4'],
          stroke: [2],
        },
      ];
    }

    visualizer.render(options);

    return () => {
      visualizer.stop();
      window.removeEventListener('resize', handleResize);
    };
  }, [isScreensaverOpen, screensaverTheme, accentHex]);

  if (!isScreensaverOpen) return null;

  const handleToggleFav = () => {
    if (!currentStation) return;
    const favs = authStorage.getRadioFavorites();
    const isFav = favs.includes(currentStation.stationuuid);
    const updated = isFav
      ? favs.filter((id) => id !== currentStation.stationuuid)
      : [...favs, currentStation.stationuuid];
    authStorage.saveRadioFavorites(updated);
    setIsFavorited(!isFav);
  };

  return (
    <div
      className="fixed inset-0 z-[1000] text-white select-none flex flex-col justify-between overflow-hidden animate-in fade-in duration-300"
      style={{ backgroundColor: '#030712' }}
    >
      {/* 1. Particula 3D WebGL Canvas */}
      <canvas
        ref={particulaCanvasRef}
        className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500 ${
          screensaverTheme === 'particula' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* 2. Waviz Canvas */}
      <canvas
        ref={wavizCanvasRef}
        className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500 ${
          screensaverTheme !== 'particula' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Top Bar: Visualizer Switcher & Controls */}
      <div className="relative z-10 flex flex-wrap items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/85 via-black/40 to-transparent gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-mono text-zinc-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">AUDIO SCREENSAVER</span>
          </div>

          {/* Visualizer Theme Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 shadow-xl text-xs overflow-x-auto no-scrollbar">
            {VISUALIZER_VARIANTS.map((v) => {
              const Icon = v.icon;
              const isActive = screensaverTheme === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setScreensaverTheme(v.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-white/20 text-white font-semibold shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  style={isActive ? { borderColor: `${accentHex}60` } : {}}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{v.label}</span>
                </button>
              );
            })}
          </div>

          {/* Performance tag & FPS */}
          <span className="hidden lg:inline-block px-2.5 py-1 rounded-full text-[10px] uppercase font-mono tracking-wider bg-white/5 text-zinc-400 border border-white/10">
            {screensaverTheme === 'particula'
              ? `Particula 3D • ${currentFps} FPS`
              : `Waviz Engine • ${performanceMode}`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-zinc-400 hidden sm:inline">{clock}</span>
          <button
            onClick={() => setScreensaverOpen(false)}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-200 hover:text-white backdrop-blur-md border border-white/10 transition-transform active:scale-95 shadow-xl"
            title="Exit Screensaver (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center: Live Station Card Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center p-4 max-w-xl mx-auto w-full pointer-events-auto">
        {currentStation ? (
          <div className="w-full p-5 sm:p-7 rounded-3xl bg-[#0a0f1d]/75 backdrop-blur-2xl border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.85)] text-center flex flex-col items-center gap-3.5">
            {/* Station Icon */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center shadow-lg">
              {currentStation.favicon ? (
                <img
                  src={currentStation.favicon}
                  alt={currentStation.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <Radio className="w-8 h-8 text-zinc-400" />
              )}
            </div>

            {/* Station Details */}
            <div className="flex flex-col items-center gap-1">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white max-w-md truncate">
                {currentStation.name}
              </h2>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400">
                <span>{currentStation.country}</span>
                {currentStation.state && <span>• {currentStation.state}</span>}
                {currentStation.codec && (
                  <span className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px] text-zinc-300">
                    {currentStation.codec} {currentStation.bitrate > 0 ? `${currentStation.bitrate}k` : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Interactive Player Buttons */}
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={handleToggleFav}
                className={`p-3 rounded-full border transition-all ${
                  isFavorited
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                    : 'bg-white/10 border-white/10 text-zinc-300 hover:text-white hover:bg-white/20'
                }`}
                title={isFavorited ? 'Remove Favorite' : 'Save Favorite'}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-500' : ''}`} />
              </button>

              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-xl"
                style={{ backgroundColor: accentHex }}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white fill-white" />
                ) : (
                  <Play className="w-6 h-6 text-white fill-white ml-1" />
                )}
              </button>

              <button
                onClick={wander}
                className="p-3 rounded-full bg-white/10 border border-white/10 text-zinc-300 hover:text-cyan-300 hover:bg-white/20 transition-all"
                title="Wander to Random Station"
              >
                <Compass className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-[#0a0f1d]/75 backdrop-blur-2xl border border-white/15 text-center flex flex-col items-center gap-3">
            <Radio className="w-12 h-12 text-zinc-400 animate-bounce" />
            <p className="text-zinc-300 text-sm">No radio station currently active.</p>
            <button
              onClick={wander}
              className="px-4 py-2 rounded-full font-medium text-sm text-white flex items-center gap-2"
              style={{ backgroundColor: accentHex }}
            >
              <Compass className="w-4 h-4" />
              <span>Wander Planet & Play</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Bar: Volume and Instructions */}
      <div className="relative z-10 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            className="p-2 rounded-full text-zinc-400 hover:text-white bg-white/10 hover:bg-white/20 transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-zinc-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-white" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 sm:w-32 h-1.5 accent-blue-500 cursor-pointer"
            style={{ accentColor: accentHex }}
          />
        </div>

        <div className="text-xs text-zinc-400 flex items-center gap-2">
          <span>Particula 3D & Waviz Screensavers</span>
          <span className="hidden sm:inline text-zinc-500">
            • Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">Esc</kbd> to return
          </span>
        </div>
      </div>
    </div>
  );
};
