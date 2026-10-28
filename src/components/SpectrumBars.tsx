import React, { useEffect, useRef, HTMLAttributes } from 'react';

export type SpectrumPreset =
  | 'cyber-neon'
  | 'synth-sunset'
  | 'matrix-acid'
  | 'glacial-ice'
  | 'studio-white'
  | 'violet-pulse'
  | 'golden-hour'
  | 'electric-ember';

export interface SpectrumPresetConfig {
  name: string;
  gradient: [string, string]; // [bottom, top]
  peakColor?: string;
  glow?: number;
}

export const SPECTRUM_PRESETS: Record<SpectrumPreset, SpectrumPresetConfig> = {
  'cyber-neon': {
    name: 'Cyber Neon',
    gradient: ['#ff007f', '#00f0ff'],
    peakColor: '#ffffff',
    glow: 0.18,
  },
  'synth-sunset': {
    name: 'Synth Sunset',
    gradient: ['#ff0066', '#ffaa00'],
    peakColor: '#fff5ea',
    glow: 0.16,
  },
  'matrix-acid': {
    name: 'Matrix Acid',
    gradient: ['#006622', '#00ff88'],
    peakColor: '#e0ffe8',
    glow: 0.16,
  },
  'glacial-ice': {
    name: 'Glacial Ice',
    gradient: ['#0066cc', '#77e0ff'],
    peakColor: '#f0f9ff',
    glow: 0.15,
  },
  'studio-white': {
    name: 'Studio White',
    gradient: ['#444444', '#ffffff'],
    peakColor: '#ffffff',
    glow: 0.12,
  },
  'violet-pulse': {
    name: 'Violet Pulse',
    gradient: ['#7c3aed', '#ec4899'],
    peakColor: '#fdf4ff',
    glow: 0.18,
  },
  'golden-hour': {
    name: 'Golden Hour',
    gradient: ['#b45309', '#fde047'],
    peakColor: '#fefce8',
    glow: 0.16,
  },
  'electric-ember': {
    name: 'Electric Ember',
    gradient: ['#dc2626', '#f97316'],
    peakColor: '#fff1f2',
    glow: 0.18,
  },
};

export interface SpectrumBarsOptions {
  barCount?: number;
  gradient?: [string, string];
  peakColor?: string;
  bgColor?: string;
  gapRatio?: number;
  reflection?: boolean;
  reflectionAlpha?: number;
  peaks?: boolean;
  peakDecay?: number; // px per second
  glow?: number; // 0.0 for pure sharp vectors, 0.2 for subtle neon
  fftSize?: number;
  smoothing?: number;
}

/**
 * SpectrumBarsVisualizer class — Logarithmic 2048/4096-bin FFT,
 * smooth falling peak caps & floor reflection.
 * Zero external dependencies.
 */
