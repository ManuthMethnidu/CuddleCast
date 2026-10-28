/**
 * SpectrumBars.js — Exact Neon Audio Spectrum Visualizer
 * Logarithmic 4096-bin FFT, smooth falling peak caps & floor reflection.
 * Zero external dependencies.
 */
export class SpectrumBars {
  constructor(canvas, audioElement, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.audioElement = audioElement;

    // Configurable options
    this.options = Object.assign({
      barCount: 64,
      gradient: ['#ff007f', '#00f0ff'], // [bottom, top]
      peakColor: '#ffffff',
      bgColor: '#050608',
      gapRatio: 0.22,
      reflection: true,
      reflectionAlpha: 0.22,
      peaks: true,
      peakDecay: 160,       // px per second
      glow: 0.15,           // 0.0 for pure sharp vectors, 0.2 for subtle neon
      fftSize: 2048,
      smoothing: 0.80
    }, options);

    // Audio API nodes
    this.audioCtx = null;
    this.analyser = null;
    this.source = null;
    this.freqData = null;

    // Peak ballistics array
    this.peakHeights = new Float32Array(this.options.barCount);

    // Downscaled canvas for subtle bloom pass
    this.bloomCanvas = document.createElement('canvas');
    this.bloomCtx = this.bloomCanvas.getContext('2d');

    this.isRunning = false;
    this.lastTime = 0;

    this.handleResize = this.resize.bind(this);
    window.addEventListener('resize', this.handleResize);
    this.resize();
  }

  /**
   * Initializes the Web Audio API on first user interaction
   */
  initAudio() {
    if (this.audioCtx) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContextClass();

    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = this.options.fftSize;
    this.analyser.smoothingTimeConstant = this.options.smoothing;
    this.analyser.minDecibels = -90;
    this.analyser.maxDecibels = -25;

    this.freqData = new Uint8Array(this.analyser.frequencyBinCount);

    if (this.audioElement) {
      this.source = this.audioCtx.createMediaElementSource(this.audioElement);
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
    }
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = this.canvas.clientWidth || window.innerWidth;
    this.height = this.canvas.clientHeight || window.innerHeight;

    this.canvas.width = (this.width * dpr) | 0;
    this.canvas.height = (this.height * dpr) | 0;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 1/4 resolution bloom helper
    this.bloomCanvas.width = Math.max(2, (this.canvas.width / 4) | 0);
    this.bloomCanvas.height = Math.max(2, (this.canvas.height / 4) | 0);
    this.bloomCtx.imageSmoothingEnabled = true;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();

    const loop = (timestamp) => {
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

  render(dt) {
    // Resume audio context if the browser suspended it
    if (this.audioCtx && this.audioCtx.state === 'suspended' && this.audioElement && !this.audioElement.paused) {
      this.audioCtx.resume();
    }

    if (this.analyser && this.freqData) {
      this.analyser.getByteFrequencyData(this.freqData);
    }

    const w = this.width;
    const h = this.height;
    const n = this.options.barCount;

    // 1. Clear background (matte dark)
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.fillStyle = this.options.bgColor;
    this.ctx.fillRect(0, 0, w, h);

    // 2. Bar geometry calculation
    const totalBarsWidth = w * 0.84;
    const barW = totalBarsWidth / n;
    const gap = Math.max(1, barW * this.options.gapRatio);
    const bwd = Math.max(1, barW - gap);
    const startX = (w - totalBarsWidth) * 0.5;
    const baseY = h * (this.options.reflection ? 0.72 : 0.88);
    const maxBarH = h * 0.44;

    this.ctx.globalCompositeOperation = 'lighter';

    // 3. Render logarithmic spectrum bars
    for (let i = 0; i < n; i++) {
      let val = 0;

      if (this.freqData) {
        // Logarithmic bin distribution (Neon Audio sampleBar formula)
        const lo = Math.pow(i / n, 1.8);
        const hi = Math.pow((i + 1) / n, 1.8);
        const a = (lo * this.freqData.length) | 0;
        const b = Math.max(a + 1, (hi * this.freqData.length) | 0);

        let sum = 0, count = 0;
        for (let k = a; k < b && k < this.freqData.length; k++) {
          sum += this.freqData[k];
          count++;
        }
        const raw = (sum / (count || 1)) / 255;
        // Exponential response curve
        val = Math.min(1, Math.pow(raw, 1.35) * 1.45);
      }

      const barH = val * maxBarH;
      const x = startX + i * barW;
      const y = baseY - barH;

      // Peak cap ballistics (instant attack, smooth linear decay)
      if (barH > this.peakHeights[i]) {
        this.peakHeights[i] = barH;
      } else {
        this.peakHeights[i] = Math.max(0, this.peakHeights[i] - this.options.peakDecay * dt);
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
    if (this.options.glow > 0.02) {
      this.applyBloom(w, h);
    }
  }

  applyBloom(w, h) {
    const bw = this.bloomCanvas.width;
    const bh = this.bloomCanvas.height;
    if (bw < 2) return;

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

  setGradient(bottomColor, topColor) {
    this.options.gradient = [bottomColor, topColor];
  }

  setGlow(amount) {
    this.options.glow = parseFloat(amount);
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this.handleResize);
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
    }
  }
}
