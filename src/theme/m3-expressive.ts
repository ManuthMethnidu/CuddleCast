/**
 * Material 3 Expressive (M3 Expressive) Design System Tokens & Engine
 * Reference: https://m3.material.io/
 *
 * M3 Expressive expands Material Design 3 with:
 * 1. Emotion-Driven Dynamic Colors & 5-tier Surface Containers
 * 2. Dual Typography Scale (15 Baseline + 15 Emphasized styles)
 * 3. Expressive Shapes (Asymmetric geometry & pill morphing)
 * 4. Physics-Based Spring Motion (Snappy, Bouncy, Smooth with overshoot)
 * 5. Tonal 5-Tier Elevation
 */

export interface M3ColorScheme {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;

  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;

  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;

  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;

  background: string;
  onBackground: string;

  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;

  // 5-Tier Expressive Surface Container hierarchy
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;

  outline: string;
  outlineVariant: string;
  scrim: string;
  shadow: string;

  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;
}

/**
 * Default Cinema Dark M3 Expressive Palette (Echora Brand Base)
 */
export const defaultM3DarkScheme: M3ColorScheme = {
  primary: '#3e98e9', // Cerulean Blue
  onPrimary: '#001428',
  primaryContainer: '#004c82',
  onPrimaryContainer: '#d3e4fe',

  secondary: '#8895a0',
  onSecondary: '#08151d',
  secondaryContainer: '#3a4750',
  onSecondaryContainer: '#c2d0db',

  tertiary: '#ff6b8b', // Expressive Vibrant Rose
  onTertiary: '#460017',
  tertiaryContainer: '#6b102b',
  onTertiaryContainer: '#ffd9df',

  error: '#ffb4ab',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',

  background: '#191f26',
  onBackground: '#f3f3f3',

  surface: '#1b222a',
  onSurface: '#f3f3f3',
  surfaceVariant: '#303841',
  onSurfaceVariant: '#c4ccd6',

  surfaceContainerLowest: '#10151b',
  surfaceContainerLow: '#151b22',
  surfaceContainer: '#1e252e',
  surfaceContainerHigh: '#27303b',
  surfaceContainerHighest: '#333e4c',

  outline: 'rgba(243, 243, 243, 0.16)',
  outlineVariant: 'rgba(243, 243, 243, 0.08)',
  scrim: '#000000',
  shadow: '#000000',

  inverseSurface: '#f3f3f3',
  inverseOnSurface: '#1e252e',
  inversePrimary: '#1a6cb0',
};

/**
 * M3 Expressive Dual Typography Scale (15 Baseline + 15 Emphasized)
 */
export const m3Typography = {
  display: {
    large: {
      fontSize: '3.5625rem', // 57px
      lineHeight: '4rem', // 64px
      tracking: '-0.25px',
      baselineWeight: '400',
      emphasizedWeight: '700',
    },
    medium: {
      fontSize: '2.8125rem', // 45px
      lineHeight: '3.25rem', // 52px
      tracking: '0px',
      baselineWeight: '400',
      emphasizedWeight: '700',
    },
    small: {
      fontSize: '2.25rem', // 36px
      lineHeight: '2.75rem', // 44px
      tracking: '0px',
      baselineWeight: '400',
      emphasizedWeight: '700',
    },
  },
  headline: {
    large: {
      fontSize: '2rem', // 32px
      lineHeight: '2.5rem', // 40px
      tracking: '0px',
      baselineWeight: '400',
      emphasizedWeight: '600',
    },
    medium: {
      fontSize: '1.75rem', // 28px
      lineHeight: '2.25rem', // 36px
      tracking: '0px',
      baselineWeight: '400',
      emphasizedWeight: '600',
    },
    small: {
      fontSize: '1.5rem', // 24px
      lineHeight: '2rem', // 32px
      tracking: '0px',
      baselineWeight: '400',
      emphasizedWeight: '600',
    },
  },
  title: {
    large: {
      fontSize: '1.375rem', // 22px
      lineHeight: '1.75rem', // 28px
      tracking: '0px',
      baselineWeight: '400',
      emphasizedWeight: '600',
    },
    medium: {
      fontSize: '1rem', // 16px
      lineHeight: '1.5rem', // 24px
      tracking: '0.15px',
      baselineWeight: '500',
      emphasizedWeight: '700',
    },
    small: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.25rem', // 20px
      tracking: '0.1px',
      baselineWeight: '500',
      emphasizedWeight: '700',
    },
  },
  body: {
    large: {
      fontSize: '1rem', // 16px
      lineHeight: '1.5rem', // 24px
      tracking: '0.5px',
      baselineWeight: '400',
      emphasizedWeight: '600',
    },
    medium: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.25rem', // 20px
      tracking: '0.25px',
      baselineWeight: '400',
      emphasizedWeight: '600',
    },
    small: {
      fontSize: '0.75rem', // 12px
      lineHeight: '1rem', // 16px
      tracking: '0.4px',
      baselineWeight: '400',
      emphasizedWeight: '600',
    },
  },
  label: {
    large: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.25rem', // 20px
      tracking: '0.1px',
      baselineWeight: '500',
      emphasizedWeight: '700',
    },
    medium: {
      fontSize: '0.75rem', // 12px
      lineHeight: '1rem', // 16px
      tracking: '0.5px',
      baselineWeight: '500',
      emphasizedWeight: '700',
    },
    small: {
      fontSize: '0.6875rem', // 11px
      lineHeight: '1rem', // 16px
      tracking: '0.5px',
      baselineWeight: '500',
      emphasizedWeight: '700',
    },
  },
} as const;