export class SpectrumBarsVisualizer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  audioElement: HTMLAudioElement | null;
  audioProvider: { getFrequencyData: () => Uint8Array } | null;

  options: Required<SpectrumBarsOptions>;
  audioCtx: AudioContext | null = null;
  analyser: AnalyserNode | null = null;
  source: MediaElementAudioSourceNode | null = null;
  freqData: Uint8Array | null = null;

  peakHeights: Float32Array;
  bloomCanvas: HTMLCanvasElement;
  bloomCtx: CanvasRenderingContext2D | null;

  width = 0;
  height = 0;
  isRunning = false;
  lastTime = 0;
  isAudioPlaying = false;

  private handleResize: () => void;

  constructor(
    canvas: HTMLCanvasElement,
    audioElement: HTMLAudioElement | null = null,
    options: SpectrumBarsOptions = {},
    audioProvider: { getFrequencyData: () => Uint8Array } | null = null
  ) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not get 2d context for canvas');
    this.ctx = context;
    this.audioElement = audioElement;
    this.audioProvider = audioProvider;

    this.options = {
      barCount: options.barCount ?? 64,
      gradient: options.gradient ?? ['#ff007f', '#00f0ff'],
      peakColor: options.peakColor ?? '#ffffff',
      bgColor: options.bgColor ?? '#030712',
      gapRatio: options.gapRatio ?? 0.22,
      reflection: options.reflection ?? true,
      reflectionAlpha: options.reflectionAlpha ?? 0.22,
      peaks: options.peaks ?? true,
      peakDecay: options.peakDecay ?? 160,
      glow: options.glow ?? 0.15,
      fftSize: options.fftSize ?? 2048,
      smoothing: options.smoothing ?? 0.8,
    };

    this.peakHeights = new Float32Array(this.options.barCount);

    this.bloomCanvas = document.createElement('canvas');
    this.bloomCtx = this.bloomCanvas.getContext('2d');

    this.handleResize = this.resize.bind(this);
    window.addEventListener('resize', this.handleResize);
    this.resize();
  }

  initAudio() {
    if (this.audioCtx) return;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextClass) return;

      this.audioCtx = new AudioContextClass();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = this.options.fftSize;
      this.analyser.smoothingTimeConstant = this.options.smoothing;
      this.analyser.minDecibels = -90;
      this.analyser.maxDecibels = -25;

      this.freqData = new Uint8Array(this.analyser.frequencyBinCount);

      if (this.audioElement) {
        try {
          this.source = this.audioCtx.createMediaElementSource(
            this.audioElement
          );
          this.source.connect(this.analyser);
          this.analyser.connect(this.audioCtx.destination);
        } catch {
          // May already be connected or blocked
        }
      }
    } catch {
      // AudioContext unavailable
    }
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = this.canvas.clientWidth || window.innerWidth;
    this.height = this.canvas.clientHeight || window.innerHeight;

    this.canvas.width = Math.max(1, (this.width * dpr) | 0);
    this.canvas.height = Math.max(1, (this.height * dpr) | 0);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 1/4 resolution bloom helper
    if (this.bloomCanvas && this.bloomCtx) {
      this.bloomCanvas.width = Math.max(2, (this.canvas.width / 4) | 0);
      this.bloomCanvas.height = Math.max(2, (this.canvas.height / 4) | 0);
      this.bloomCtx.imageSmoothingEnabled = true;
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();

    const loop = (timestamp: number) => {
      if (!this.isRunning) return;
      const dt = Math.min(0.1, (timestamp - this.lastTime) * 0.001);
      this.lastTime = timestamp;

      this.render(dt);
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  stop() {
    this.isRunning = false;
  }

  render(dt: number) {
    if (
      this.audioCtx &&
      this.audioCtx.state === 'suspended' &&
      this.audioElement &&
      !this.audioElement.paused
    ) {
      this.audioCtx.resume().catch(() => {});
    }

    // Retrieve frequency data: prioritize audioProvider, then internal analyser
    let data: Uint8Array | null = null;
    if (this.audioProvider) {
      data = this.audioProvider.getFrequencyData();
    } else if (this.analyser) {
      if (!this.freqData) {
        this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
      }
      this.analyser.getByteFrequencyData(this.freqData as any);
      data = this.freqData;
    }

    const w = this.width;
    const h = this.height;
    const n = this.options.barCount;

    // 1. Clear background (matte dark)
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.fillStyle = this.options.bgColor;
    this.ctx.fillRect(0, 0, w, h);

    // 2. Bar geometry calculation
    const totalBarsWidth = w * 0.86;
    const barW = totalBarsWidth / n;
    const gap = Math.max(1, barW * this.options.gapRatio);
    const bwd = Math.max(1, barW - gap);
    const startX = (w - totalBarsWidth) * 0.5;
    const baseY = h * (this.options.reflection ? 0.72 : 0.88);
    const maxBarH = h * 0.44;

    this.ctx.globalCompositeOperation = 'lighter';

    // 3. Render logarithmic spectrum bars
    const dataLen = data ? data.length : 0;

    for (let i = 0; i < n; i++) {
      let val = 0;

      if (data && dataLen > 0) {
        // Logarithmic bin distribution (Neon Audio sampleBar formula)
        const lo = Math.pow(i / n, 1.8);
        const hi = Math.pow((i + 1) / n, 1.8);
        const a = (lo * dataLen) | 0;
        const b = Math.max(a + 1, (hi * dataLen) | 0);

        let sum = 0;
        let count = 0;
        for (let k = a; k < b && k < dataLen; k++) {
          sum += data[k];
          count++;
        }
        const raw = sum / (count || 1) / 255;
        // Exponential response curve
        val = Math.min(1, Math.pow(raw, 1.35) * 1.45);
      }

      // If audio is paused or silent, show subtle ambient harmonic breathing wave
      if (val < 0.01) {
        const t = performance.now() * 0.0025;
        const wave = Math.sin(t * 1.8 + i * 0.14) * 0.5 + 0.5;
        const bell = Math.sin((i / n) * Math.PI);
        val = Math.max(val, wave * 0.08 * bell);
      }

      const barH = Math.max(2, val * maxBarH);
      const x = startX + i * barW;
      const y = baseY - barH;

      // Peak cap ballistics (instant attack, smooth linear decay)
      if (barH > this.peakHeights[i]) {
        this.peakHeights[i] = barH;
      } else {
        this.peakHeights[i] = Math.max(
          0,
          this.peakHeights[i] - this.options.peakDecay * dt
        );
      }

      // Bar Body Gradient
      const grad = this.ctx.createLinearGradient(x, baseY, x, y);
      grad.addColorStop(0, this.options.gradient[0]);
      grad.addColorStop(1, this.options.gradient[1]);

      this.ctx.fillStyle = grad;
      this.ctx.fillRect(x, y, bwd, barH);

      // Floor Reflection
      if (this.options.reflection && barH > 1) {
        this.ctx.globalAlpha = this.options.reflectionAlpha;
        this.ctx.fillStyle = this.options.gradient[1];
        this.ctx.fillRect(x, baseY + 4, bwd, barH * 0.28);
        this.ctx.globalAlpha = 1.0;
      }

      // Floating Peak Cap Line
      if (this.options.peaks && this.peakHeights[i] > 2) {
        this.ctx.fillStyle = this.options.peakColor;
        this.ctx.fillRect(x, baseY - this.peakHeights[i] - 2, bwd, 1.5);
      }
    }

    // 4. Subtle, controlled bloom pass (Multiply C^2 bright-pass)
    if (this.options.glow > 0.02 && this.bloomCtx) {
      this.applyBloom(w, h);
    }
  }

  applyBloom(w: number, h: number) {
    if (!this.bloomCtx) return;
    const bw = this.bloomCanvas.width;
    const bh = this.bloomCanvas.height;
    if (bw < 2 || bh < 2) return;

    // 1/4 resolution downsample
    this.bloomCtx.globalCompositeOperation = 'source-over';
    this.bloomCtx.drawImage(this.canvas, 0, 0, bw, bh);

    // Multiply layer by itself to isolate peaks
    this.bloomCtx.globalCompositeOperation = 'multiply';
    this.bloomCtx.drawImage(this.bloomCanvas, 0, 0);

    // Blit onto main canvas at calibrated alpha
    this.ctx.globalCompositeOperation = 'lighter';
    this.ctx.globalAlpha = this.options.glow;
    this.ctx.drawImage(this.bloomCanvas, 0, 0, w, h);
    this.ctx.globalAlpha = 1.0;
  }

  setGradient(bottomColor: string, topColor: string) {
    this.options.gradient = [bottomColor, topColor];
  }

  setGlow(amount: number) {
    this.options.glow = amount;
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this.handleResize);
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
    }
  }
}

