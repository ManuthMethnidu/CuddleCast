/**
 * M3 Expressive Dynamic Color Scheme Generator
 * Generates HCT-harmonized M3 Expressive tonal color schemes from any seed hex color.
 */

import { M3ColorScheme } from './m3-expressive';

// Hex to HSL helper
function hexToHsl(hex: string): [number, number, number] {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

// HSL to Hex helper
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Generates a full M3 Expressive Dark Color Scheme from a primary seed color.
 * Applies M3 Expressive harmonic tertiary shifts (+60° hue rotation)
 * and deep cinematic surface containers.
 */
export function generateM3ExpressiveDarkScheme(seedHex: string): M3ColorScheme {
  const [h, s] = hexToHsl(seedHex);

  // M3 Expressive Tertiary: Dynamic energetic complementary/analogous harmonic shift (+45° to +60°)
  const tertiaryH = (h + 55) % 360;

  // Surface hues subtly tinted by seed color for cohesion (low saturation ~8%)
  const surfaceH = h;

  return {
    primary: hslToHex(h, Math.min(s, 85), 65), // Lighter tone for dark mode
    onPrimary: hslToHex(h, Math.min(s, 95), 10),
    primaryContainer: hslToHex(h, Math.min(s, 85), 25),
    onPrimaryContainer: hslToHex(h, Math.min(s, 70), 90),

    secondary: hslToHex((h + 20) % 360, 20, 60),
    onSecondary: hslToHex((h + 20) % 360, 30, 10),
    secondaryContainer: hslToHex((h + 20) % 360, 15, 25),
    onSecondaryContainer: hslToHex((h + 20) % 360, 15, 88),

    tertiary: hslToHex(tertiaryH, 85, 70), // Playful, vibrant accent
    onTertiary: hslToHex(tertiaryH, 95, 12),
    tertiaryContainer: hslToHex(tertiaryH, 80, 28),
    onTertiaryContainer: hslToHex(tertiaryH, 75, 92),

    error: '#ffb4ab',
    onError: '#690005',
    errorContainer: '#93000a',
    onErrorContainer: '#ffdad6',

    background: hslToHex(surfaceH, 12, 11),
    onBackground: '#f3f3f3',

    surface: hslToHex(surfaceH, 10, 12),
    onSurface: '#f3f3f3',
    surfaceVariant: hslToHex(surfaceH, 14, 22),
    onSurfaceVariant: '#c4ccd6',

    // 5-Tier Surface Container Scale
    surfaceContainerLowest: hslToHex(surfaceH, 14, 8),
    surfaceContainerLow: hslToHex(surfaceH, 12, 11),
    surfaceContainer: hslToHex(surfaceH, 10, 14),
    surfaceContainerHigh: hslToHex(surfaceH, 10, 18),
    surfaceContainerHighest: hslToHex(surfaceH, 10, 23),

    outline: 'rgba(243, 243, 243, 0.16)',
    outlineVariant: 'rgba(243, 243, 243, 0.08)',
    scrim: '#000000',
    shadow: '#000000',

    inverseSurface: '#f3f3f3',
    inverseOnSurface: hslToHex(surfaceH, 10, 14),
    inversePrimary: hslToHex(h, Math.min(s, 85), 40),
  };
}