/**
 * M3 Expressive Shape Tokens
 */
export const m3Shapes = {
  none: '0px',
  extraSmall: '4px',
  small: '8px',
  medium: '12px',
  large: '16px',
  extraLarge: '28px',
  full: '9999px',
  // Expressive asymmetric shape for cards & hero highlights
  expressiveHero: '28px 8px 28px 8px',
  expressiveCard: '20px 6px 20px 6px',
} as const;

/**
 * M3 Expressive Motion Tokens: Physics-Based Springs & Curves
 */
export const m3Motion = {
  springSnappy: 'cubic-bezier(0.2, 0.0, 0, 1.25)', // tactile micro-feedback
  springBouncy: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // expressive focal points
  springSmooth: 'cubic-bezier(0.16, 1, 0.3, 1)', // fluid layouts
  durationShort: '150ms',
  durationMedium: '250ms',
  durationLong: '400ms',
  durationExtraLong: '600ms',
} as const;

/**
 * M3 Expressive Elevation Tokens (5-tier)
 */
export const m3Elevation = {
  level0: 'none',
  level1: '0px 1px 3px 1px rgba(0, 0, 0, 0.25), 0px 1px 2px 0px rgba(0, 0, 0, 0.40)',
  level2: '0px 2px 6px 2px rgba(0, 0, 0, 0.25), 0px 1px 2px 0px rgba(0, 0, 0, 0.40)',
  level3: '0px 4px 8px 3px rgba(0, 0, 0, 0.30), 0px 1px 3px 0px rgba(0, 0, 0, 0.45)',
  level4: '0px 6px 10px 4px rgba(0, 0, 0, 0.30), 0px 2px 3px 0px rgba(0, 0, 0, 0.45)',
  level5: '0px 8px 12px 6px rgba(0, 0, 0, 0.35), 0px 4px 4px 0px rgba(0, 0, 0, 0.45)',
} as const;

/**
 * Injects M3 Expressive variables into the document root
 */
export function applyM3ColorScheme(scheme: M3ColorScheme, target: HTMLElement = document.documentElement) {
  target.style.setProperty('--md-sys-color-primary', scheme.primary);
  target.style.setProperty('--md-sys-color-on-primary', scheme.onPrimary);
  target.style.setProperty('--md-sys-color-primary-container', scheme.primaryContainer);
  target.style.setProperty('--md-sys-color-on-primary-container', scheme.onPrimaryContainer);

  target.style.setProperty('--md-sys-color-secondary', scheme.secondary);
  target.style.setProperty('--md-sys-color-on-secondary', scheme.onSecondary);
  target.style.setProperty('--md-sys-color-secondary-container', scheme.secondaryContainer);
  target.style.setProperty('--md-sys-color-on-secondary-container', scheme.onSecondaryContainer);

  target.style.setProperty('--md-sys-color-tertiary', scheme.tertiary);
  target.style.setProperty('--md-sys-color-on-tertiary', scheme.onTertiary);
  target.style.setProperty('--md-sys-color-tertiary-container', scheme.tertiaryContainer);
  target.style.setProperty('--md-sys-color-on-tertiary-container', scheme.onTertiaryContainer);

  target.style.setProperty('--md-sys-color-background', scheme.background);
  target.style.setProperty('--md-sys-color-on-background', scheme.onBackground);
  target.style.setProperty('--md-sys-color-surface', scheme.surface);
  target.style.setProperty('--md-sys-color-on-surface', scheme.onSurface);
  target.style.setProperty('--md-sys-color-surface-variant', scheme.surfaceVariant);
  target.style.setProperty('--md-sys-color-on-surface-variant', scheme.onSurfaceVariant);

  target.style.setProperty('--md-sys-color-surface-container-lowest', scheme.surfaceContainerLowest);
  target.style.setProperty('--md-sys-color-surface-container-low', scheme.surfaceContainerLow);
  target.style.setProperty('--md-sys-color-surface-container', scheme.surfaceContainer);
  target.style.setProperty('--md-sys-color-surface-container-high', scheme.surfaceContainerHigh);
  target.style.setProperty('--md-sys-color-surface-container-highest', scheme.surfaceContainerHighest);

  target.style.setProperty('--md-sys-color-outline', scheme.outline);
  target.style.setProperty('--md-sys-color-outline-variant', scheme.outlineVariant);
}
