'use client';

import { useEffect, useRef, type CSSProperties, type HTMLAttributes } from 'react';

export type FluxLinesFlow = 'up' | 'down' | 'left' | 'right';

export type FluxLinesPreset =
  | 'classic'
  | 'ember'
  | 'glacier'
  | 'neon'
  | 'aurora'
  | 'storm'
  | 'solar'
  | 'calm';

export const FLUX_PRESETS: Record<
  FluxLinesPreset,
  {
    colors: string[];
    speed: number;
    scale: number;
    turbulence: number;
    fluidity: number;
    rimWidth: number;
    sharpness: number;
    shimmer: number;
    glow: number;
    lineWidth: number;
    flowDirection: FluxLinesFlow;
  }
> = {
  classic: {
    colors: ['#ffffff', '#e4e4e7', '#a1a1aa'],
    speed: 0.55,
    scale: 1.6,
    turbulence: 1.0,
    fluidity: 0.12,
    rimWidth: 0.22,
    sharpness: 2.5,
    shimmer: 1.5,
    glow: 2.2,
    lineWidth: 1.0,
    flowDirection: 'down',
  },
  ember: {
    colors: ['#ffd29a', '#ff8a4c', '#ff3b30', '#ffb36b'],
    speed: 0.65,
    scale: 1.5,
    turbulence: 1.3,
    fluidity: 0.15,
    rimWidth: 0.24,
    sharpness: 2.2,
    shimmer: 1.8,
    glow: 2.6,
    lineWidth: 1.1,
    flowDirection: 'down',
  },
  glacier: {
    colors: ['#e3f3ff', '#7cc4ff', '#38bdf8', '#ffffff'],
    speed: 0.5,
    scale: 1.7,
    turbulence: 0.9,
    fluidity: 0.1,
    rimWidth: 0.2,
    sharpness: 2.6,
    shimmer: 1.6,
    glow: 2.4,
    lineWidth: 1.0,
    flowDirection: 'down',
  },
  neon: {
    colors: ['#f43f5e', '#ec4899', '#a855f7', '#06b6d4'],
    speed: 0.75,
    scale: 1.4,
    turbulence: 1.4,
    fluidity: 0.18,
    rimWidth: 0.26,
    sharpness: 2.0,
    shimmer: 2.0,
    glow: 3.0,
    lineWidth: 1.2,
    flowDirection: 'down',
  },
  aurora: {
    colors: ['#34d399', '#10b981', '#06b6d4', '#8b5cf6'],
    speed: 0.6,
    scale: 1.6,
    turbulence: 1.2,
    fluidity: 0.14,
    rimWidth: 0.22,
    sharpness: 2.4,
    shimmer: 1.7,
    glow: 2.5,
    lineWidth: 1.0,
    flowDirection: 'down',
  },
  storm: {
    colors: ['#a78bfa', '#6366f1', '#38bdf8', '#ffffff'],
    speed: 1.1,
    scale: 1.3,
    turbulence: 1.9,
    fluidity: 0.2,
    rimWidth: 0.28,
    sharpness: 2.0,
    shimmer: 2.2,
    glow: 2.8,
    lineWidth: 1.3,
    flowDirection: 'down',
  },
  solar: {
    colors: ['#fef08a', '#facc15', '#fb923c', '#ea580c'],
    speed: 0.8,
    scale: 1.5,
    turbulence: 1.5,
    fluidity: 0.16,
    rimWidth: 0.25,
    sharpness: 2.1,
    shimmer: 1.9,
    glow: 2.7,
    lineWidth: 1.1,
    flowDirection: 'down',
  },
  calm: {
    colors: ['#c4b5fd', '#818cf8', '#60a5fa'],
    speed: 0.35,
    scale: 1.8,
    turbulence: 0.65,
    fluidity: 0.08,
    rimWidth: 0.18,
    sharpness: 2.8,
    shimmer: 1.1,
    glow: 1.8,
    lineWidth: 0.9,
    flowDirection: 'down',
  },
};