export interface SpectrumBarsProps extends HTMLAttributes<HTMLDivElement> {
  preset?: SpectrumPreset;
  barCount?: number;
  gradient?: [string, string];
  peakColor?: string;
  bgColor?: string;
  gapRatio?: number;
  reflection?: boolean;
  reflectionAlpha?: number;
  peaks?: boolean;
  peakDecay?: number;
  glow?: number;
  audioProvider?: { getFrequencyData: () => Uint8Array } | null;
  audioElement?: HTMLAudioElement | null;
  isAudioPlaying?: boolean;
}

/**
 * SpectrumBars React Component wrapper
 */
export const SpectrumBars: React.FC<SpectrumBarsProps> = ({
  preset = 'cyber-neon',
  barCount = 64,
  gradient,
  peakColor,
  bgColor = '#030712',
  gapRatio = 0.22,
  reflection = true,
  reflectionAlpha = 0.22,
  peaks = true,
  peakDecay = 160,
  glow,
  audioProvider = null,
  audioElement = null,
  isAudioPlaying = false,
  className = '',
  style,
  ...rest
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visualizerRef = useRef<SpectrumBarsVisualizer | null>(null);

  // Resolve preset overrides
  const activePreset = SPECTRUM_PRESETS[preset] || SPECTRUM_PRESETS['cyber-neon'];
  const resolvedGradient = gradient ?? activePreset.gradient;
  const resolvedPeakColor = peakColor ?? activePreset.peakColor ?? '#ffffff';
  const resolvedGlow = glow ?? activePreset.glow ?? 0.16;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const visualizer = new SpectrumBarsVisualizer(
      canvas,
      audioElement,
      {
        barCount,
        gradient: resolvedGradient,
        peakColor: resolvedPeakColor,
        bgColor,
        gapRatio,
        reflection,
        reflectionAlpha,
        peaks,
        peakDecay,
        glow: resolvedGlow,
      },
      audioProvider
    );

    visualizerRef.current = visualizer;
    visualizer.isAudioPlaying = isAudioPlaying;
    visualizer.start();

    // Auto-init audio if audioElement is passed and playing
    if (audioElement && !audioElement.paused) {
      visualizer.initAudio();
    }

    return () => {
      visualizer.destroy();
      visualizerRef.current = null;
    };
  }, []);

  // Update dynamic properties on the fly without restarting
  useEffect(() => {
    const v = visualizerRef.current;
    if (!v) return;
    v.options.gradient = resolvedGradient;
    v.options.peakColor = resolvedPeakColor;
    v.options.glow = resolvedGlow;
    v.options.bgColor = bgColor;
    v.options.barCount = barCount;
    v.options.reflection = reflection;
    v.options.peaks = peaks;
    v.audioProvider = audioProvider;
    v.isAudioPlaying = isAudioPlaying;
  }, [
    resolvedGradient,
    resolvedPeakColor,
    resolvedGlow,
    bgColor,
    barCount,
    reflection,
    peaks,
    audioProvider,
    isAudioPlaying,
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden ${className}`.trim()}
      style={style}
      {...rest}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full"
        aria-hidden="true"
      />
    </div>
  );
};

export default SpectrumBars;