export interface FluxLinesProps extends HTMLAttributes<HTMLDivElement> {
  preset?: FluxLinesPreset;
  colors?: string[];
  speed?: number;
  scale?: number;
  turbulence?: number;
  fluidity?: number;
  rimWidth?: number;
  sharpness?: number;
  shimmer?: number;
  glow?: number;
  lineWidth?: number;
  flowDirection?: FluxLinesFlow;
  opacity?: number;
  mouseInteraction?: boolean;
  mouseStrength?: number;
  mouseRadius?: number;
  mouseDampening?: number;
  clickSwirl?: boolean;
  intro?: boolean;
  lightMode?: boolean;
  transparent?: boolean;
  backgroundColor?: string;
  paused?: boolean;
  dpr?: number;
  mixBlendMode?: CSSProperties['mixBlendMode'];
  audioProvider?: { getFrequencyData: () => Uint8Array } | null;
  isAudioPlaying?: boolean;
}

type Settings = {
  colors: string[];
  speed: number;
  scale: number;
  turbulence: number;
  fluidity: number;
  rimWidth: number;
  sharpness: number;
  shimmer: number;
  glow: number;
  lineWidth: number;
  flow: number[];
  opacity: number;
  mouseInteraction: boolean;
  mouseStrength: number;
  mouseRadius: number;
  mouseDampening: number;
  clickSwirl: boolean;
  intro: boolean;
  lightMode: boolean;
  transparent: boolean;
  backgroundColor?: string;
  paused: boolean;
  dpr?: number;
};

type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };

const MAX_COLORS = 8;
const INTRO_SECONDS = 1.4;
const FLOW: Record<string, number[]> = { up: [0, 1], down: [0, -1], left: [-1, 0], right: [1, 0] };

const VERTEX = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FIELD = `
float hash(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.zyx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float smin(float a, float b, float k) {
  float r = exp2(-a / k) + exp2(-b / k);
  return -k * log2(r);
}

float sinlerp(float a, float b, float w) {
  return mix(a, b, (sin(w * 3.14159265 - 3.14159265 / 2.0) + 1.0) / 2.0);
}

float vn(vec2 p, float s, float seed) {
  vec2 cellp = floor(p / s);
  vec2 relp = mod(p, s);
  float g1 = hash(vec3(cellp, seed));
  float g2 = hash(vec3(cellp.x + 1.0, cellp.y, seed));
  float g3 = hash(vec3(cellp.x + 1.0, cellp.y + 1.0, seed));
  float g4 = hash(vec3(cellp.x, cellp.y + 1.0, seed));
  float bx = sinlerp(g1, g2, relp.x / s);
  float tx = sinlerp(g4, g3, relp.x / s);
  return sinlerp(bx, tx, relp.y / s);
}

float dbn(vec2 p, float s, float seed) {
  float o = s / 2.0;
  float n0 = vn(p, s, seed);
  float n1 = vn(p + vec2(o, o), s, seed + 0.1);
  float n2 = vn(p + vec2(-o, o), s, seed + 0.2);
  float n3 = vn(p + vec2(o, -o), s, seed + 0.3);
  float n4 = vn(p + vec2(-o, -o), s, seed + 0.4);
  return (2.0 * n0 + 1.5 * n1 + 1.25 * n2 + 1.125 * n3 + n4) / 7.0;
}
`;

const FRAGMENT = `#version 300 es
precision highp float;
precision highp int;
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uFlow;
uniform float uSpeed;
uniform float uScale;
uniform float uTurbulence;
uniform float uFluidity;
uniform float uRimWidth;
uniform float uSharpness;
uniform float uShimmer;
uniform float uGlow;
uniform float uLine;
uniform float uMaxHalf;
uniform vec3 uColors[${MAX_COLORS}];
uniform int uColorCount;
uniform vec4 uMagnet;
uniform vec4 uSwirl;
uniform float uReveal;
uniform float uLight;
uniform float uOpaque;
uniform vec3 uBackground;
uniform float uOpacity;
out vec4 outColor;
${FIELD}

vec3 palette(float h) {
  float x = clamp(h, 0.0, 1.0) * float(uColorCount - 1);
  int i = int(floor(x));
  int j = min(i + 1, uColorCount - 1);
  return mix(uColors[i], uColors[j], smoothstep(0.0, 1.0, x - float(i)));
}

void main() {
  float ref = 700.0 / max(uScale, 0.05);
  vec2 frag = gl_FragCoord.xy;
  vec2 toMagnet = (frag - uMagnet.xy) / uResolution.y;
  float pull = uMagnet.z * exp(-dot(toMagnet, toMagnet) / (uMagnet.w * uMagnet.w));
  if (pull > 0.001) {
    float angle = pull * 0.55;
    float c = cos(angle);
    float s = sin(angle);
    frag = uMagnet.xy + mat2(c, s, -s, c) * (frag - uMagnet.xy);
  }
  if (uSwirl.w > 0.0) {
    vec2 d = frag - uSwirl.xy;
    float reach = uSwirl.z;
    float angle = uSwirl.w * exp(-dot(d, d) / (reach * reach));
    float c = cos(angle);
    float s = sin(angle);
    frag = uSwirl.xy + mat2(c, s, -s, c) * d;
  }
  vec2 p = frag / uResolution.y * ref;

  float spd = 200.0 * uSpeed;
  float t = uTime;
  vec2 dir = uFlow;
  vec2 perp = vec2(-dir.y, dir.x);
  float distort1 = vn(p + perp * (t * spd), 60.0, 10.0) * 50.0 * uTurbulence;
  float distort2 = vn(p - perp * (t * spd), 120.0, 15.0) * 100.0 * uTurbulence;
  float peaks = dbn(p + distort1 + dir * (t * spd * 0.5), 40.0, 1.0);
  float peaks2 = dbn(p + distort2 - dir * (t * spd * 0.5), 40.0, 0.0);
  float field = smin(peaks, peaks2, max(uFluidity, 0.001));

  float slope = length(vec2(dFdx(field), dFdy(field)));
  float gap = abs(field - 0.4);
  float pixels = gap / max(slope, 1e-6);
  float halfBand = max(uRimWidth, 0.001) * 0.5;
  float across = max(gap / halfBand, pixels / uMaxHalf);
  float band = 5.0 * uRimWidth * (1.0 - across);
  float reveal = smoothstep(0.2, 0.85, pull);
  float shimmer = vn(p + dir * (t * spd * 0.5), 60.0, 12.0) * uShimmer * (1.0 - reveal * 0.75);
  float lit = clamp(band - shimmer, 0.0, 1.0);
  float glow = pow(lit, uSharpness) * uGlow * (1.0 + reveal * 0.25);
  float core = uLine > 0.0 ? smoothstep(uLine + 0.75, uLine - 0.75, pixels) * max(smoothstep(0.08, 0.6, glow), reveal) : 0.0;
  float shine = clamp(glow, 0.0, 1.0);
  float energy = max(shine * shine, core * 0.85) * uReveal;

  float h = clamp(0.5 + (peaks - peaks2) * 0.8, 0.0, 1.0);
  vec3 tint = palette(h);

  if (uLight > 0.5) {
    float chroma = max(tint.r, max(tint.g, tint.b)) - min(tint.r, min(tint.g, tint.b));
    vec3 ink = mix(vec3(0.07, 0.07, 0.08), tint * 0.55, clamp(chroma * 1.6, 0.0, 1.0));
    float cover = energy * uOpacity;
    outColor = uOpaque > 0.5 ? vec4(mix(uBackground, ink, cover), 1.0) : vec4(ink * cover, cover);
    return;
  }

  vec3 light = tint * energy * uOpacity;
  outColor = uOpaque > 0.5 ? vec4(uBackground + light, 1.0) : vec4(light, max(light.r, max(light.g, light.b)));
}`;

const parseColor = (
  value: string | undefined,
  fallback: [number, number, number]
): [number, number, number] => {
  if (!value) return fallback;
  const str = String(value).trim();
  if (str.startsWith('#')) {
    let hex = str.slice(1);
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length === 6) {
      const num = parseInt(hex, 16);
      return [
        ((num >> 16) & 255) / 255,
        ((num >> 8) & 255) / 255,
        (num & 255) / 255,
      ];
    }
  }
  const rgbMatch = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbMatch) {
    return [
      parseInt(rgbMatch[1], 10) / 255,
      parseInt(rgbMatch[2], 10) / 255,
      parseInt(rgbMatch[3], 10) / 255,
    ];
  }
  return fallback;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  console.error('[FluxLines] Shader compile error:', gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
};

const link = (gl: WebGL2RenderingContext): Program | null => {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) {
    console.error('[FluxLines] Shader compilation failed');
    return null;
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.bindAttribLocation(program, 0, 'aPosition');
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('[FluxLines] Program link error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(program, i);
    if (info) uniforms[info.name.replace('[0]', '')] = gl.getUniformLocation(program, info.name);
  }
  return { program, uniforms };
};

export const FluxLines = ({
  preset = 'classic',
  colors,
  speed,
  scale,
  turbulence,
  fluidity,
  rimWidth,
  sharpness,
  shimmer,
  glow,
  lineWidth,
  flowDirection,
  opacity = 1,
  mouseInteraction = true,
  mouseStrength = 1,
  mouseRadius = 0.35,
  mouseDampening = 0.15,
  clickSwirl = true,
  intro = false,
  lightMode = false,
  transparent = false,
  backgroundColor = '#030712',
  paused = false,
  dpr,
  mixBlendMode,
  className = '',
  style,
  audioProvider = null,
  isAudioPlaying = false,
  ...rest
}: FluxLinesProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wakeRef = useRef<(() => void) | null>(null);

  // Resolve preset overrides
  const activePreset = FLUX_PRESETS[preset] || FLUX_PRESETS.classic;

  const resolvedColors =
    colors && colors.length > 0 ? colors : activePreset.colors;
  const resolvedSpeed = speed ?? activePreset.speed;
  const resolvedScale = scale ?? activePreset.scale;
  const resolvedTurbulence = turbulence ?? activePreset.turbulence;
  const resolvedFluidity = fluidity ?? activePreset.fluidity;
  const resolvedRimWidth = rimWidth ?? activePreset.rimWidth;
  const resolvedSharpness = sharpness ?? activePreset.sharpness;
  const resolvedShimmer = shimmer ?? activePreset.shimmer;
  const resolvedGlow = glow ?? activePreset.glow;
  const resolvedLineWidth = lineWidth ?? activePreset.lineWidth;
  const resolvedFlowDirection = flowDirection ?? activePreset.flowDirection;

  const settings: Settings = {
    colors:
      Array.isArray(resolvedColors) && resolvedColors.length
        ? resolvedColors.slice(0, MAX_COLORS)
        : ['#ffffff'],
    speed: resolvedSpeed,
    scale: Math.max(0.05, resolvedScale),
    turbulence: resolvedTurbulence,
    fluidity: Math.max(0.001, resolvedFluidity),
    rimWidth: Math.max(0.001, resolvedRimWidth),
    sharpness: Math.max(0.1, resolvedSharpness),
    shimmer: Math.max(0, resolvedShimmer),
    glow: Math.max(0, resolvedGlow),
    lineWidth: Math.max(0, resolvedLineWidth),
    flow: FLOW[resolvedFlowDirection] ?? FLOW.down,
    opacity: clamp(opacity, 0, 1),
    mouseInteraction,
    mouseStrength: Math.max(0, mouseStrength),
    mouseRadius: Math.max(0.01, mouseRadius),
    mouseDampening: Math.max(0, mouseDampening),
    clickSwirl,
    intro,
    lightMode,
    transparent,
    backgroundColor,
    paused,
    dpr,
  };

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const audioRef = useRef({ audioProvider, isAudioPlaying });
  audioRef.current = { audioProvider, isAudioPlaying };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
    });
    if (!container || !canvas || !gl) return undefined;

    const program = link(gl);
    if (!program) return undefined;
    const u = program.uniforms;

    const buffer = gl.createBuffer();
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const palette = new Float32Array(MAX_COLORS * 3);

    const reduce =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const pointer = { x: 0, y: 0, inside: false };
    const magnet = { x: 0, y: 0, active: 0 };
    const swirl = { x: 0, y: 0, age: 10 };
    let time = 0;
    let reveal = settingsRef.current.intro && !reduce ? 0 : 1;
    let raf = 0;
    let last = 0;
    let visible = true;

    // Audio reactivity smoothing variables
    let smoothBass = 0;
    let smoothMids = 0;
    let smoothTreble = 0;
    let smoothEnergy = 0;
    let prevBass = 0;

    const render = () => {
      const s = settingsRef.current;
      const ratio = canvas.width / Math.max(1, container.clientWidth);
      s.colors.forEach((value, index) =>
        palette.set(parseColor(value, [1, 1, 1]), index * 3)
      );
      const introVal = Math.min(1, reveal);

      // Dynamically modulated audio parameters
      const dynamicSpeed =
        s.speed * (1.0 + smoothEnergy * 1.6 + smoothBass * 0.9);
      const dynamicTurbulence =
        s.turbulence * (1.0 + smoothBass * 0.85 + smoothMids * 0.4);
      const dynamicFluidity =
        s.fluidity * (1.0 + smoothBass * 0.75);
      const dynamicGlow =
        s.glow * (1.0 + smoothTreble * 1.35 + smoothEnergy * 0.7);
      const dynamicShimmer =
        s.shimmer * (1.0 + smoothTreble * 1.5 + smoothMids * 0.5);
      const dynamicRim =
        s.rimWidth * (1.0 + smoothBass * 0.45);
      const dynamicLine =
        s.lineWidth * (1.0 + smoothBass * 0.35) * ratio * 0.5;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program.program);
      gl.bindVertexArray(vao);
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);
      gl.uniform1f(u.uTime, time);
      gl.uniform2f(u.uFlow, s.flow[0], s.flow[1]);
      gl.uniform1f(u.uSpeed, dynamicSpeed);
      gl.uniform1f(u.uScale, s.scale);
      gl.uniform1f(u.uTurbulence, dynamicTurbulence);
      gl.uniform1f(u.uFluidity, dynamicFluidity);
      gl.uniform1f(u.uRimWidth, dynamicRim);
      gl.uniform1f(u.uSharpness, s.sharpness);
      gl.uniform1f(u.uShimmer, dynamicShimmer);
      gl.uniform1f(u.uGlow, dynamicGlow);
      gl.uniform1f(u.uLine, dynamicLine);
      gl.uniform1f(u.uMaxHalf, 28 * ratio);
      gl.uniform3fv(u.uColors, palette);
      gl.uniform1i(u.uColorCount, s.colors.length);
      gl.uniform4f(
        u.uMagnet,
        magnet.x,
        magnet.y,
        magnet.active * s.mouseStrength,
        s.mouseRadius
      );
      const age = swirl.age;
      const twist =
        1.9 * Math.min(1, age / 0.23) * Math.exp(-Math.max(0, age - 0.23) * 1.1);
      gl.uniform4f(
        u.uSwirl,
        swirl.x,
        swirl.y,
        canvas.height * 0.22 * (1 + age * 0.5),
        age < 6 ? twist : 0
      );
      gl.uniform1f(u.uReveal, introVal * introVal * (3 - 2 * introVal));
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);
      gl.uniform1f(u.uOpaque, s.transparent ? 0 : 1);
      gl.uniform3fv(
        u.uBackground,
        parseColor(
          s.backgroundColor,
          s.lightMode ? [1, 1, 1] : [0.012, 0.027, 0.071]
        )
      );
      gl.uniform1f(u.uOpacity, s.opacity);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const frame = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      const s = settingsRef.current;
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;
      last = now;

      // Read audio data and smooth
      const { audioProvider: prov, isAudioPlaying: playing } = audioRef.current;
      let rawBass = 0;
      let rawMids = 0;
      let rawTreble = 0;
      let rawEnergy = 0;

      if (prov && playing) {
        const freq = prov.getFrequencyData();
        if (freq && freq.length > 0) {
          // Bass range: bins 0 - 8 (~20 - 200 Hz)
          let bSum = 0;
          const bLen = Math.min(8, freq.length);
          for (let i = 0; i < bLen; i++) bSum += freq[i];
          rawBass = bSum / bLen / 255;

          // Mids range: bins 9 - 32 (~200 - 2000 Hz)
          let mSum = 0;
          const mEnd = Math.min(33, freq.length);
          for (let i = 9; i < mEnd; i++) mSum += freq[i];
          rawMids = mSum / Math.max(1, mEnd - 9) / 255;

          // Treble range: bins 33 - 120 (~2000 - 8000 Hz)
          let tSum = 0;
          const tEnd = Math.min(120, freq.length);
          for (let i = 33; i < tEnd; i++) tSum += freq[i];
          rawTreble = tSum / Math.max(1, tEnd - 33) / 255;

          rawEnergy = rawBass * 0.5 + rawMids * 0.3 + rawTreble * 0.2;
        }
      }

      // Smooth envelope followers
      const bassLerp = rawBass > smoothBass ? 0.3 : 0.08;
      smoothBass += (rawBass - smoothBass) * bassLerp;

      const midsLerp = rawMids > smoothMids ? 0.22 : 0.08;
      smoothMids += (rawMids - smoothMids) * midsLerp;

      const trebleLerp = rawTreble > smoothTreble ? 0.32 : 0.1;
      smoothTreble += (rawTreble - smoothTreble) * trebleLerp;

      const energyLerp = rawEnergy > smoothEnergy ? 0.25 : 0.08;
      smoothEnergy += (rawEnergy - smoothEnergy) * energyLerp;

      // Audio beat transient detection -> subtle magnetic swirl trigger on heavy drop
      const bassDelta = rawBass - prevBass;
      prevBass = rawBass;
      if (bassDelta > 0.24 && rawBass > 0.45 && swirl.age > 1.2) {
        swirl.x = canvas.width * (0.35 + Math.random() * 0.3);
        swirl.y = canvas.height * (0.35 + Math.random() * 0.3);
        swirl.age = 0;
      }

      const motion = s.paused || reduce ? 0 : 1;
      time += dt * motion;
      swirl.age += dt;
      if (s.intro && !reduce && reveal < 1)
        reveal = Math.min(1, reveal + dt / INTRO_SECONDS);
      else if (!s.intro || reduce) reveal = 1;

      const engaged = s.mouseInteraction && pointer.inside;
      const follow =
        s.mouseDampening > 0 ? 1 - Math.exp(-dt / s.mouseDampening) : 1;
      if (engaged) {
        magnet.x += (pointer.x - magnet.x) * follow;
        magnet.y += (pointer.y - magnet.y) * follow;
      }
      const target = engaged ? 1 : 0;
      magnet.active += (target - magnet.active) * (1 - Math.exp(-dt / 0.3));
      if (Math.abs(target - magnet.active) < 0.001) magnet.active = target;

      render();
      const busy =
        motion > 0 ||
        magnet.active !== target ||
        reveal < 1 ||
        swirl.age < 6 ||
        smoothEnergy > 0.01;
      if (busy) raf = requestAnimationFrame(frame);
      else last = 0;
    };

    const wake = () => {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const resize = () => {
      const s = settingsRef.current;
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      const ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      render();
      wake();
    };

    const locate = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const ratio = canvas.width / Math.max(1, rect.width);
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      pointer.x = x * ratio;
      pointer.y = (rect.height - y) * ratio;
    };

    const onPointerMove = (event: PointerEvent) => {
      const wasInside = pointer.inside;
      locate(event);
      if (pointer.inside && !wasInside && magnet.active < 0.05) {
        magnet.x = pointer.x;
        magnet.y = pointer.y;
      }
      wake();
    };

    const onPointerDown = (event: PointerEvent) => {
      onPointerMove(event);
      if (!pointer.inside || !settingsRef.current.clickSwirl || reduce) return;
      swirl.x = pointer.x;
      swirl.y = pointer.y;
      swirl.age = 0;
      wake();
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') pointer.inside = false;
    };

    const onPointerLeave = () => {
      pointer.inside = false;
    };

    const onVisibility = () => {
      last = 0;
      wake();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const intersection = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible) {
        last = 0;
        wake();
      }
    });
    intersection.observe(container);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerUp, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibility);
    resize();

    let lastDpr = settingsRef.current.dpr;
    wakeRef.current = () => {
      const s = settingsRef.current;
      if (s.dpr !== lastDpr) {
        lastDpr = s.dpr;
        resize();
        return;
      }
      if (!raf) render();
      wake();
    };

    return () => {
      cancelAnimationFrame(raf);
      wakeRef.current = null;
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      document.documentElement.removeEventListener(
        'pointerleave',
        onPointerLeave
      );
      document.removeEventListener('visibilitychange', onVisibility);
      gl.deleteProgram(program.program);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
    };
  }, []);

  useEffect(() => {
    wakeRef.current?.();
  });

  return (
    <div
      ref={containerRef}
      className={['relative h-full w-full overflow-hidden', className]
        .filter(Boolean)
        .join(' ')}
      style={mixBlendMode ? { ...style, mixBlendMode } : style}
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

export default FluxLines;
